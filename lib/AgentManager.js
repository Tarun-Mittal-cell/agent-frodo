// lib/AgentManager.js
import { EventEmitter } from "./EventEmitter";
import RequirementsModule from "./RequirementsModule";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import axios from "axios";

/**
 * AgentManager - Orchestrates the entire AI coding system workflow,
 * coordinating between requirements, design, code generation, and testing modules.
 *
 * This class serves as the central controller for the autonomous development process,
 * managing state transitions, module communication, and providing a unified interface.
 */
class AgentManager extends EventEmitter {
  /**
   * Create a new AgentManager instance
   * @param {Object} config - Configuration options
   */
  constructor(config = {}) {
    super();

    // Core configuration
    this.config = {
      projectRoot: process.cwd(),
      apiKey: process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY || "",
      model: "claude-3-opus-20240229",
      outputDir: "./output",
      debug: false,
      autoSave: true,
      maxConcurrentTasks: 2,
      progressUpdateInterval: 1000, // ms
      timeoutConfig: {
        requirements: 300000, // 5 minutes
        design: 300000, // 5 minutes
        codegen: 600000, // 10 minutes
        testing: 300000, // 5 minutes
      },
      // Paths for data storage
      dataDir: "./agent-memory",
      requirementsDir: "./agent-memory/requirements",
      designDir: "./agent-memory/design",
      codegenDir: "./agent-memory/codegen",
      testingDir: "./agent-memory/testing",
      // Workflow configuration
      workflow: {
        autoProgressEnabled: true,
        requireValidation: true,
        designReviewRequired: true,
        testAfterCodegen: true,
        deployAfterTests: false,
      },
      ...config,
    };

    // Initialize modules
    this.modules = {
      requirements: null,
      design: null,
      codegen: null,
      testing: null,
    };

    // Set up state management
    this.state = {
      initialized: false,
      currentPhase: "idle", // idle, requirements, design, codegen, testing, complete
      phasesCompleted: {
        requirements: false,
        design: false,
        codegen: false,
        testing: false,
      },
      error: null,
      startTime: null,
      lastUpdateTime: null,
      activeTasks: new Map(), // Track currently running tasks
      progressHistory: [], // Track progress history for analytics
    };

    // Project data
    this.projectData = {
      id: crypto.randomUUID(),
      name: config.projectName || "New Project",
      description: config.projectDescription || "",
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: null,
        createdBy: config.userId || "system",
      },
      requirements: null,
      design: null,
      codeArtifacts: [],
    };

    // Cache for optimizations
    this.cache = {
      moduleOutputs: new Map(),
      generatedFiles: new Map(),
      fileContents: new Map(),
    };

    // Active workers
    this.workers = {
      progressReporter: null,
      autoSaveTimer: null,
    };

    // Shared resources for modules
    this.sharedResources = {
      httpClient: axios.create({
        timeout: 30000,
        headers: { "User-Agent": "AI-Agent-Manager/1.0" },
      }),
      tools: {},
    };

    // Set up logging
    this.debug = config.debug || false;
    this.log("AgentManager initialized", "info");
  }

  /**
   * Initialize the agent manager and all required modules
   * @param {Object} options - Initialization options
   * @returns {Promise<Object>} Initialization status
   */
  async initialize(options = {}) {
    if (this.state.initialized) {
      this.log("AgentManager already initialized", "warn");
      return { success: true, status: "already_initialized" };
    }

    try {
      this.log("Initializing AgentManager", "info");

      // Update configuration with runtime options
      if (options.apiKey) this.config.apiKey = options.apiKey;
      if (options.projectRoot) this.config.projectRoot = options.projectRoot;

      // Set project name if provided
      if (options.projectName) {
        this.projectData.name = options.projectName;
        this.projectData.metadata.updatedAt = new Date().toISOString();
      }

      // Create required directories
      await this.createDirectories();

      // Initialize the RequirementsModule
      this.modules.requirements = new RequirementsModule({
        apiKey: this.config.apiKey,
        model: this.config.model,
        outputDir: this.config.requirementsDir,
        debug: this.config.debug,
      });

      // Set up event listeners for the RequirementsModule
      this.setupRequirementsModuleListeners();

      // Initialize other modules when they are implemented
      // this.modules.design = await this.initializeDesignModule();
      // this.modules.codegen = await this.initializeCodeGenModule();
      // this.modules.testing = await this.initializeTestingModule();

      // Set up auto-save if enabled
      if (this.config.autoSave) {
        this.startAutoSave();
      }

      // Mark as initialized
      this.state.initialized = true;
      this.state.startTime = new Date();
      this.state.lastUpdateTime = new Date();

      // Emit initialization event
      this.emit("initialized", {
        timestamp: new Date().toISOString(),
        projectId: this.projectData.id,
        projectName: this.projectData.name,
      });

      return {
        success: true,
        projectId: this.projectData.id,
        projectName: this.projectData.name,
        modules: {
          requirements: !!this.modules.requirements,
          design: !!this.modules.design,
          codegen: !!this.modules.codegen,
          testing: !!this.modules.testing,
        },
      };
    } catch (error) {
      this.state.error = {
        phase: "initialization",
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      };

      this.log(`Initialization failed: ${error.message}`, "error");

      // Emit error event
      this.emit("error", {
        phase: "initialization",
        error: error.message,
        timestamp: new Date().toISOString(),
      });

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Create the required directories for data storage
   * @returns {Promise<void>}
   * @private
   */
  async createDirectories() {
    const directories = [
      this.config.dataDir,
      this.config.requirementsDir,
      this.config.designDir,
      this.config.codegenDir,
      this.config.testingDir,
      this.config.outputDir,
    ];

    for (const dir of directories) {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (error) {
        if (error.code !== "EEXIST") {
          throw new Error(
            `Failed to create directory ${dir}: ${error.message}`
          );
        }
      }
    }

    this.log("Data directories created", "debug");
  }

  /**
   * Set up event listeners for the RequirementsModule
   * @private
   */
  setupRequirementsModuleListeners() {
    if (!this.modules.requirements) return;

    // Listen for requirements extraction events
    this.modules.requirements.on("extraction:start", (data) => {
      this.log("Requirements extraction started", "info");
      this.updateProgress("requirements", "extracting", 5);
      this.emit("requirements:extraction:start", {
        ...data,
        timestamp: new Date().toISOString(),
      });
    });

    this.modules.requirements.on("extraction:complete", (data) => {
      this.log(
        `Requirements extraction completed: ${data.requirementsCount} requirements extracted`,
        "info"
      );
      this.updateProgress("requirements", "extracted", 40);
      this.emit("requirements:extraction:complete", {
        ...data,
        timestamp: new Date().toISOString(),
      });

      // Auto-progress to validation if configured
      if (
        this.config.workflow.autoProgressEnabled &&
        this.config.workflow.requireValidation
      ) {
        this.validateRequirements().catch((err) => {
          this.log(`Auto-validation failed: ${err.message}`, "error");
        });
      }
    });

    this.modules.requirements.on("extraction:error", (data) => {
      this.log(`Requirements extraction error: ${data.error}`, "error");
      this.state.error = {
        phase: "requirements_extraction",
        message: data.error,
        timestamp: new Date().toISOString(),
      };

      this.emit("requirements:extraction:error", {
        ...data,
        timestamp: new Date().toISOString(),
      });
    });

    // Listen for requirements validation events
    this.modules.requirements.on("validation:start", (data) => {
      this.log("Requirements validation started", "info");
      this.updateProgress("requirements", "validating", 45);
      this.emit("requirements:validation:start", {
        ...data,
        timestamp: new Date().toISOString(),
      });
    });

    this.modules.requirements.on("validation:complete", (data) => {
      this.log(`Requirements validation completed: ${data.status}`, "info");
      this.updateProgress("requirements", "validated", 80);
      this.emit("requirements:validation:complete", {
        ...data,
        timestamp: new Date().toISOString(),
      });

      // Mark requirements phase as complete
      this.state.phasesCompleted.requirements = true;

      // Auto-progress to design phase if configured
      if (this.config.workflow.autoProgressEnabled && this.modules.design) {
        this.startDesignPhase().catch((err) => {
          this.log(
            `Auto-progress to design phase failed: ${err.message}`,
            "error"
          );
        });
      }
    });

    // Listen for UML generation events
    this.modules.requirements.on("uml:start", (data) => {
      this.log("UML generation started", "info");
      this.updateProgress("requirements", "generating_uml", 85);
      this.emit("requirements:uml:start", {
        ...data,
        timestamp: new Date().toISOString(),
      });
    });

    this.modules.requirements.on("uml:complete", (data) => {
      this.log(`UML generation completed: ${data.diagrams.join(", ")}`, "info");
      this.updateProgress("requirements", "completed", 100);
      this.emit("requirements:uml:complete", {
        ...data,
        timestamp: new Date().toISOString(),
      });
    });

    // Listen for streaming events
    this.modules.requirements.on("stream:update", (data) => {
      // Forward stream updates to clients
      this.emit("stream:update", {
        ...data,
        moduleType: "requirements",
        timestamp: new Date().toISOString(),
      });
    });

    this.modules.requirements.on("stream:complete", (data) => {
      // Forward stream completion to clients
      this.emit("stream:complete", {
        ...data,
        moduleType: "requirements",
        timestamp: new Date().toISOString(),
      });
    });

    // Listen for log events
    this.modules.requirements.on("log", (data) => {
      if (this.debug || data.level === "error" || data.level === "warn") {
        this.log(`[RequirementsModule] ${data.message}`, data.level);
      }
    });
  }

  /**
   * Start the requirements gathering phase
   * @param {string} userInput - The user's input describing requirements
   * @param {Object} options - Options for requirements extraction
   * @returns {Promise<Object>} The extracted requirements
   */
  async extractRequirements(userInput, options = {}) {
    if (!this.state.initialized) {
      throw new Error("AgentManager must be initialized first");
    }

    if (!this.modules.requirements) {
      throw new Error("RequirementsModule not initialized");
    }

    try {
      this.log("Starting requirements extraction", "info");

      // Update state
      this.state.currentPhase = "requirements";
      this.state.lastUpdateTime = new Date();

      // Create a task ID for tracking
      const taskId = crypto.randomUUID();

      // Track this task
      this.state.activeTasks.set(taskId, {
        type: "requirements_extraction",
        startTime: new Date(),
        status: "in_progress",
        progress: 0,
      });

      // Set up a timeout if configured
      let timeoutId = null;
      if (this.config.timeoutConfig.requirements > 0) {
        timeoutId = setTimeout(() => {
          // Handle timeout
          const task = this.state.activeTasks.get(taskId);
          if (task && task.status === "in_progress") {
            this.log("Requirements extraction timed out", "error");
            this.state.activeTasks.set(taskId, {
              ...task,
              status: "timeout",
              endTime: new Date(),
            });

            this.emit("timeout", {
              phase: "requirements",
              taskId,
              duration: Date.now() - task.startTime.getTime(),
              timestamp: new Date().toISOString(),
            });
          }
        }, this.config.timeoutConfig.requirements);
      }

      // Extract requirements
      const requirements = await this.modules.requirements.extractRequirements(
        userInput,
        {
          streaming: options.streaming !== false,
          saveToFile: options.saveToFile !== false,
          ...options,
        }
      );

      // Cancel timeout
      if (timeoutId) clearTimeout(timeoutId);

      // Update task status
      this.state.activeTasks.set(taskId, {
        type: "requirements_extraction",
        startTime: this.state.activeTasks.get(taskId).startTime,
        endTime: new Date(),
        status: "completed",
        progress: 100,
      });

      // Store the requirements in project data
      this.projectData.requirements = requirements;
      this.projectData.metadata.updatedAt = new Date().toISOString();

      // Save project data if auto-save is enabled
      if (this.config.autoSave) {
        await this.saveProjectData();
      }

      this.log("Requirements extraction completed", "info");

      return {
        success: true,
        requirements,
        taskId,
        projectId: this.projectData.id,
      };
    } catch (error) {
      this.state.error = {
        phase: "requirements_extraction",
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      };

      this.log(`Requirements extraction failed: ${error.message}`, "error");

      // Emit error event
      this.emit("error", {
        phase: "requirements_extraction",
        error: error.message,
        timestamp: new Date().toISOString(),
      });

      throw error;
    }
  }

  /**
   * Validate the extracted requirements
   * @param {Object} options - Options for requirements validation
   * @returns {Promise<Object>} The validation results
   */
  async validateRequirements(options = {}) {
    if (!this.state.initialized) {
      throw new Error("AgentManager must be initialized first");
    }

    if (!this.modules.requirements) {
      throw new Error("RequirementsModule not initialized");
    }

    if (!this.projectData.requirements) {
      throw new Error("Requirements must be extracted first");
    }

    try {
      this.log("Starting requirements validation", "info");

      // Create a task ID for tracking
      const taskId = crypto.randomUUID();

      // Track this task
      this.state.activeTasks.set(taskId, {
        type: "requirements_validation",
        startTime: new Date(),
        status: "in_progress",
        progress: 0,
      });

      // Set up a timeout if configured
      let timeoutId = null;
      if (this.config.timeoutConfig.requirements > 0) {
        timeoutId = setTimeout(() => {
          // Handle timeout
          const task = this.state.activeTasks.get(taskId);
          if (task && task.status === "in_progress") {
            this.log("Requirements validation timed out", "error");
            this.state.activeTasks.set(taskId, {
              ...task,
              status: "timeout",
              endTime: new Date(),
            });

            this.emit("timeout", {
              phase: "requirements_validation",
              taskId,
              duration: Date.now() - task.startTime.getTime(),
              timestamp: new Date().toISOString(),
            });
          }
        }, this.config.timeoutConfig.requirements);
      }

      // Validate requirements
      const validationResults =
        await this.modules.requirements.validateRequirements({
          streaming: options.streaming !== false,
          applyFixes: options.applyFixes !== false,
          ...options,
        });

      // Cancel timeout
      if (timeoutId) clearTimeout(timeoutId);

      // Update task status
      this.state.activeTasks.set(taskId, {
        type: "requirements_validation",
        startTime: this.state.activeTasks.get(taskId).startTime,
        endTime: new Date(),
        status: "completed",
        progress: 100,
      });

      this.log("Requirements validation completed", "info");

      return {
        success: true,
        validationResults,
        taskId,
        projectId: this.projectData.id,
      };
    } catch (error) {
      this.state.error = {
        phase: "requirements_validation",
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      };

      this.log(`Requirements validation failed: ${error.message}`, "error");

      // Emit error event
      this.emit("error", {
        phase: "requirements_validation",
        error: error.message,
        timestamp: new Date().toISOString(),
      });

      throw error;
    }
  }

  /**
   * Generate UML diagrams from requirements
   * @param {Object} options - Options for UML generation
   * @returns {Promise<Object>} The generated UML diagrams
   */
  async generateUMLDiagrams(options = {}) {
    if (!this.state.initialized) {
      throw new Error("AgentManager must be initialized first");
    }

    if (!this.modules.requirements) {
      throw new Error("RequirementsModule not initialized");
    }

    if (!this.projectData.requirements) {
      throw new Error("Requirements must be extracted first");
    }

    try {
      this.log("Starting UML diagram generation", "info");

      // Create a task ID for tracking
      const taskId = crypto.randomUUID();

      // Track this task
      this.state.activeTasks.set(taskId, {
        type: "uml_generation",
        startTime: new Date(),
        status: "in_progress",
        progress: 0,
      });

      // Set up a timeout if configured
      let timeoutId = null;
      if (this.config.timeoutConfig.design > 0) {
        timeoutId = setTimeout(() => {
          // Handle timeout
          const task = this.state.activeTasks.get(taskId);
          if (task && task.status === "in_progress") {
            this.log("UML generation timed out", "error");
            this.state.activeTasks.set(taskId, {
              ...task,
              status: "timeout",
              endTime: new Date(),
            });

            this.emit("timeout", {
              phase: "uml_generation",
              taskId,
              duration: Date.now() - task.startTime.getTime(),
              timestamp: new Date().toISOString(),
            });
          }
        }, this.config.timeoutConfig.design);
      }

      // Generate UML diagrams
      const umlDiagrams = await this.modules.requirements.generateUMLDiagrams({
        streaming: options.streaming !== false,
        render: options.render !== false,
        outputFormat: options.outputFormat || "svg",
        saveToFile: options.saveToFile !== false,
        ...options,
      });

      // Cancel timeout
      if (timeoutId) clearTimeout(timeoutId);

      // Update task status
      this.state.activeTasks.set(taskId, {
        type: "uml_generation",
        startTime: this.state.activeTasks.get(taskId).startTime,
        endTime: new Date(),
        status: "completed",
        progress: 100,
      });

      // Store UML diagrams in project data
      if (!this.projectData.design) {
        this.projectData.design = { diagrams: {} };
      } else if (!this.projectData.design.diagrams) {
        this.projectData.design.diagrams = {};
      }

      this.projectData.design.diagrams = {
        ...this.projectData.design.diagrams,
        uml: {
          classDiagram: umlDiagrams.classDiagram ? true : false,
          sequenceDiagram: umlDiagrams.sequenceDiagram ? true : false,
          generatedAt: new Date().toISOString(),
        },
      };

      this.projectData.metadata.updatedAt = new Date().toISOString();

      // Save project data if auto-save is enabled
      if (this.config.autoSave) {
        await this.saveProjectData();
      }

      this.log("UML diagram generation completed", "info");

      return {
        success: true,
        umlDiagrams,
        taskId,
        projectId: this.projectData.id,
      };
    } catch (error) {
      this.state.error = {
        phase: "uml_generation",
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      };

      this.log(`UML diagram generation failed: ${error.message}`, "error");

      // Emit error event
      this.emit("error", {
        phase: "uml_generation",
        error: error.message,
        timestamp: new Date().toISOString(),
      });

      throw error;
    }
  }

  /**
   * Generate user stories from requirements
   * @param {Object} options - Options for user story generation
   * @returns {Promise<Object>} The generated user stories
   */
  async generateUserStories(options = {}) {
    if (!this.state.initialized) {
      throw new Error("AgentManager must be initialized first");
    }

    if (!this.modules.requirements) {
      throw new Error("RequirementsModule not initialized");
    }

    if (!this.projectData.requirements) {
      throw new Error("Requirements must be extracted first");
    }

    try {
      this.log("Starting user story generation", "info");

      // Create a task ID for tracking
      const taskId = crypto.randomUUID();

      // Track this task
      this.state.activeTasks.set(taskId, {
        type: "user_story_generation",
        startTime: new Date(),
        status: "in_progress",
        progress: 0,
      });

      // Generate user stories
      const userStories = await this.modules.requirements.generateUserStories({
        streaming: options.streaming !== false,
        saveToFile: options.saveToFile !== false,
        ...options,
      });

      // Update task status
      this.state.activeTasks.set(taskId, {
        type: "user_story_generation",
        startTime: this.state.activeTasks.get(taskId).startTime,
        endTime: new Date(),
        status: "completed",
        progress: 100,
      });

      // Update project data
      this.projectData.requirements.userStories = userStories;
      this.projectData.metadata.updatedAt = new Date().toISOString();

      // Save project data if auto-save is enabled
      if (this.config.autoSave) {
        await this.saveProjectData();
      }

      this.log("User story generation completed", "info");

      return {
        success: true,
        userStories,
        taskId,
        projectId: this.projectData.id,
      };
    } catch (error) {
      this.state.error = {
        phase: "user_story_generation",
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      };

      this.log(`User story generation failed: ${error.message}`, "error");

      // Emit error event
      this.emit("error", {
        phase: "user_story_generation",
        error: error.message,
        timestamp: new Date().toISOString(),
      });

      throw error;
    }
  }

  /**
   * Export requirements to a specific format
   * @param {string} format - The format to export to (json, markdown, html, csv)
   * @param {Object} options - Export options
   * @returns {Promise<Object>} Export result
   */
  async exportRequirements(format = "json", options = {}) {
    if (!this.state.initialized) {
      throw new Error("AgentManager must be initialized first");
    }

    if (!this.modules.requirements) {
      throw new Error("RequirementsModule not initialized");
    }

    if (!this.projectData.requirements) {
      throw new Error("Requirements must be extracted first");
    }

    try {
      this.log(`Exporting requirements to ${format} format`, "info");

      // Export requirements
      const exportContent = await this.modules.requirements.exportRequirements(
        format,
        {
          saveToFile: true,
          filePath:
            options.filePath ||
            path.join(this.config.outputDir, `requirements.${format}`),
          ...options,
        }
      );

      this.log("Requirements exported successfully", "info");

      return {
        success: true,
        format,
        exportContent,
        projectId: this.projectData.id,
      };
    } catch (error) {
      this.log(`Requirements export failed: ${error.message}`, "error");

      // Emit error event
      this.emit("error", {
        phase: "requirements_export",
        error: error.message,
        timestamp: new Date().toISOString(),
      });

      throw error;
    }
  }

  /**
   * Start the design phase after requirements
   * This is a placeholder for future implementation
   * @param {Object} options - Design phase options
   * @returns {Promise<Object>} Design phase result
   */
  async startDesignPhase(options = {}) {
    if (!this.state.initialized) {
      throw new Error("AgentManager must be initialized first");
    }

    if (!this.state.phasesCompleted.requirements) {
      throw new Error("Requirements phase must be completed first");
    }

    if (!this.modules.design) {
      this.log("Design module not yet implemented", "warn");
      return {
        success: false,
        message: "Design module not yet implemented",
      };
    }

    try {
      this.log("Starting design phase", "info");

      // Update state
      this.state.currentPhase = "design";
      this.state.lastUpdateTime = new Date();

      // In a real implementation, this would start the design phase processing
      // using the design module...

      this.log("Design phase implementation pending", "info");

      return {
        success: true,
        message: "Design phase not yet implemented",
        projectId: this.projectData.id,
      };
    } catch (error) {
      this.state.error = {
        phase: "design",
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      };

      this.log(`Design phase failed: ${error.message}`, "error");

      // Emit error event
      this.emit("error", {
        phase: "design",
        error: error.message,
        timestamp: new Date().toISOString(),
      });

      throw error;
    }
  }

  /**
   * Get the current status of the agent and all modules
   * @returns {Object} Current status
   */
  getStatus() {
    return {
      initialized: this.state.initialized,
      currentPhase: this.state.currentPhase,
      phasesCompleted: this.state.phasesCompleted,
      error: this.state.error,
      modules: {
        requirements: this.modules.requirements ? true : false,
        design: this.modules.design ? true : false,
        codegen: this.modules.codegen ? true : false,
        testing: this.modules.testing ? true : false,
      },
      projectData: {
        id: this.projectData.id,
        name: this.projectData.name,
        description: this.projectData.description,
        createdAt: this.projectData.metadata.createdAt,
        updatedAt: this.projectData.metadata.updatedAt,
        hasRequirements: !!this.projectData.requirements,
        hasDesign: !!this.projectData.design,
        codeArtifactsCount: this.projectData.codeArtifacts.length,
      },
      activeTasks: Array.from(this.state.activeTasks.entries()).map(
        ([id, task]) => ({
          id,
          type: task.type,
          status: task.status,
          progress: task.progress,
          startTime: task.startTime,
          endTime: task.endTime || null,
        })
      ),
      runtime: {
        uptime: this.state.startTime
          ? Date.now() - this.state.startTime.getTime()
          : 0,
        lastUpdate: this.state.lastUpdateTime || null,
      },
    };
  }

  /**
   * Save project data to file
   * @param {string} [filePath] - Optional custom file path
   * @returns {Promise<string>} Path to the saved file
   */
  async saveProjectData(filePath) {
    const outputPath =
      filePath ||
      path.join(this.config.dataDir, `project-${this.projectData.id}.json`);

    try {
      // Ensure output directory exists
      await fs.mkdir(path.dirname(outputPath), { recursive: true });

      // Prepare data for saving
      const dataToSave = {
        projectData: this.projectData,
        state: {
          phasesCompleted: this.state.phasesCompleted,
          currentPhase: this.state.currentPhase,
        },
      };

      // Write to file
      await fs.writeFile(
        outputPath,
        JSON.stringify(dataToSave, null, 2),
        "utf8"
      );

      this.log(`Project data saved to ${outputPath}`, "debug");
      return outputPath;
    } catch (error) {
      this.log(`Failed to save project data: ${error.message}`, "error");
      throw new Error(`Failed to save project data: ${error.message}`);
    }
  }

  /**
   * Load project data from file
   * @param {string} filePath - Path to the project data file
   * @returns {Promise<Object>} Loaded project data
   */
  async loadProjectData(filePath) {
    try {
      // Read the file
      const fileContent = await fs.readFile(filePath, "utf8");

      // Parse the JSON
      const data = JSON.parse(fileContent);

      // Validate the structure
      if (!data.projectData) {
        throw new Error("Invalid project data file format");
      }

      // Update the project data and state
      this.projectData = data.projectData;

      if (data.state) {
        this.state.phasesCompleted =
          data.state.phasesCompleted || this.state.phasesCompleted;
        this.state.currentPhase =
          data.state.currentPhase || this.state.currentPhase;
      }

      // Load requirements if available
      if (this.projectData.requirements && this.modules.requirements) {
        this.modules.requirements.requirements = this.projectData.requirements;

        // Update counters in the requirements module
        this.modules.requirements.updateCountersFromRequirements();
      }

      this.log(`Project data loaded from ${filePath}`, "info");

      // Emit load event
      this.emit("project:loaded", {
        projectId: this.projectData.id,
        timestamp: new Date().toISOString(),
      });

      return this.projectData;
    } catch (error) {
      this.log(`Failed to load project data: ${error.message}`, "error");
      throw new Error(`Failed to load project data: ${error.message}`);
    }
  }

  /**
   * Start auto-save for project data
   * @param {number} [interval=60000] - Interval in milliseconds (default: 1 minute)
   * @private
   */
  startAutoSave(interval = 60000) {
    // Clear existing timer if any
    if (this.workers.autoSaveTimer) {
      clearInterval(this.workers.autoSaveTimer);
    }

    // Set up auto-save interval
    this.workers.autoSaveTimer = setInterval(async () => {
      try {
        await this.saveProjectData();
      } catch (error) {
        this.log(`Auto-save failed: ${error.message}`, "error");
      }
    }, interval);

    this.log(`Auto-save started with interval of ${interval}ms`, "debug");
  }

  /**
   * Update progress for a specific phase
   * @param {string} phase - The phase to update
   * @param {string} status - The status description
   * @param {number} percentage - Progress percentage (0-100)
   * @private
   */
  updateProgress(phase, status, percentage) {
    // Record this progress update
    this.state.progressHistory.push({
      phase,
      status,
      percentage,
      timestamp: new Date().toISOString(),
    });

    // Update the last update time
    this.state.lastUpdateTime = new Date();

    // Emit progress event
    this.emit("progress", {
      phase,
      status,
      percentage,
      timestamp: new Date().toISOString(),
      projectId: this.projectData.id,
    });
  }

  /**
   * Clean up resources when shutting down
   * @returns {Promise<void>}
   */
  async cleanup() {
    this.log("Cleaning up resources", "info");

    // Clear timers
    if (this.workers.autoSaveTimer) {
      clearInterval(this.workers.autoSaveTimer);
      this.workers.autoSaveTimer = null;
    }

    if (this.workers.progressReporter) {
      clearInterval(this.workers.progressReporter);
      this.workers.progressReporter = null;
    }

    // Perform final save
    if (this.config.autoSave && this.state.initialized) {
      try {
        await this.saveProjectData();
      } catch (error) {
        this.log(`Final save failed: ${error.message}`, "error");
      }
    }

    // Clean up module resources
    for (const [name, module] of Object.entries(this.modules)) {
      if (module && typeof module.cleanup === "function") {
        try {
          await module.cleanup();
          this.log(`Cleaned up ${name} module`, "debug");
        } catch (error) {
          this.log(
            `Failed to clean up ${name} module: ${error.message}`,
            "error"
          );
        }
      }
    }

    // Clear state
    this.state.initialized = false;
    this.state.activeTasks.clear();

    this.log("Cleanup completed", "info");

    // Emit cleanup event
    this.emit("cleanup", {
      timestamp: new Date().toISOString(),
      projectId: this.projectData.id,
    });
  }

  /**
   * Log a message with level
   * @param {string} message - The message to log
   * @param {string} level - The log level
   * @private
   */
  log(message, level = "info") {
    // Skip debug messages if debug mode is disabled
    if (level === "debug" && !this.debug) return;

    const timestamp = new Date().toISOString();

    // Format the log message
    const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] AgentManager: ${message}`;

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
      module: "AgentManager",
    });
  }
}

export default AgentManager;
