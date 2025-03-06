/**
 * index.js
 * Main entry point for the autonomous frontend development framework.
 * Exports all modules for convenient import.
 */

const path = require('path');
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
  // Set up logger
  const logger = config.logger || console;
  logger.info("Initializing autonomous agent...");
  
  // Normalize important paths
  const projectDir = path.resolve(config.projectDir || process.cwd());
  const memoryPath = path.resolve(config.memoryPath || path.join(process.cwd(), "agent-memory"));
  
  logger.info(`Project directory: ${projectDir}`);
  logger.info(`Agent memory path: ${memoryPath}`);

  // Create EventEmitter
  const eventEmitter = new EventEmitter();

  // Create memory system with normalized paths
  const memory = new AgentMemory({
    ...config.memory,
    persistToDisk: config.persistToDisk || false,
    memoryPath: memoryPath,
    projectContext: config.projectContext || {},
    logger,
  });

  // Create browser interface if enabled
  let browserInterface = null;
  if (config.enableBrowser !== false) {
    browserInterface = new BrowserInterface({
      ...config.browser,
      logger,
      headless: config.browser?.headless !== false,
    });
  }

  // Create file system interface with normalized paths
  const fileSystem = new FileSystem({
    ...config.fileSystem,
    logger,
    baseDir: projectDir,
    safeMode: config.safeMode !== false,
  });

  // Create computer control if enabled
  let computerControl = null;
  if (config.enableComputerControl) {
    computerControl = new ComputerControl({
      ...config.computerControl,
      logger,
      safeMode: config.safeMode !== false,
    });
  }

  // Create core modules
  const planningModule = new PlanningModule(config.llmService, {
    logger,
  });
  
  const executionModule = new ExecutionModule(config.llmService, {
    browserInterface,
    fileSystem,
    computerControl,
    logger,
  });
  
  const perceptionModule = new PerceptionModule({
    fileSystem,
    computerControl,
    browserInterface,
    logger,
  });
  
  const reflectionModule = new ReflectionModule(config.llmService, {
    logger,
  });
  
  const researchModule = new ResearchModule(config.llmService, {
    browserInterface,
    logger,
  });
  
  const codeGenerationModule = new CodeGenerationModule(config.llmService, {
    fileSystem,
    logger,
  });

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
    maxIterations: config.maxIterations || 50,
    maxConsecutiveFailures: config.maxConsecutiveFailures || 3,
    maxSameActionRepetitions: config.maxSameActionRepetitions || 5,
    projectRoot: projectDir,
    projectDir: projectDir,
    safeMode: config.safeMode !== false,
  });
};
