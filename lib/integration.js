/**
 * integration.js
 * Shows how to integrate the enhanced CodeGenerationModule with the AutonomousAgent
 */

const path = require("path");
const AutonomousAgent = require("./lib/AutonomousAgent");
const CodeGenerationModule = require("./lib/CodeGenerationModule");
const LLMService = require("./lib/LLMService"); // Assuming you have this service
const EventEmitter = require("events");

async function setupAutonomousAgent() {
  console.log("Setting up autonomous agent with enhanced code generation...");

  // Create a workspace directory
  const workspaceDir = path.join(process.cwd(), "workspace");

  // Initialize LLM service
  const llmService = new LLMService({
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: "claude-3-opus-20240229",
    temperature: 0.2,
    maxTokens: 4000,
  });

  await llmService.initialize();
  console.log("LLM service initialized");

  // Create event emitter for monitoring agent progress
  const eventEmitter = new EventEmitter();

  // Create enhanced code generation module with robust error handling
  const codeGenModule = new CodeGenerationModule(llmService, {
    projectRoot: workspaceDir,
    maxRetries: 3,
    maxErrorCount: 3,
    requestTimeout: 30000,
    logger: console,
  });

  // Create agent with enhanced code generation module
  const agent = new AutonomousAgent({
    llmService: llmService,
    codeGenerator: codeGenModule,
    projectRoot: workspaceDir,
    eventEmitter: eventEmitter,
    maxIterations: 20,
    maxConsecutiveFailures: 3,
    maxSameActionRepetitions: 5,
    logger: console,
  });

  // Set up event listeners for detailed monitoring
  eventEmitter.on("taskStarted", (task) => {
    console.log(`[Agent] Task started: ${task.id}`);
  });

  eventEmitter.on("planCreated", (plan) => {
    console.log(`[Agent] Plan created with ${plan.steps.length} steps`);
  });

  eventEmitter.on("actionSelected", (action) => {
    console.log(`[Agent] Selected action: ${action.type}`);
  });

  eventEmitter.on("actionExecuted", (action, result) => {
    console.log(`[Agent] Action executed: ${action.type}`);

    // Log code generation results specifically
    if (action.type === "generate_code" && result.generatedCode) {
      const fileCount = result.generatedCode.files?.length || 0;
      console.log(`[Agent] Generated ${fileCount} code files`);

      // Check if we used fallback code
      if (result.generatedCode.fallback) {
        console.log(
          `[Agent] Used fallback code generation due to service issues`
        );
      }
    }
  });

  eventEmitter.on("actionFailed", (action, error) => {
    console.log(`[Agent] Action failed: ${action.type} - ${error.message}`);
  });

  eventEmitter.on("reflectionComplete", (reflection) => {
    console.log(
      `[Agent] Reflection completed - Plan revision needed: ${reflection.needsPlanRevision}`
    );
  });

  eventEmitter.on("planRevised", (plan) => {
    console.log(`[Agent] Plan revised - New step count: ${plan.steps.length}`);
  });

  eventEmitter.on("taskCompleted", (task) => {
    console.log(`[Agent] Task completed: ${task.id}`);
    console.log(
      `[Agent] Generated ${task.result?.artifacts?.length || 0} artifacts`
    );
  });

  return agent;
}

async function runExampleTask() {
  // Set up the agent
  const agent = await setupAutonomousAgent();

  // Define a task for creating a React counter component
  const taskDescription =
    "Create a React counter component with increment and decrement buttons. Style it with CSS modules so that the counter is green when positive and red when negative. Include a reset button.";

  try {
    // Add the task
    const taskId = agent.addTask({
      description: taskDescription,
      type: "component_development",
    });

    console.log(`Added task with ID: ${taskId}`);
    console.log("Agent is now processing the task...");

    // Wait for task completion
    // In a real application, you'd likely track this through events
    // For simplicity, you could also await a method that waits for completion if implemented
  } catch (error) {
    console.error("Error while running agent task:", error);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  runExampleTask().catch((error) => {
    console.error("Failed to run example:", error);
    process.exit(1);
  });
}

module.exports = { setupAutonomousAgent, runExampleTask };
