// lib/AgentManager.js
import { EventEmitter } from "./EventEmitter";
import RequirementsModule from "./RequirementsModule";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import axios from "axios";

/**
 * AgentManager - Central controller for the AI coding system workflow.
 * Manages requirements gathering, design, code generation, and testing phases.
 * Provides real-time streaming updates, error handling, and state persistence.
 */
class AgentManager extends EventEmitter {
  /**
   * Constructs a new AgentManager instance with customizable configuration.
   * @param {Object} config - Configuration options for the agent.
   */
  constructor(config = {}) {
    super();

    // Core configuration with defaults
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
      dataDir: "./agent-memory",
      requirementsDir: "./agent-memory/requirements",
      designDir: "./agent-memory/design",
      codegenDir: "./agent-memory/codegen",
      testingDir: "./agent-memory/testing",
      workflow: {
        autoProgressEnabled: true,
        requireValidation: true,
        designReviewRequired: true,
        testAfterCodegen: true,
        deployAfterTests: false,
      },
      ...config,
    };

    // Module instances
    this.modules = {
      requirements: null,
      design: null,
      codegen: null,
      testing: null,
    };

    // State management
    this.state = {
      initialized: false,
      currentPhase: "idle",
      phasesCompleted: {
        requirements: false,
        design: false,
        codegen: false,
        testing: false,
      },
      error: null,
      startTime: null,
      lastUpdateTime: null,
      activeTasks: new Map(), // Tracks ongoing tasks
      progressHistory: [], // Logs progress for monitoring
    };

    // Project data structure
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

    // Optimization caches
    this.cache = {
      moduleOutputs: new Map(),
      generatedFiles: new Map(),
      fileContents: new Map(),
    };

    // Background workers
    this.workers = {
      progressReporter: null,
      autoSaveTimer: null,
    };

    // Shared resources
    this.sharedResources = {
      httpClient: axios.create({
        timeout: 30000,
        headers: { "User-Agent": "AI-Agent-Manager/1.0" },
      }),
      tools: {},
    };

    // Logging setup
    this.debug = config.debug || false;
    this.log("AgentManager initialized", "info");
  }

  /**
   * Initializes the AgentManager and its modules.
   * @param {Object} options - Runtime initialization options.
   * @returns {Promise<Object>} Status of initialization.
   */
  async initialize(options = {}) {
    if (this.state.initialized) {
      this.log("AgentManager already initialized", "warn");
      return { success: true, status: "already_initialized" };
    }

    try {
      this.log("Initializing AgentManager", "info");

      // Apply runtime options
      this.config.apiKey = options.apiKey || this.config.apiKey;
      this.config.projectRoot = options.projectRoot || this.config.projectRoot;
      if (options.projectName) {
        this.projectData.name = options.projectName;
        this.projectData.metadata.updatedAt = new Date().toISOString();
      }

      // Ensure directories exist
      await this.createDirectories();

      // Initialize RequirementsModule with streaming enabled
      this.modules.requirements = new RequirementsModule({
        apiKey: this.config.apiKey,
        model: this.config.model,
        outputDir: this.config.requirementsDir,
        debug: this.config.debug,
        streaming: { enabled: true }, // Full streaming support
      });

      // Attach listeners for streaming and events
      this.setupRequirementsModuleListeners();

      // Start auto-save if enabled
      if (this.config.autoSave) this.startAutoSave();

      // Update state
      this.state.initialized = true;
      this.state.startTime = new Date();
      this.state.lastUpdateTime = new Date();

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
      this.emit("error", {
        phase: "initialization",
        error: error.message,
        timestamp: new Date().toISOString(),
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * Creates necessary directories for data storage.
   * @returns {Promise<void>}
   * @private
   */
  async createDirectories() {
    const dirs = [
      this.config.dataDir,
      this.config.requirementsDir,
      this.config.designDir,
      this.config.codegenDir,
      this.config.testingDir,
      this.config.outputDir,
    ];
    for (const dir of dirs) {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (error) {
        if (error.code !== "EEXIST") throw error;
      }
    }
    this.log("Data directories created", "debug");
  }

  /**
   * Sets up listeners for RequirementsModule events, including streaming.
   * @private
   */
  setupRequirementsModuleListeners() {
    if (!this.modules.requirements) return;

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
        `Requirements extraction completed: ${data.requirementsCount}`,
        "info"
      );
      this.updateProgress("requirements", "extracted", 40);
      this.emit("requirements:extraction:complete", {
        ...data,
        timestamp: new Date().toISOString(),
      });
      if (
        this.config.workflow.autoProgressEnabled &&
        this.config.workflow.requireValidation
      ) {
        this.validateRequirements().catch((err) =>
          this.log(`Auto-validation failed: ${err.message}`, "error")
        );
      }
    });

    this.modules.requirements.on("extraction:error", (data) => {
      this.log(`Extraction error: ${data.error}`, "error");
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

    this.modules.requirements.on("validation:start", (data) => {
      this.log("Requirements validation started", "info");
      this.updateProgress("requirements", "validating", 45);
      this.emit("requirements:validation:start", {
        ...data,
        timestamp: new Date().toISOString(),
      });
    });

    this.modules.requirements.on("validation:complete", (data) => {
      this.log(`Validation completed: ${data.status}`, "info");
      this.updateProgress("requirements", "validated", 80);
      this.emit("requirements:validation:complete", {
        ...data,
        timestamp: new Date().toISOString(),
      });
      this.state.phasesCompleted.requirements = true;
      if (this.config.workflow.autoProgressEnabled && this.modules.design) {
        this.startDesignPhase().catch((err) =>
          this.log(`Auto-progress to design failed: ${err.message}`, "error")
        );
      }
    });

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

    // Streaming events for real-time updates
    this.modules.requirements.on("stream:update", (data) => {
      this.emit("stream:update", {
        ...data,
        moduleType: "requirements",
        timestamp: new Date().toISOString(),
      });
    });

    this.modules.requirements.on("stream:complete", (data) => {
      this.emit("stream:complete", {
        ...data,
        moduleType: "requirements",
        timestamp: new Date().toISOString(),
      });
    });

    this.modules.requirements.on("log", (data) => {
      if (this.debug || data.level === "error" || data.level === "warn") {
        this.log(`[RequirementsModule] ${data.message}`, data.level);
      }
    });
  }

  /**
   * Extracts requirements from user input with streaming support.
   * @param {string} userInput - User-provided requirements description.
   * @param {Object} options - Extraction options.
   * @returns {Promise<Object>} Extraction result.
   */
  async extractRequirements(userInput, options = {}) {
    if (!this.state.initialized)
      throw new Error("AgentManager must be initialized first");
    if (!this.modules.requirements)
      throw new Error("RequirementsModule not initialized");

    try {
      this.log("Starting requirements extraction", "info");
      this.state.currentPhase = "requirements";
      this.state.lastUpdateTime = new Date();

      const taskId = crypto.randomUUID();
      this.state.activeTasks.set(taskId, {
        type: "requirements_extraction",
        startTime: new Date(),
        status: "in_progress",
        progress: 0,
      });

      let timeoutId;
      if (this.config.timeoutConfig.requirements > 0) {
        timeoutId = setTimeout(() => {
          const task = this.state.activeTasks.get(taskId);
          if (task && task.status === "in_progress") {
            this.log("Extraction timed out", "error");
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

      const requirements = await this.modules.requirements.extractRequirements(
        userInput,
        {
          streaming: true, // Always stream
          saveToFile: options.saveToFile !== false,
          ...options,
        }
      );

      if (timeoutId) clearTimeout(timeoutId);
      this.state.activeTasks.set(taskId, {
        ...this.state.activeTasks.get(taskId),
        endTime: new Date(),
        status: "completed",
        progress: 100,
      });

      this.projectData.requirements = requirements;
      this.projectData.metadata.updatedAt = new Date().toISOString();
      if (this.config.autoSave) await this.saveProjectData();

      this.log("Requirements extraction completed", "info");
      return {
        success: true,
        requirements,
        taskId,
        projectId: this.projectData.id,
      };
    } catch (error) {
      this.handleError("requirements_extraction", error);
      throw error;
    }
  }

  /**
   * Validates extracted requirements with streaming.
   * @param {Object} options - Validation options.
   * @returns {Promise<Object>} Validation result.
   */
  async validateRequirements(options = {}) {
    if (!this.state.initialized)
      throw new Error("AgentManager must be initialized first");
    if (!this.modules.requirements)
      throw new Error("RequirementsModule not initialized");
    if (!this.projectData.requirements)
      throw new Error("Requirements must be extracted first");

    try {
      this.log("Starting requirements validation", "info");

      const taskId = crypto.randomUUID();
      this.state.activeTasks.set(taskId, {
        type: "requirements_validation",
        startTime: new Date(),
        status: "in_progress",
        progress: 0,
      });

      let timeoutId;
      if (this.config.timeoutConfig.requirements > 0) {
        timeoutId = setTimeout(() => {
          const task = this.state.activeTasks.get(taskId);
          if (task && task.status === "in_progress") {
            this.log("Validation timed out", "error");
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

      const validationResults =
        await this.modules.requirements.validateRequirements({
          streaming: true, // Always stream
          applyFixes: options.applyFixes !== false,
          ...options,
        });

      if (timeoutId) clearTimeout(timeoutId);
      this.state.activeTasks.set(taskId, {
        ...this.state.activeTasks.get(taskId),
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
      this.handleError("requirements_validation", error);
      throw error;
    }
  }

  /**
   * Generates UML diagrams from requirements with streaming.
   * @param {Object} options - UML generation options.
   * @returns {Promise<Object>} UML diagrams result.
   */
  async generateUMLDiagrams(options = {}) {
    if (!this.state.initialized)
      throw new Error("AgentManager must be initialized first");
    if (!this.modules.requirements)
      throw new Error("RequirementsModule not initialized");
    if (!this.projectData.requirements)
      throw new Error("Requirements must be extracted first");

    try {
      this.log("Starting UML diagram generation", "info");

      const taskId = crypto.randomUUID();
      this.state.activeTasks.set(taskId, {
        type: "uml_generation",
        startTime: new Date(),
        status: "in_progress",
        progress: 0,
      });

      let timeoutId;
      if (this.config.timeoutConfig.design > 0) {
        timeoutId = setTimeout(() => {
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

      const umlDiagrams = await this.modules.requirements.generateUMLDiagrams({
        streaming: true, // Always stream
        render: options.render !== false,
        outputFormat: options.outputFormat || "svg",
        saveToFile: options.saveToFile !== false,
        ...options,
      });

      if (timeoutId) clearTimeout(timeoutId);
      this.state.activeTasks.set(taskId, {
        ...this.state.activeTasks.get(taskId),
        endTime: new Date(),
        status: "completed",
        progress: 100,
      });

      this.projectData.design = this.projectData.design || { diagrams: {} };
      this.projectData.design.diagrams = {
        ...this.projectData.design.diagrams,
        uml: {
          classDiagram: !!umlDiagrams.classDiagram,
          sequenceDiagram: !!umlDiagrams.sequenceDiagram,
          generatedAt: new Date().toISOString(),
        },
      };
      this.projectData.metadata.updatedAt = new Date().toISOString();
      if (this.config.autoSave) await this.saveProjectData();

      this.log("UML diagram generation completed", "info");
      return {
        success: true,
        umlDiagrams,
        taskId,
        projectId: this.projectData.id,
      };
    } catch (error) {
      this.handleError("uml_generation", error);
      throw error;
    }
  }

  /**
   * Generates user stories from requirements with streaming.
   * @param {Object} options - User story generation options.
   * @returns {Promise<Object>} User stories result.
   */
  async generateUserStories(options = {}) {
    if (!this.state.initialized)
      throw new Error("AgentManager must be initialized first");
    if (!this.modules.requirements)
      throw new Error("RequirementsModule not initialized");
    if (!this.projectData.requirements)
      throw new Error("Requirements must be extracted first");

    try {
      this.log("Starting user story generation", "info");

      const taskId = crypto.randomUUID();
      this.state.activeTasks.set(taskId, {
        type: "user_story_generation",
        startTime: new Date(),
        status: "in_progress",
        progress: 0,
      });

      const userStories = await this.modules.requirements.generateUserStories({
        streaming: true, // Always stream
        saveToFile: options.saveToFile !== false,
        ...options,
      });

      this.state.activeTasks.set(taskId, {
        ...this.state.activeTasks.get(taskId),
        endTime: new Date(),
        status: "completed",
        progress: 100,
      });

      this.projectData.requirements.userStories = userStories;
      this.projectData.metadata.updatedAt = new Date().toISOString();
      if (this.config.autoSave) await this.saveProjectData();

      this.log("User story generation completed", "info");
      return {
        success: true,
        userStories,
        taskId,
        projectId: this.projectData.id,
      };
    } catch (error) {
      this.handleError("user_story_generation", error);
      throw error;
    }
  }

  /**
   * Exports requirements to a specified format.
   * @param {string} format - Export format (e.g., json, markdown).
   * @param {Object} options - Export options.
   * @returns {Promise<Object>} Export result.
   */
  async exportRequirements(format = "json", options = {}) {
    if (!this.state.initialized)
      throw new Error("AgentManager must be initialized first");
    if (!this.modules.requirements)
      throw new Error("RequirementsModule not initialized");
    if (!this.projectData.requirements)
      throw new Error("Requirements must be extracted first");

    try {
      this.log(`Exporting requirements to ${format}`, "info");

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
      this.handleError("requirements_export", error);
      throw error;
    }
  }

  /**
   * Placeholder for starting the design phase.
   * @param {Object} options - Design phase options.
   * @returns {Promise<Object>} Design phase status.
   */
  async startDesignPhase(options = {}) {
    if (!this.state.initialized)
      throw new Error("AgentManager must be initialized first");
    if (!this.state.phasesCompleted.requirements)
      throw new Error("Requirements phase must be completed first");

    if (!this.modules.design) {
      this.log("Design module not implemented", "warn");
      return { success: false, message: "Design module not yet implemented" };
    }

    try {
      this.log("Starting design phase", "info");
      this.state.currentPhase = "design";
      this.state.lastUpdateTime = new Date();

      // Placeholder for future implementation
      this.log("Design phase implementation pending", "info");
      return {
        success: true,
        message: "Design phase not yet implemented",
        projectId: this.projectData.id,
      };
    } catch (error) {
      this.handleError("design", error);
      throw error;
    }
  }

  /**
   * Retrieves the current status of the agent.
   * @returns {Object} Comprehensive status report.
   */
  getStatus() {
    return {
      initialized: this.state.initialized,
      currentPhase: this.state.currentPhase,
      phasesCompleted: this.state.phasesCompleted,
      error: this.state.error,
      modules: {
        requirements: !!this.modules.requirements,
        design: !!this.modules.design,
        codegen: !!this.modules.codegen,
        testing: !!this.modules.testing,
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
   * Saves project data to a file.
   * @param {string} [filePath] - Custom file path (optional).
   * @returns {Promise<string>} Path to saved file.
   */
  async saveProjectData(filePath) {
    const outputPath =
      filePath ||
      path.join(this.config.dataDir, `project-${this.projectData.id}.json`);
    try {
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      const dataToSave = {
        projectData: this.projectData,
        state: {
          phasesCompleted: this.state.phasesCompleted,
          currentPhase: this.state.currentPhase,
        },
      };
      await fs.writeFile(
        outputPath,
        JSON.stringify(dataToSave, null, 2),
        "utf8"
      );
      this.log(`Project data saved to ${outputPath}`, "debug");
      return outputPath;
    } catch (error) {
      this.log(`Failed to save project data: ${error.message}`, "error");
      throw error;
    }
  }

  /**
   * Loads project data from a file.
   * @param {string} filePath - Path to project data file.
   * @returns {Promise<Object>} Loaded project data.
   */
  async loadProjectData(filePath) {
    try {
      const fileContent = await fs.readFile(filePath, "utf8");
      const data = JSON.parse(fileContent);
      if (!data.projectData)
        throw new Error("Invalid project data file format");

      this.projectData = data.projectData;
      if (data.state) {
        this.state.phasesCompleted =
          data.state.phasesCompleted || this.state.phasesCompleted;
        this.state.currentPhase =
          data.state.currentPhase || this.state.currentPhase;
      }

      if (this.projectData.requirements && this.modules.requirements) {
        this.modules.requirements.requirements = this.projectData.requirements;
        this.modules.requirements.updateCountersFromRequirements();
      }

      this.log(`Project data loaded from ${filePath}`, "info");
      this.emit("project:loaded", {
        projectId: this.projectData.id,
        timestamp: new Date().toISOString(),
      });
      return this.projectData;
    } catch (error) {
      this.log(`Failed to load project data: ${error.message}`, "error");
      throw error;
    }
  }

  /**
   * Starts periodic auto-saving of project data.
   * @param {number} [interval=60000] - Save interval in ms.
   * @private
   */
  startAutoSave(interval = 60000) {
    if (this.workers.autoSaveTimer) clearInterval(this.workers.autoSaveTimer);
    this.workers.autoSaveTimer = setInterval(async () => {
      try {
        await this.saveProjectData();
      } catch (error) {
        this.log(`Auto-save failed: ${error.message}`, "error");
      }
    }, interval);
    this.log(`Auto-save started with interval ${interval}ms`, "debug");
  }

  /**
   * Updates progress for a phase and emits an event.
   * @param {string} phase - Current phase.
   * @param {string} status - Progress status.
   * @param {number} percentage - Progress percentage.
   * @private
   */
  updateProgress(phase, status, percentage) {
    this.state.progressHistory.push({
      phase,
      status,
      percentage,
      timestamp: new Date().toISOString(),
    });
    this.state.lastUpdateTime = new Date();
    this.emit("progress", {
      phase,
      status,
      percentage,
      timestamp: new Date().toISOString(),
      projectId: this.projectData.id,
    });
  }

  /**
   * Cleans up resources on shutdown.
   * @returns {Promise<void>}
   */
  async cleanup() {
    this.log("Cleaning up resources", "info");

    if (this.workers.autoSaveTimer) clearInterval(this.workers.autoSaveTimer);
    if (this.workers.progressReporter)
      clearInterval(this.workers.progressReporter);
    this.workers.autoSaveTimer = null;
    this.workers.progressReporter = null;

    if (this.config.autoSave && this.state.initialized) {
      try {
        await this.saveProjectData();
      } catch (error) {
        this.log(`Final save failed: ${error.message}`, "error");
      }
    }

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

    this.state.initialized = false;
    this.state.activeTasks.clear();
    this.log("Cleanup completed", "info");
    this.emit("cleanup", {
      timestamp: new Date().toISOString(),
      projectId: this.projectData.id,
    });
  }

  /**
   * Logs messages with levels and emits log events.
   * @param {string} message - Message to log.
   * @param {string} level - Log level (info, debug, warn, error).
   * @private
   */
  log(message, level = "info") {
    if (level === "debug" && !this.debug) return;
    const timestamp = new Date().toISOString();
    const formatted = `[${timestamp}] [${level.toUpperCase()}] AgentManager: ${message}`;
    switch (level) {
      case "error":
        console.error(formatted);
        break;
      case "warn":
        console.warn(formatted);
        break;
      case "debug":
        console.debug(formatted);
        break;
      default:
        console.log(formatted);
    }
    this.emit("log", { timestamp, level, message, module: "AgentManager" });
  }

  /**
   * Handles errors consistently across methods.
   * @param {string} phase - Phase where error occurred.
   * @param {Error} error - Error object.
   * @private
   */
  handleError(phase, error) {
    this.state.error = {
      phase,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    };
    this.log(`${phase} failed: ${error.message}`, "error");
    this.emit("error", {
      phase,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}

export default AgentManager;
