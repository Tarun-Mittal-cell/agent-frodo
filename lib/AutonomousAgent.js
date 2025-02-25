// lib/AutonomousAgent.js
// Autonomous agent integration with Claude's computer use API

import axios from "axios";

/**
 * AutonomousAgent - A class that implements the agent loop for Claude's computer use
 * This allows Dumpling to autonomously use the computer to build, test, and refine websites
 */
class AutonomousAgent {
  constructor(config = {}) {
    this.config = {
      apiKey: process.env.ANTHROPIC_API_KEY || "",
      model: "claude-3-5-sonnet-20241022",
      maxTokens: 4096,
      temperature: 0.7,
      systemPrompt: `You are Dumpling, an autonomous web development assistant that creates stunning, modern websites with React and Tailwind CSS. You can use the computer to test your code, find bugs, and make improvements without human input. Always generate production-ready code with working images, proper animations, and error-free functionality.`,
      ...config,
    };

    this.tools = [
      {
        type: "computer_20241022",
        name: "computer",
        display_width_px: 1024,
        display_height_px: 768,
        display_number: 1,
      },
      {
        type: "text_editor_20241022",
        name: "str_replace_editor",
      },
      {
        type: "bash_20241022",
        name: "bash",
      },
    ];

    this.isRunning = false;
    this.currentTask = null;
    this.taskHistory = [];
    this.maxIterations = 10; // Safety limit to prevent infinite loops
    this.currentIteration = 0;
    this.onProgress = null;
    this.onComplete = null;
    this.onError = null;
  }

  /**
   * Initialize the agent with API key and callbacks
   */
  initialize(apiKey, callbacks = {}) {
    this.config.apiKey = apiKey;

    if (callbacks.onProgress) this.onProgress = callbacks.onProgress;
    if (callbacks.onComplete) this.onComplete = callbacks.onComplete;
    if (callbacks.onError) this.onError = callbacks.onError;

    return this.validateConnection();
  }

  /**
   * Validate connection to Claude API
   */
  async validateConnection() {
    try {
      const response = await axios.post(
        "https://api.anthropic.com/v1/messages",
        {
          model: this.config.model,
          max_tokens: 100,
          messages: [
            {
              role: "user",
              content: "Connection test. Reply with: CONNECTION_SUCCESSFUL",
            },
          ],
        },
        {
          headers: {
            "content-type": "application/json",
            "x-api-key": this.config.apiKey,
            "anthropic-version": "2023-06-01",
          },
        }
      );

      if (
        response.data &&
        response.data.content &&
        response.data.content[0].text.includes("CONNECTION_SUCCESSFUL")
      ) {
        return {
          success: true,
          message: "Connected to Claude API successfully",
        };
      } else {
        return { success: false, message: "Failed to validate connection" };
      }
    } catch (error) {
      console.error("Connection validation error:", error);
      return {
        success: false,
        message: error.message || "Failed to connect to Claude API",
      };
    }
  }

  /**
   * Start the autonomous agent with a task
   */
  async startTask(task, options = {}) {
    if (this.isRunning) {
      throw new Error("Agent is already running a task");
    }

    if (!this.config.apiKey) {
      throw new Error("API key is required. Call initialize() first");
    }

    // Configure the task
    this.currentTask = task;
    this.isRunning = true;
    this.currentIteration = 0;
    this.taskHistory = [];
    this.maxIterations = options.maxIterations || this.maxIterations;

    try {
      // Send progress update
      if (this.onProgress) {
        this.onProgress({
          status: "started",
          message: "Starting autonomous task",
          progress: 0,
        });
      }

      // Start the agent loop
      const result = await this.runAgentLoop(task);

      // Send completion callback
      if (this.onComplete) {
        this.onComplete(result);
      }

      this.isRunning = false;
      return result;
    } catch (error) {
      this.isRunning = false;

      // Send error callback
      if (this.onError) {
        this.onError(error);
      }

      throw error;
    }
  }

  /**
   * Stop the currently running task
   */
  stopTask() {
    if (!this.isRunning) {
      return { success: true, message: "No task is currently running" };
    }

    this.isRunning = false;

    return {
      success: true,
      message: "Task stopped",
      iterations: this.currentIteration,
    };
  }

  /**
   * Main agent loop for autonomous operation
   */
  async runAgentLoop(initialTask) {
    let currentMessages = [
      {
        role: "user",
        content: initialTask,
      },
    ];

    // Store initial task
    this.taskHistory.push({
      role: "user",
      content: initialTask,
    });

    while (this.isRunning && this.currentIteration < this.maxIterations) {
      this.currentIteration++;

      try {
        // Send progress update
        if (this.onProgress) {
          this.onProgress({
            status: "processing",
            message: `Running iteration ${this.currentIteration}/${this.maxIterations}`,
            progress: (this.currentIteration / this.maxIterations) * 100,
          });
        }

        // Send request to Claude with computer use tools
        const response = await axios.post(
          "https://api.anthropic.com/v1/messages",
          {
            model: this.config.model,
            max_tokens: this.config.maxTokens,
            temperature: this.config.temperature,
            tools: this.tools,
            messages: currentMessages,
            system: this.config.systemPrompt,
          },
          {
            headers: {
              "content-type": "application/json",
              "x-api-key": this.config.apiKey,
              "anthropic-version": "2023-06-01",
              "anthropic-beta": "computer-use-2024-10-22",
            },
          }
        );

        // Process the response from Claude
        const responseData = response.data;

        // Check if Claude wants to use a tool
        if (responseData.stop_reason === "tool_use") {
          const toolUse =
            responseData.content[responseData.content.length - 1].tool_use;
          const { name: toolName, input: toolInput } = toolUse;

          // Record the tool use in history
          this.taskHistory.push({
            role: "assistant",
            content: `[Using tool: ${toolName}]`,
          });

          // Log the tool use (this will be replaced with actual tool execution in production)
          console.log(`Tool use requested: ${toolName}`, toolInput);

          // Simulate tool result (this would be replaced with actual tool execution)
          const toolResult = await this.simulateToolExecution(
            toolName,
            toolInput
          );

          // Add the tool result to messages for next iteration
          currentMessages.push({
            role: "assistant",
            content: null,
            tool_use: toolUse,
          });

          currentMessages.push({
            role: "user",
            content: [
              {
                type: "tool_result",
                tool_use_id: toolUse.id,
                content: toolResult,
              },
            ],
          });

          // Add to history
          this.taskHistory.push({
            role: "user",
            content: `[Tool result for: ${toolName}]`,
          });
        } else {
          // Claude has completed the task
          const finalResponse =
            responseData.content[responseData.content.length - 1].text;

          // Add to history
          this.taskHistory.push({
            role: "assistant",
            content: finalResponse,
          });

          // Send progress update
          if (this.onProgress) {
            this.onProgress({
              status: "completed",
              message: "Task completed successfully",
              progress: 100,
            });
          }

          // Return the completed result
          return {
            success: true,
            message: "Task completed successfully",
            iterations: this.currentIteration,
            response: finalResponse,
            history: this.taskHistory,
          };
        }
      } catch (error) {
        console.error("Error in agent loop:", error);

        // Record error in history
        this.taskHistory.push({
          role: "system",
          content: `Error: ${error.message}`,
        });

        throw new Error(`Agent loop failed: ${error.message}`);
      }
    }

    // If we reach here, we've hit the iteration limit
    return {
      success: false,
      message: "Maximum iterations reached without completion",
      iterations: this.currentIteration,
      history: this.taskHistory,
    };
  }

  /**
   * Simulate tool execution (placeholder for actual tool implementation)
   * In a real implementation, this would execute the requested tool
   */
  async simulateToolExecution(toolName, toolInput) {
    // This is just a placeholder that would be replaced with actual tool execution
    if (toolName === "computer") {
      return {
        screenshot_base64:
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", // Sample base64 pixel
        type: "screenshot",
        width: 1024,
        height: 768,
      };
    } else if (toolName === "str_replace_editor") {
      return {
        content: "Text edited successfully",
      };
    } else if (toolName === "bash") {
      return {
        stdout: "Command executed successfully",
        stderr: "",
        exit_code: 0,
      };
    } else {
      return {
        error: "Unknown tool",
        message: `Tool '${toolName}' is not implemented`,
      };
    }
  }

  /**
   * Get the current task status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      currentTask: this.currentTask,
      currentIteration: this.currentIteration,
      maxIterations: this.maxIterations,
    };
  }

  /**
   * Get the history of the current or last task
   */
  getTaskHistory() {
    return this.taskHistory;
  }
}

export default AutonomousAgent;
