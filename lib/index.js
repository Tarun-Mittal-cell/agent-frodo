const path = require("path");
const fs = require("fs");
const Joi = require("joi");
const AutonomousAgent = require("./AutonomousAgent");
const AgentMemory = require("./AgentMemory");
const PlanningModule = require("./PlanningModule");
const ExecutionModule = require("./ExecutionModule");
const PerceptionModule = require("./PerceptionModule");
const ReflectionModule = require("./ReflectionModule");
const ResearchModule = require("./ResearchModule");
const CodeGenerationModule = require("./CodeGenerationModule");
const BrowserInterface = require("./BrowserInterface");
const FileSystem = require("./FileSystem");
const ComputerControl = require("./ComputerControl");
const EventEmitter = require("./EventEmitter");
const Plan = require("./Plan");
const LLMService = require("./LLMService");

// Define a schema for config validation
const configSchema = Joi.object({
  logger: Joi.object().default(console),
  projectDir: Joi.string().default(process.cwd()),
  memoryPath: Joi.string().default(path.join(process.cwd(), "agent-memory")),
  llmService: Joi.object().required(),
  persistToDisk: Joi.boolean().default(false),
  projectContext: Joi.object().default({}),
  enableBrowser: Joi.boolean().default(true),
  browser: Joi.object().optional(),
  fileSystem: Joi.object().optional(),
  enableComputerControl: Joi.boolean().default(false),
  computerControl: Joi.object().optional(),
  safeMode: Joi.boolean().default(true),
  maxIterations: Joi.number().integer().min(1).default(50),
  maxConsecutiveFailures: Joi.number().integer().min(1).default(3),
  maxSameActionRepetitions: Joi.number().integer().min(1).default(5),
}).unknown(true); // Allow additional properties

// Export all modules
module.exports = {
  AutonomousAgent,
  AgentMemory,
  PlanningModule,
  ExecutionModule,
  PerceptionModule,
  ReflectionModule,
  ResearchModule,
  CodeGenerationModule,
  BrowserInterface,
  FileSystem,
  ComputerControl,
  EventEmitter,
  Plan,
  LLMService,
};

/**
 * Create a fully configured autonomous agent
 * @param {Object} config - Configuration options
 * @returns {AutonomousAgent} - Configured agent
 */
module.exports.createAgent = (config = {}) => {
  // Validate config
  const { error, value } = configSchema.validate(config);
  if (error) {
    throw new Error(`Config validation error: ${error.message}`);
  }
  config = value; // Use validated config with defaults

  const logger = config.logger;
  logger.info("Initializing autonomous agent...");

  // Normalize and validate paths
  const projectDir = path.resolve(config.projectDir);
  const memoryPath = path.resolve(config.memoryPath);

  if (!fs.existsSync(projectDir) || !fs.statSync(projectDir).isDirectory()) {
    throw new Error(`Invalid project directory: ${projectDir}`);
  }
  if (!fs.existsSync(memoryPath) || !fs.statSync(memoryPath).isDirectory()) {
    throw new Error(`Invalid memory path: ${memoryPath}`);
  }

  logger.info(`Project directory: ${projectDir}`);
  logger.info(`Agent memory path: ${memoryPath}`);

  // Create EventEmitter
  const eventEmitter = new EventEmitter();

  // Create memory system
  const memory = new AgentMemory({
    ...config.memory,
    persistToDisk: config.persistToDisk,
    memoryPath: memoryPath,
    projectContext: config.projectContext,
    logger,
  });

  // Create browser interface if enabled
  let browserInterface = null;
  if (config.enableBrowser) {
    try {
      browserInterface = new BrowserInterface({
        ...config.browser,
        logger,
        headless: config.browser?.headless !== false,
      });
    } catch (error) {
      logger.error(`Failed to initialize BrowserInterface: ${error.message}`);
      throw error;
    }
  }

  // Create file system interface
  const fileSystem = new FileSystem({
    ...config.fileSystem,
    logger,
    baseDir: projectDir,
    safeMode: config.safeMode,
  });

  // Create computer control if enabled
  let computerControl = null;
  if (config.enableComputerControl) {
    try {
      computerControl = new ComputerControl({
        ...config.computerControl,
        logger,
        safeMode: config.safeMode,
      });
    } catch (error) {
      logger.error(`Failed to initialize ComputerControl: ${error.message}`);
      throw error;
    }
  }

  // Create core modules with error handling
  let planningModule;
  try {
    planningModule = new PlanningModule(config.llmService, { logger });
  } catch (error) {
    logger.error(`Failed to initialize PlanningModule: ${error.message}`);
    throw error;
  }

  let executionModule;
  try {
    executionModule = new ExecutionModule(config.llmService, {
      browserInterface,
      fileSystem,
      computerControl,
      logger,
    });
  } catch (error) {
    logger.error(`Failed to initialize ExecutionModule: ${error.message}`);
    throw error;
  }

  let perceptionModule;
  try {
    perceptionModule = new PerceptionModule({
      fileSystem,
      computerControl,
      browserInterface,
      logger,
    });
  } catch (error) {
    logger.error(`Failed to initialize PerceptionModule: ${error.message}`);
    throw error;
  }

  let reflectionModule;
  try {
    reflectionModule = new ReflectionModule(config.llmService, { logger });
  } catch (error) {
    logger.error(`Failed to initialize ReflectionModule: ${error.message}`);
    throw error;
  }

  let researchModule;
  try {
    researchModule = new ResearchModule(config.llmService, {
      browserInterface,
      logger,
    });
  } catch (error) {
    logger.error(`Failed to initialize ResearchModule: ${error.message}`);
    throw error;
  }

  let codeGenerationModule;
  try {
    codeGenerationModule = new CodeGenerationModule(config.llmService, {
      fileSystem,
      logger,
    });
  } catch (error) {
    logger.error(`Failed to initialize CodeGenerationModule: ${error.message}`);
    throw error;
  }

  // Create and return the agent
  logger.info("Creating autonomous agent...");
  return new AutonomousAgent({
    llmService: config.llmService,
    memory,
    planning: planningModule,
    execution: executionModule,
    perception: perceptionModule,
    reflection: reflectionModule,
    research: researchModule,
    codeGenerator: codeGenerationModule,
    eventEmitter,
    logger,
    maxIterations: config.maxIterations,
    maxConsecutiveFailures: config.maxConsecutiveFailures,
    maxSameActionRepetitions: config.maxSameActionRepetitions,
    projectRoot: projectDir,
    projectDir: projectDir,
    safeMode: config.safeMode,
  });
};
