// lib/IntegratedAgent.js

import RequirementsModule from "./RequirementsModule";
import CodeGenerationModule from "./CodeGenerationModule";
import AgentManager from "./AgentManager";
import { EventEmitter } from "./EventEmitter";
import fs from "fs/promises";
import path from "path";

/**
 * IntegratedAgent coordinates between different modules to facilitate
 * the end-to-end website generation process from requirements to
 * fully functional Next.js/React applications.
 */
class IntegratedAgent extends EventEmitter {
  /**
   * Create a new IntegratedAgent instance
   * @param {Object} config - Configuration options
   */
  constructor(config = {}) {
    super();

    // Core configuration
    this.config = {
      apiKey: process.env.ANTHROPIC_API_KEY || "",
      model: "claude-3-5-sonnet-20240620",
      outputDir: "./output/generated-website",
      projectRoot: process.cwd(),
      // Framework options
      framework: config.framework || "next",
      styling: config.styling || "tailwind",
      typescript: config.typescript !== undefined ? config.typescript : true,
      // Streaming configuration
      streaming: {
        enabled: true,
      },
      debug: false,
      ...config,
    };

    // Initialize the modules with our configuration
    this.requirementsModule = new RequirementsModule({
      apiKey: this.config.apiKey,
      model: this.config.model,
      outputDir: path.join(this.config.outputDir, "requirements"),
      debug: this.config.debug,
      streaming: this.config.streaming,
    });

    this.codeGenerationModule = new CodeGenerationModule({
      apiKey: this.config.apiKey,
      model: this.config.model,
      outputDir: path.join(this.config.outputDir, "code"),
      framework: this.config.framework,
      styling: this.config.styling,
      typescript: this.config.typescript,
      debug: this.config.debug,
      streaming: this.config.streaming,
    });

    this.agentManager = new AgentManager({
      apiKey: this.config.apiKey,
      projectRoot: this.config.projectRoot,
      outputDir: this.config.outputDir,
      debug: this.config.debug,
    });

    // Connect events between modules
    this._connectEvents();

    // Initialize state
    this.state = {
      requirements: null,
      designSystem: null,
      generatedCode: null,
      currentTask: null,
      status: "idle", // idle, processing, completed, error
      progress: 0,
      error: null,
      streamingData: new Map(),
    };

    this.log("IntegratedAgent initialized", "info");
  }

  /**
   * Connect event handlers between different modules
   * @private
   */
  _connectEvents() {
    // Connect RequirementsModule events
    this.requirementsModule.on("extraction:start", (data) => {
      this._updateState({
        status: "processing",
        progress: 10,
        currentTask: "requirements_extraction",
      });

      this.emit("status:update", {
        phase: "requirements",
        message: "Extracting requirements from user input...",
        progress: 10,
      });
    });

    this.requirementsModule.on("extraction:complete", (data) => {
      this._updateState({
        progress: 30,
        requirements: this.requirementsModule.requirements,
      });

      this.emit("status:update", {
        phase: "requirements",
        message: "Requirements extracted successfully",
        progress: 30,
      });

      this.emit("requirements:ready", this.requirementsModule.requirements);
    });

    this.requirementsModule.on("uml:complete", (data) => {
      this._updateState({
        progress: 40,
      });

      this.emit("status:update", {
        phase: "design",
        message: "UML diagrams created successfully",
        progress: 40,
      });
    });

    // Connect CodeGenerationModule events
    this.codeGenerationModule.on("structure:start", (data) => {
      this._updateState({
        progress: 45,
        currentTask: "project_structure",
      });

      this.emit("status:update", {
        phase: "code",
        message: "Generating project structure...",
        progress: 45,
      });
    });

    this.codeGenerationModule.on("structure:complete", (data) => {
      this._updateState({
        progress: 55,
      });

      this.emit("status:update", {
        phase: "code",
        message: "Project structure created with " + data.fileCount + " files",
        progress: 55,
      });
    });

    this.codeGenerationModule.on("project:start", (data) => {
      this._updateState({
        progress: 60,
        currentTask: "code_generation",
      });

      this.emit("status:update", {
        phase: "code",
        message: "Generating code files...",
        progress: 60,
      });
    });

    this.codeGenerationModule.on("project:progress", (data) => {
      // Calculate overall progress (60-90 range)
      const fileProgress = Math.min(data.progress, 100);
      const overallProgress = 60 + fileProgress * 0.3; // Maps 0-100 to 60-90

      this._updateState({
        progress: overallProgress,
      });

      this.emit("status:update", {
        phase: "code",
        message: `Generating file ${data.filesGenerated}/${data.totalFiles}: ${data.currentFile}`,
        progress: overallProgress,
      });
    });

    this.codeGenerationModule.on("project:complete", (data) => {
      this._updateState({
        progress: 90,
        generatedCode: {
          files: data.generatedFiles,
          manifest: data.manifest,
        },
      });

      this.emit("status:update", {
        phase: "code",
        message: "Code generation completed successfully",
        progress: 90,
      });

      this.emit("code:ready", {
        files: data.generatedFiles,
        manifest: data.manifest,
      });
    });

    // Connect streaming events
    this.requirementsModule.on("stream:update", (data) => {
      this.state.streamingData.set(data.streamId, data);
      this.emit("stream:update", data);
    });

    this.codeGenerationModule.on("stream:update", (data) => {
      this.state.streamingData.set(data.streamId, data);
      this.emit("stream:update", data);
    });

    // Connect error events
    this.requirementsModule.on("extraction:error", (error) => {
      this._handleError("requirements_extraction", error);
    });

    this.codeGenerationModule.on("project:error", (error) => {
      this._handleError("code_generation", error);
    });

    // Connect log events
    this.requirementsModule.on("log", (data) => {
      this.log(`[RequirementsModule] ${data.message}`, data.level);
    });

    this.codeGenerationModule.on("log", (data) => {
      this.log(`[CodeGenerationModule] ${data.message}`, data.level);
    });

    this.agentManager.on("log", (data) => {
      this.log(`[AgentManager] ${data.message}`, data.level);
    });
  }

  /**
   * Handle errors from any module
   * @param {string} phase - The phase where the error occurred
   * @param {Object} error - Error information
   * @private
   */
  _handleError(phase, error) {
    this._updateState({
      status: "error",
      error: {
        phase,
        message: error.message || error.error || "Unknown error",
        timestamp: new Date().toISOString(),
      },
    });

    this.log(`Error in ${phase}: ${error.message || error.error}`, "error");
    this.emit("error", {
      phase,
      message: error.message || error.error || "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Updates the internal state with new properties
   * @param {Object} newState - Partial state to update
   * @private
   */
  _updateState(newState) {
    this.state = { ...this.state, ...newState };
    this.emit("state:changed", this.getState());
  }

  /**
   * Start the website generation process with user requirements
   * @param {string} userInput - The user's description of the website
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} The result of the generation process
   */
  async generateWebsite(userInput, options = {}) {
    try {
      this._updateState({
        status: "processing",
        progress: 0,
        error: null,
      });

      // Create output directory if it doesn't exist
      await fs.mkdir(this.config.outputDir, { recursive: true });

      // 1. Extract requirements from user input
      this.log("Starting requirements extraction", "info");
      this.emit("status:update", {
        phase: "requirements",
        message: "Analyzing requirements...",
        progress: 5,
      });

      const requirements = await this.requirementsModule.extractRequirements(
        userInput,
        {
          streaming: this.config.streaming.enabled,
          saveToFile: true,
        }
      );

      // 2. Generate UML diagrams if requested
      if (options.generateUML !== false) {
        this.log("Generating UML diagrams", "info");
        this.emit("status:update", {
          phase: "design",
          message: "Creating UML diagrams...",
          progress: 35,
        });

        await this.requirementsModule.generateUMLDiagrams({
          streaming: this.config.streaming.enabled,
          saveToFile: true,
        });
      }

      // 3. Generate code based on requirements
      this.log("Starting code generation", "info");
      this.emit("status:update", {
        phase: "code",
        message: "Preparing code generation...",
        progress: 40,
      });

      const codeGenOptions = {
        streaming: this.config.streaming.enabled,
        saveToFileSystem: true,
        outputDir: path.join(this.config.outputDir, "website"),
        installDependencies: options.installDependencies !== false,
        startPreview: options.startPreview !== false,
        ...options,
      };

      const generatedCode = await this.codeGenerationModule.generateProject(
        requirements,
        codeGenOptions
      );

      // 4. Finalize and return results
      this._updateState({
        status: "completed",
        progress: 100,
        generatedCode: {
          files: generatedCode.generatedFiles,
          manifest: generatedCode.manifest,
        },
      });

      // Final status update
      this.emit("status:update", {
        phase: "complete",
        message: "Website generation completed successfully!",
        progress: 100,
      });

      // Emit generation completed event
      this.emit("generation:completed", {
        requirements,
        code: generatedCode,
        outputDir: path.join(this.config.outputDir, "website"),
      });

      return {
        success: true,
        requirements,
        code: generatedCode,
        outputDir: path.join(this.config.outputDir, "website"),
        previewUrl: generatedCode.manifest.previewUrl,
      };
    } catch (error) {
      this._updateState({
        status: "error",
        error: {
          message: error.message || "An unknown error occurred",
          stack: error.stack,
          timestamp: new Date().toISOString(),
        },
      });

      this.log(`Website generation failed: ${error.message}`, "error");

      this.emit("error", {
        message: error.message || "An unknown error occurred",
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });

      return {
        success: false,
        error: error.message || "An unknown error occurred",
      };
    }
  }

  /**
   * Get the current state of the agent
   * @returns {Object} Current state
   */
  getState() {
    return {
      ...this.state,
      // Don't include streaming data in state
      streamingData: undefined,
    };
  }

  /**
   * Get streaming data by ID
   * @param {string} streamId - The stream ID to retrieve
   * @returns {Object|null} The streaming data if found
   */
  getStreamingData(streamId) {
    return this.state.streamingData.get(streamId) || null;
  }

  /**
   * Cancel the current generation process
   * @returns {Promise<boolean>} Success status
   */
  async cancelGeneration() {
    this.log("Cancelling generation process", "info");

    try {
      // Attempt to cancel any ongoing tasks
      let cancelled = false;

      if (this.state.currentTask === "requirements_extraction") {
        // Currently no direct way to cancel in RequirementsModule
        cancelled = true;
      } else if (this.state.currentTask === "code_generation") {
        // Currently no direct way to cancel in CodeGenerationModule
        cancelled = true;
      }

      this._updateState({
        status: "idle",
        error: {
          message: "Generation was cancelled by user",
          timestamp: new Date().toISOString(),
        },
      });

      this.emit("generation:cancelled", {
        timestamp: new Date().toISOString(),
      });

      return true;
    } catch (error) {
      this.log(`Error during cancellation: ${error.message}`, "error");
      return false;
    }
  }

  /**
   * Clean up resources
   * @returns {Promise<void>}
   */
  async cleanup() {
    this.log("Cleaning up resources", "info");

    try {
      // Clean up any module resources
      if (this.agentManager) {
        await this.agentManager.cleanup();
      }

      this.emit("cleanup:complete");
    } catch (error) {
      this.log(`Cleanup error: ${error.message}`, "error");
    }
  }

  /**
   * Log a message with level
   * @param {string} message - The message to log
   * @param {string} level - The log level
   * @private
   */
  log(message, level = "info") {
    // Skip debug messages if debug mode is disabled
    if (level === "debug" && !this.config.debug) return;

    const timestamp = new Date().toISOString();

    // Format the log message
    const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] IntegratedAgent: ${message}`;

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
      module: "IntegratedAgent",
    });
  }
}

export default IntegratedAgent;
