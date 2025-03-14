// lib/IntegratedCodeGenerator.js
import { EventEmitter } from "./EventEmitter";
import RequirementsModule from "./RequirementsModule";
import CodeGenerationModule from "./CodeGenerationModule";
import CodeFixerModule from "./CodeFixerModule";
import path from "path";
import fs from "fs/promises";

/**
 * IntegratedCodeGenerator - Orchestrates the full code generation pipeline
 * from requirements gathering to deployment-ready, bug-free code.
 */
class IntegratedCodeGenerator extends EventEmitter {
  constructor(config = {}) {
    super();

    // Configuration with defaults
    this.config = {
      apiKey: process.env.ANTHROPIC_API_KEY || "",
      projectRoot: process.cwd(),
      outputDir: "./output/final-project",
      projectName: "generated-project",
      framework: "next",
      typescript: true,
      styling: "tailwind",
      autoFix: true,
      startPreview: true,
      ...config,
    };

    // Initialize modules
    this.requirements = new RequirementsModule({
      apiKey: this.config.apiKey,
      outputDir: path.join(this.config.projectRoot, "requirements"),
    });

    this.codeGen = new CodeGenerationModule({
      apiKey: this.config.apiKey,
      projectRoot: this.config.projectRoot,
      outputDir: path.join(this.config.projectRoot, "generated-code"),
      framework: this.config.framework,
      typescript: this.config.typescript,
      styling: this.config.styling,
    });

    this.codeFixer = new CodeFixerModule({
      apiKey: this.config.apiKey,
      projectRoot: this.config.projectRoot,
    });

    // Set up event handlers
    this.setupEventHandlers();

    this.log("IntegratedCodeGenerator initialized", "info");
  }

  /**
   * Set up event handlers for all modules
   * @private
   */
  setupEventHandlers() {
    // Requirements module events
    this.requirements.on("extraction:complete", (data) => {
      this.emit("requirements:extracted", data);
    });

    this.requirements.on("validation:complete", (data) => {
      this.emit("requirements:validated", data);
    });

    this.requirements.on("uml:complete", (data) => {
      this.emit("diagrams:generated", data);
    });

    // Code generation module events
    this.codeGen.on("structure:complete", (data) => {
      this.emit("structure:generated", data);
    });

    this.codeGen.on("file:complete", (data) => {
      this.emit("file:generated", data);
    });

    this.codeGen.on("project:complete", (data) => {
      this.emit("project:generated", data);
    });

    // Code fixer module events
    this.codeFixer.on("project:fix:complete", (data) => {
      this.emit("project:fixed", data);
    });

    // Stream progress events from all modules
    for (const module of [this.requirements, this.codeGen, this.codeFixer]) {
      module.on("stream:update", (data) => {
        this.emit("stream:update", {
          ...data,
          phase: this.determinePhaseFromStreamType(data.type),
        });
      });

      module.on("progress", (data) => {
        this.emit("progress", data);
      });

      module.on("log", (data) => {
        this.log(`[${data.module}] ${data.message}`, data.level);
      });
    }
  }

  /**
   * Generate code from natural language requirements
   * @param {string} userRequirements - The user's text requirements
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Result of code generation
   */
  async generateFromRequirements(userRequirements, options = {}) {
    try {
      this.log("Starting full code generation workflow", "info");

      // Step 1: Extract requirements
      this.log("Step 1: Extracting requirements...", "info");
      const extractedReqs = await this.requirements.extractRequirements(
        userRequirements,
        {
          streaming: true,
          saveToFile: true,
        }
      );

      // Step 2: Generate UML diagrams
      this.log("Step 2: Generating UML diagrams...", "info");
      const diagrams = await this.requirements.generateUMLDiagrams({
        streaming: true,
        render: true,
        saveToFile: true,
      });

      // Step 3: Generate project structure
      this.log("Step 3: Generating project structure...", "info");
      const projectStructure = await this.codeGen.generateProjectStructure(
        extractedReqs,
        { diagrams },
        { streaming: true }
      );

      // Step 4: Generate complete project
      this.log("Step 4: Generating complete project...", "info");
      const projectOutput = await this.codeGen.generateProject(extractedReqs, {
        projectName: options.projectName || this.config.projectName,
        streaming: true,
        saveToFileSystem: true,
        installDependencies: true,
        startPreview:
          options.startPreview !== undefined
            ? options.startPreview
            : this.config.startPreview,
      });

      // Step 5: Fix code issues if enabled
      let fixResults = null;
      if (this.config.autoFix) {
        this.log("Step 5: Fixing code issues...", "info");
        const projectDir =
          options.outputDir ||
          path.join(this.config.projectRoot, "generated-code");

        fixResults = await this.codeFixer.fixProject(projectDir, {
          streaming: true,
        });

        this.log(
          `Fixed ${fixResults.summary.filesFixed} files with issues`,
          "info"
        );
      }

      // Copy to final output directory if different from generation directory
      const generatedDir = path.join(this.config.projectRoot, "generated-code");
      const finalDir = path.join(
        this.config.projectRoot,
        this.config.outputDir
      );

      if (generatedDir !== finalDir) {
        await this.copyDirectory(generatedDir, finalDir);
        this.log(`Copied final project to ${finalDir}`, "info");
      }

      return {
        success: true,
        requirements: extractedReqs,
        diagrams,
        projectStructure,
        generatedFiles: projectOutput.generatedFiles,
        fixResults,
        outputDir: finalDir,
        previewUrl: projectOutput.manifest.previewUrl,
      };
    } catch (error) {
      this.log(`Code generation failed: ${error.message}`, "error");

      // Emit error event
      this.emit("error", {
        phase: "code_generation",
        error: error.message,
        stack: error.stack,
      });

      throw error;
    }
  }

  /**
   * Copy a directory recursively
   * @param {string} src - Source directory
   * @param {string} dest - Destination directory
   * @returns {Promise<void>}
   * @private
   */
  async copyDirectory(src, dest) {
    await fs.mkdir(dest, { recursive: true });

    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  /**
   * Determine the phase from a stream type
   * @param {string} streamType - The stream type
   * @returns {string} The corresponding phase
   * @private
   */
  determinePhaseFromStreamType(streamType) {
    const phaseMap = {
      requirements_extraction: "requirements",
      requirements_validation: "requirements",
      uml_generation: "design",
      project_structure: "design",
      file_generation: "code_generation",
      project_generation: "code_generation",
      file_analysis: "code_fixing",
      file_fix: "code_fixing",
      project_fix: "code_fixing",
    };

    return phaseMap[streamType] || "unknown";
  }

  /**
   * Log a message with level
   * @param {string} message - The message to log
   * @param {string} level - The log level
   * @private
   */
  log(message, level = "info") {
    const timestamp = new Date().toISOString();

    // Format the log message
    const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] IntegratedCodeGenerator: ${message}`;

    // Output based on level
    switch (level) {
      case "error":
        console.error(formattedMessage);
        break;
      case "warn":
        console.warn(formattedMessage);
        break;
      case "debug":
        console.debug(formattedMessage);
        break;
      case "info":
      default:
        console.log(formattedMessage);
    }

    // Emit log event
    this.emit("log", {
      timestamp,
      level,
      message,
      module: "IntegratedCodeGenerator",
    });
  }

  /**
   * Clean up resources when finished
   */
  async cleanup() {
    // Clean up each module
    await Promise.all([
      this.requirements.cleanup && this.requirements.cleanup(),
      this.codeGen.cleanup && this.codeGen.cleanup(),
      this.codeFixer.cleanup && this.codeFixer.cleanup(),
    ]);

    this.log("Resources cleaned up", "info");
  }
}

export default IntegratedCodeGenerator;
