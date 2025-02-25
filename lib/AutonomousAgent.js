// lib/AutonomousAgent.js
// Advanced autonomous agent with real implementations for tool execution

import axios from "axios";
import puppeteer from "puppeteer";
import { execSync } from "child_process";
import fs from "fs/promises";
import path from "path";
import { Octokit } from "@octokit/rest";
import sharp from "sharp";

/**
 * AutonomousAgent - A production-ready class that implements a sophisticated agent loop
 * for Claude's computer use API with real functional implementations.
 */
class AutonomousAgent {
  constructor(config = {}) {
    this.config = {
      apiKey: process.env.ANTHROPIC_API_KEY || "",
      model: "claude-3-5-sonnet-20241022",
      maxTokens: 4096,
      temperature: 0.7,
      systemPrompt: `You are Dumpling, an elite autonomous web development assistant that creates visually stunning, modern websites with React, Next.js, and Tailwind CSS. You excel at:

1. Creating exceptional UI/UX designs that are visually striking and intuitive
2. Implementing 3D elements and animations that create immersive experiences
3. Autonomously debugging and fixing issues without human intervention
4. Ensuring all images load correctly and are optimized
5. Producing production-ready, error-free code that follows best practices

Your designs should be innovative and impressive enough to make even the most discerning tech leaders jealous. When using the computer, be methodical:
- Browse the web to research latest design trends and techniques
- Access GitHub to find and implement cutting-edge libraries
- Test your code thoroughly and fix any issues
- Validate that all images are loading properly
- Create 3D elements that enhance the user experience

Always aim for the highest possible quality in every aspect of development.`,
      ...config,
    };

    // Enhanced tool set with additional capabilities
    this.tools = [
      {
        type: "computer_20241022",
        name: "computer",
        display_width_px: 1920,
        display_height_px: 1080,
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
      {
        type: "web_browser_20241022",
        name: "browser",
      },
      {
        type: "github_access_20241022",
        name: "github",
      },
    ];

    this.isRunning = false;
    this.currentTask = null;
    this.taskHistory = [];
    this.maxIterations = 20;
    this.currentIteration = 0;
    this.onProgress = null;
    this.onComplete = null;
    this.onError = null;
    this.debugMode = false;

    // Image processing settings
    this.imageConfig = {
      optimizeImages: true,
      maxImageWidth: 1600,
      imageFormats: ["webp", "avif", "jpg"],
      lazyLoading: true,
      placeholderBlur: true,
    };

    // 3D design capabilities
    this.threeDConfig = {
      libraries: ["three.js", "react-three-fiber", "framer-motion-3d"],
      performanceOptimized: true,
      responsiveRendering: true,
    };

    // Initialize resources
    this.browser = null;
    this.page = null;
    this.octokit = null;
    this.projectRoot = process.cwd();

    // Cache for optimization
    this.cache = {
      screenshots: new Map(),
      fileContents: new Map(),
      searchResults: new Map(),
    };
  }

  /**
   * Initialize the agent with API key and callbacks
   */
  async initialize(apiKey, callbacks = {}, options = {}) {
    this.config.apiKey = apiKey;

    if (callbacks.onProgress) this.onProgress = callbacks.onProgress;
    if (callbacks.onComplete) this.onComplete = callbacks.onComplete;
    if (callbacks.onError) this.onError = callbacks.onError;

    // Apply optional configuration
    if (options.debugMode !== undefined) this.debugMode = options.debugMode;
    if (options.maxIterations) this.maxIterations = options.maxIterations;
    if (options.imageConfig)
      this.imageConfig = { ...this.imageConfig, ...options.imageConfig };
    if (options.threeDConfig)
      this.threeDConfig = { ...this.threeDConfig, ...options.threeDConfig };
    if (options.projectRoot) this.projectRoot = options.projectRoot;

    // Initialize browser for computer and web tools
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        defaultViewport: {
          width: this.tools[0].display_width_px,
          height: this.tools[0].display_height_px,
        },
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
        ],
      });
      this.page = await this.browser.newPage();

      // Initialize GitHub client if token available
      if (process.env.GITHUB_TOKEN) {
        this.octokit = new Octokit({
          auth: process.env.GITHUB_TOKEN,
        });
      }

      this.log("Initialized browser and tools successfully", "info");

      // Validate API connection
      return await this.validateConnection();
    } catch (error) {
      this.log(`Initialization error: ${error.message}`, "error");
      throw new Error(`Failed to initialize agent: ${error.message}`);
    }
  }

  /**
   * Clean up resources when agent is done
   */
  async cleanup() {
    try {
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        this.page = null;
      }

      this.log("Resources cleaned up successfully", "info");
    } catch (error) {
      this.log(`Cleanup error: ${error.message}`, "error");
    }
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

      const successCondition =
        response.data &&
        response.data.content &&
        response.data.content[0].text.includes("CONNECTION_SUCCESSFUL");

      if (successCondition) {
        this.log("API connection validated successfully");
        return {
          success: true,
          message: "Connected to Claude API successfully",
        };
      } else {
        this.log("API connection validation failed", "error");
        return {
          success: false,
          message: "Failed to validate connection",
        };
      }
    } catch (error) {
      this.log("Connection validation error: " + error.message, "error");
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

    // Configure the task with options
    this.currentTask = task;
    this.isRunning = true;
    this.currentIteration = 0;
    this.taskHistory = [];

    // Apply task-specific options
    if (options.maxIterations) this.maxIterations = options.maxIterations;
    if (options.model) this.config.model = options.model;
    if (options.temperature) this.config.temperature = options.temperature;
    if (options.systemPrompt) this.config.systemPrompt = options.systemPrompt;

    // Clear caches between tasks
    this.cache.screenshots.clear();
    this.cache.fileContents.clear();
    this.cache.searchResults.clear();

    try {
      // Send progress update
      this.updateProgress({
        status: "started",
        message: "Starting autonomous task",
        progress: 0,
        task: this.currentTask,
      });

      // Start the enhanced agent loop
      const result = await this.runAgentLoop(task);

      // Send completion callback
      if (this.onComplete) {
        this.onComplete(result);
      }

      this.isRunning = false;
      return result;
    } catch (error) {
      this.isRunning = false;

      // Send error callback with detailed information
      const errorDetails = {
        message: error.message,
        stack: error.stack,
        iteration: this.currentIteration,
        lastAction:
          this.taskHistory.length > 0
            ? this.taskHistory[this.taskHistory.length - 1]
            : null,
      };

      if (this.onError) {
        this.onError(errorDetails);
      }

      // Try to recover if possible and in debug mode
      if (this.debugMode) {
        await this.attemptErrorRecovery(error, task);
      }

      throw error;
    } finally {
      // Clean up resources
      await this.cleanup();
    }
  }

  /**
   * Attempt to recover from errors when in debug mode
   */
  async attemptErrorRecovery(error, originalTask) {
    if (!this.debugMode) return;

    this.log("Attempting error recovery...", "warn");

    try {
      // Create a debugging task for Claude
      const debugTask = `
I encountered an error while executing the following task:
"${originalTask}"

The error was:
${error.message}

Please analyze what might have gone wrong and suggest a solution.
If possible, explain how to fix this issue and continue with the task.
      `;

      // Simple single-shot API call to get debugging advice
      const response = await axios.post(
        "https://api.anthropic.com/v1/messages",
        {
          model: this.config.model,
          max_tokens: 1000,
          temperature: 0.3, // Lower temperature for more precise debugging
          messages: [{ role: "user", content: debugTask }],
          system:
            "You are a debugging expert specialized in fixing errors in autonomous web development systems.",
        },
        {
          headers: {
            "content-type": "application/json",
            "x-api-key": this.config.apiKey,
            "anthropic-version": "2023-06-01",
          },
        }
      );

      if (response.data && response.data.content) {
        const debuggingAdvice = response.data.content[0].text;
        this.log("Error recovery suggestion: " + debuggingAdvice, "info");

        // Add to task history
        this.taskHistory.push({
          role: "system",
          content: `Error recovery suggestion: ${debuggingAdvice}`,
        });

        return debuggingAdvice;
      }
    } catch (recoveryError) {
      this.log("Error recovery failed: " + recoveryError.message, "error");
    }

    return null;
  }

  /**
   * Stop the currently running task
   */
  stopTask(reason = "User requested stop") {
    if (!this.isRunning) {
      return { success: true, message: "No task is currently running" };
    }

    this.isRunning = false;

    // Add stop reason to history
    this.taskHistory.push({
      role: "system",
      content: `Task stopped: ${reason}`,
    });

    this.log(`Task stopped: ${reason}`);

    // Clean up resources
    this.cleanup().catch((err) => {
      this.log(`Error during cleanup: ${err.message}`, "error");
    });

    return {
      success: true,
      message: `Task stopped: ${reason}`,
      iterations: this.currentIteration,
      history: this.taskHistory,
    };
  }

  /**
   * Enhanced main agent loop for autonomous operation
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
      timestamp: new Date().toISOString(),
    });

    // Keep track of consecutive errors to prevent infinite error loops
    let consecutiveErrors = 0;
    const MAX_CONSECUTIVE_ERRORS = 3;

    while (this.isRunning && this.currentIteration < this.maxIterations) {
      this.currentIteration++;

      try {
        // Send progress update
        this.updateProgress({
          status: "processing",
          message: `Running iteration ${this.currentIteration}/${this.maxIterations}`,
          progress: (this.currentIteration / this.maxIterations) * 100,
          currentAction: `Thinking about next step...`,
        });

        // Enhanced request with additional parameters
        const requestPayload = {
          model: this.config.model,
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          tools: this.tools,
          messages: currentMessages,
          system: this.config.systemPrompt,
        };

        this.log(
          `Sending request for iteration ${this.currentIteration}`,
          "debug"
        );

        // Send request to Claude with computer use tools
        const response = await axios.post(
          "https://api.anthropic.com/v1/messages",
          requestPayload,
          {
            headers: {
              "content-type": "application/json",
              "x-api-key": this.config.apiKey,
              "anthropic-version": "2023-06-01",
              "anthropic-beta": "computer-use-2024-10-22",
            },
          }
        );

        // Reset consecutive errors counter on successful API call
        consecutiveErrors = 0;

        // Process the response from Claude
        const responseData = response.data;

        // Check if Claude wants to use a tool
        if (responseData.stop_reason === "tool_use") {
          const toolUse =
            responseData.content[responseData.content.length - 1].tool_use;
          const { name: toolName, input: toolInput, id: toolId } = toolUse;

          // Record the tool use in history with more detail
          this.taskHistory.push({
            role: "assistant",
            tool: toolName,
            input: toolInput,
            timestamp: new Date().toISOString(),
          });

          this.log(`Executing tool: ${toolName}`, "info");
          this.updateProgress({
            status: "processing",
            message: `Executing ${toolName} tool`,
            progress: (this.currentIteration / this.maxIterations) * 100,
            currentAction: `Using ${toolName} with specific parameters`,
          });

          // Actually execute the requested tool
          const toolResult = await this.executeToolWithErrorHandling(
            toolName,
            toolInput,
            toolId
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

          // Add detailed tool result to history
          this.taskHistory.push({
            role: "system",
            tool_result: {
              tool: toolName,
              status: toolResult.error ? "error" : "success",
              summary: toolResult.error
                ? toolResult.message
                : `Tool executed successfully`,
            },
            timestamp: new Date().toISOString(),
          });
        } else {
          // Claude has completed the task
          const finalResponse =
            responseData.content[responseData.content.length - 1].text;

          // Add to history
          this.taskHistory.push({
            role: "assistant",
            content: finalResponse,
            timestamp: new Date().toISOString(),
          });

          // Send progress update
          this.updateProgress({
            status: "completed",
            message: "Task completed successfully",
            progress: 100,
          });

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
        consecutiveErrors++;
        this.log(
          `Error in agent loop (${consecutiveErrors}/${MAX_CONSECUTIVE_ERRORS}): ${error.message}`,
          "error"
        );

        // Record error in history
        this.taskHistory.push({
          role: "system",
          content: `Error: ${error.message}`,
          timestamp: new Date().toISOString(),
          stackTrace: error.stack,
        });

        // If we've had too many consecutive errors, abort
        if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
          throw new Error(
            `Too many consecutive errors (${consecutiveErrors}). Last error: ${error.message}`
          );
        }

        // Otherwise, try to recover and continue
        try {
          // Add an error notification to the messages
          currentMessages.push({
            role: "user",
            content: `I encountered an error: ${error.message}. Please try a different approach or fix the issue.`,
          });

          // Record recovery attempt in history
          this.taskHistory.push({
            role: "system",
            content: "Attempting to recover from error and continue",
            timestamp: new Date().toISOString(),
          });

          // Continue to next iteration rather than failing
          continue;
        } catch (recoveryError) {
          // If recovery itself fails, we have to abort
          throw new Error(
            `Agent loop failed and recovery attempt also failed: ${recoveryError.message}`
          );
        }
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
   * Execute tools with error handling and retries
   */
  async executeToolWithErrorHandling(toolName, toolInput, toolId) {
    const MAX_RETRIES = 2;
    let retries = 0;

    while (retries <= MAX_RETRIES) {
      try {
        // Execute the actual tool
        const result = await this.executeTool(toolName, toolInput, toolId);
        return result;
      } catch (error) {
        retries++;
        this.log(
          `Tool execution error (${retries}/${MAX_RETRIES}): ${error.message}`,
          "error"
        );

        if (retries > MAX_RETRIES) {
          return {
            error: true,
            message: `Failed to execute tool after ${MAX_RETRIES} attempts: ${error.message}`,
            tool: toolName,
          };
        }

        // Wait before retrying (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, 1000 * retries));
      }
    }
  }

  /**
   * Actually execute the requested tool
   */
  async executeTool(toolName, toolInput, toolId) {
    // Implement actual tool execution based on the tool name
    switch (toolName) {
      case "computer":
        return await this.executeComputerTool(toolInput);

      case "str_replace_editor":
        return await this.executeEditorTool(toolInput);

      case "bash":
        return await this.executeBashTool(toolInput);

      case "browser":
        return await this.executeBrowserTool(toolInput);

      case "github":
        return await this.executeGithubTool(toolInput);

      default:
        return {
          error: true,
          message: `Unknown tool: ${toolName}`,
        };
    }
  }

  /**
   * Execute the computer tool for interacting with the UI
   * Real implementation using Puppeteer
   */
  async executeComputerTool(input) {
    try {
      // Ensure we have a browser page
      if (!this.page) {
        if (!this.browser) {
          this.browser = await puppeteer.launch({
            headless: true,
            defaultViewport: {
              width: this.tools[0].display_width_px,
              height: this.tools[0].display_height_px,
            },
            args: [
              "--no-sandbox",
              "--disable-setuid-sandbox",
              "--disable-dev-shm-usage",
            ],
          });
        }
        this.page = await this.browser.newPage();
      }

      const { action, selector, keystrokes, url, coordinates } = input;

      this.log(`Executing computer action: ${action}`, "info");

      // Implement real browser actions
      if (action === "navigate") {
        // Navigate to the specified URL
        await this.page.goto(url, {
          waitUntil: "networkidle2",
          timeout: 30000,
        });

        // Take a screenshot after navigation
        const screenshotBuffer = await this.page.screenshot({
          fullPage: false,
          type: "jpeg",
          quality: 80,
        });

        // Convert screenshot to base64
        const screenshot_base64 = screenshotBuffer.toString("base64");

        // Get current page dimensions
        const dimensions = await this.page.evaluate(() => {
          return {
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight,
          };
        });

        return {
          type: "screenshot",
          width: dimensions.width,
          height: dimensions.height,
          screenshot_base64: screenshot_base64,
          url: this.page.url(),
        };
      } else if (action === "click") {
        if (selector) {
          // Wait for the selector to be visible
          await this.page.waitForSelector(selector, {
            visible: true,
            timeout: 5000,
          });

          // Click the element
          await this.page.click(selector);
        } else if (coordinates) {
          // Click at specific coordinates
          await this.page.mouse.click(coordinates.x, coordinates.y);
        }

        // Wait for any resulting navigation or network activity to settle
        await this.page
          .waitForNetworkIdle({ idle: 500, timeout: 5000 })
          .catch(() => {});

        // Take a screenshot after click
        const screenshotBuffer = await this.page.screenshot({
          fullPage: false,
          type: "jpeg",
          quality: 80,
        });

        // Convert screenshot to base64
        const screenshot_base64 = screenshotBuffer.toString("base64");

        return {
          type: "screenshot",
          width: this.page.viewport().width,
          height: this.page.viewport().height,
          screenshot_base64: screenshot_base64,
          action_performed: "click",
          selector: selector || coordinates,
        };
      } else if (action === "type") {
        if (selector) {
          // Wait for the selector to be visible
          await this.page.waitForSelector(selector, {
            visible: true,
            timeout: 5000,
          });

          // Focus the element and type
          await this.page.focus(selector);
        }

        // Type the keystrokes
        await this.page.keyboard.type(keystrokes);

        // Take a screenshot after typing
        const screenshotBuffer = await this.page.screenshot({
          fullPage: false,
          type: "jpeg",
          quality: 80,
        });

        // Convert screenshot to base64
        const screenshot_base64 = screenshotBuffer.toString("base64");

        return {
          type: "screenshot",
          width: this.page.viewport().width,
          height: this.page.viewport().height,
          screenshot_base64: screenshot_base64,
          action_performed: "type",
          text_entered: keystrokes,
        };
      } else if (action === "scroll") {
        // Scroll the page
        if (input.direction === "down") {
          await this.page.evaluate(() => {
            window.scrollBy(0, window.innerHeight * 0.8);
          });
        } else if (input.direction === "up") {
          await this.page.evaluate(() => {
            window.scrollBy(0, -window.innerHeight * 0.8);
          });
        } else if (input.pixels) {
          await this.page.evaluate((pixels) => {
            window.scrollBy(0, pixels);
          }, input.pixels);
        }

        // Take a screenshot after scrolling
        const screenshotBuffer = await this.page.screenshot({
          fullPage: false,
          type: "jpeg",
          quality: 80,
        });

        // Convert screenshot to base64
        const screenshot_base64 = screenshotBuffer.toString("base64");

        return {
          type: "screenshot",
          width: this.page.viewport().width,
          height: this.page.viewport().height,
          screenshot_base64: screenshot_base64,
          action_performed: "scroll",
        };
      } else if (action === "wait") {
        // Wait for a specified time or for a selector
        if (input.ms) {
          await this.page.waitForTimeout(input.ms);
        } else if (input.selector) {
          await this.page.waitForSelector(input.selector, {
            visible: true,
            timeout: input.timeout || 5000,
          });
        }

        // Take a screenshot after waiting
        const screenshotBuffer = await this.page.screenshot({
          fullPage: false,
          type: "jpeg",
          quality: 80,
        });

        // Convert screenshot to base64
        const screenshot_base64 = screenshotBuffer.toString("base64");

        return {
          type: "screenshot",
          width: this.page.viewport().width,
          height: this.page.viewport().height,
          screenshot_base64: screenshot_base64,
          action_performed: "wait",
        };
      } else {
        // For unsupported actions, take a screenshot and return it with error info
        const screenshotBuffer = await this.page.screenshot({
          fullPage: false,
          type: "jpeg",
          quality: 80,
        });

        // Convert screenshot to base64
        const screenshot_base64 = screenshotBuffer.toString("base64");

        return {
          type: "screenshot",
          width: this.page.viewport().width,
          height: this.page.viewport().height,
          screenshot_base64: screenshot_base64,
          action_performed: action,
          warning: `Action '${action}' may not be fully supported`,
        };
      }
    } catch (error) {
      this.log(`Computer tool error: ${error.message}`, "error");

      // Attempt to take an error screenshot
      try {
        if (this.page) {
          const errorScreenshotBuffer = await this.page.screenshot({
            fullPage: false,
            type: "jpeg",
            quality: 70,
          });

          const error_screenshot_base64 =
            errorScreenshotBuffer.toString("base64");

          return {
            error: true,
            message: `Computer tool error: ${error.message}`,
            type: "error_screenshot",
            width: this.page.viewport().width,
            height: this.page.viewport().height,
            screenshot_base64: error_screenshot_base64,
          };
        }
      } catch (screenshotError) {
        this.log(
          `Failed to capture error screenshot: ${screenshotError.message}`,
          "error"
        );
      }

      return {
        error: true,
        message: `Computer tool error: ${error.message}`,
      };
    }
  }

  /**
   * Execute the text editor tool with real file operations
   */
  async executeEditorTool(input) {
    try {
      const {
        operation,
        path: filePath,
        old_text,
        new_text,
        search,
        replace,
        edit_type,
      } = input;

      this.log(`Editor operation: ${operation} on ${filePath}`, "debug");

      // Ensure the path is secure by resolving it relative to project root
      const resolvedPath = path.resolve(this.projectRoot, filePath);

      // Security check to prevent directory traversal
      if (!resolvedPath.startsWith(this.projectRoot)) {
        throw new Error(
          "Path access violation - attempted to access file outside project root"
        );
      }

      // Perform the operation
      if (operation === "read") {
        // Read the file content
        const fileContent = await fs.readFile(resolvedPath, "utf8");

        // Cache the content
        this.cache.fileContents.set(resolvedPath, fileContent);

        return {
          content: fileContent,
          path: filePath,
          operation_performed: "read",
          success: true,
        };
      } else if (operation === "write") {
        // Create directory if it doesn't exist
        const dirPath = path.dirname(resolvedPath);
        await fs.mkdir(dirPath, { recursive: true });

        // Write the content to the file
        await fs.writeFile(resolvedPath, new_text);

        // Update cache
        this.cache.fileContents.set(resolvedPath, new_text);

        return {
          path: filePath,
          operation_performed: "write",
          success: true,
          bytes_written: Buffer.from(new_text).length,
        };
      } else if (operation === "replace") {
        // Read the current file content if old_text is not provided
        let content;
        if (!old_text) {
          content = await fs.readFile(resolvedPath, "utf8");
        } else {
          content = old_text;
        }

        // Replace specific text or perform search and replace
        let newContent;
        if (search && replace) {
          // Search and replace all occurrences
          const searchRegex = new RegExp(search, "g");
          newContent = content.replace(searchRegex, replace);
        } else {
          // Direct replacement of old_text with new_text
          newContent = content.replace(old_text, new_text);
        }

        // Write the updated content back to the file
        await fs.writeFile(resolvedPath, newContent);

        // Update cache
        this.cache.fileContents.set(resolvedPath, newContent);

        return {
          path: filePath,
          operation_performed: "replace",
          success: true,
          bytes_written: Buffer.from(newContent).length,
        };
      } else if (operation === "append") {
        // Append text to the file
        // Create directory if it doesn't exist
        const dirPath = path.dirname(resolvedPath);
        await fs.mkdir(dirPath, { recursive: true });

        // Check if file exists, if not create it
        let currentContent = "";
        try {
          currentContent = await fs.readFile(resolvedPath, "utf8");
        } catch (fileError) {
          // File doesn't exist, will be created
        }

        // Append new content
        const updatedContent = currentContent + new_text;
        await fs.writeFile(resolvedPath, updatedContent);

        // Update cache
        this.cache.fileContents.set(resolvedPath, updatedContent);

        return {
          path: filePath,
          operation_performed: "append",
          success: true,
          bytes_written: Buffer.from(updatedContent).length,
        };
      } else if (operation === "delete") {
        // Delete the file
        await fs.unlink(resolvedPath);

        // Remove from cache
        this.cache.fileContents.delete(resolvedPath);

        return {
          path: filePath,
          operation_performed: "delete",
          success: true,
        };
      } else if (operation === "list_directory") {
        // List files in directory
        const files = await fs.readdir(resolvedPath, { withFileTypes: true });

        // Convert to structured format
        const fileList = files.map((file) => ({
          name: file.name,
          isDirectory: file.isDirectory(),
          extension: file.isFile() ? path.extname(file.name) : null,
        }));

        return {
          path: filePath,
          operation_performed: "list_directory",
          success: true,
          files: fileList,
        };
      } else {
        return {
          error: true,
          message: `Unknown editor operation: ${operation}`,
        };
      }
    } catch (error) {
      this.log(`Editor tool error: ${error.message}`, "error");
      return {
        error: true,
        message: `Editor tool error: ${error.message}`,
        path: input.path,
      };
    }
  }

  /**
   * Execute bash commands with real execution
   */
  async executeBashTool(input) {
    try {
      const { command } = input;

      this.log(`Executing bash command: ${command}`, "debug");

      // Security checks - prevent dangerous commands
      const dangerousCommands = [
        "rm -rf",
        "sudo",
        "chmod 777",
        "> /dev/",
        "| rm",
        "$(",
        "`",
        "> /etc/",
        "dd if=",
      ];

      // Check for dangerous commands
      if (dangerousCommands.some((cmd) => command.includes(cmd))) {
        return {
          stderr: "Command rejected for security reasons",
          stdout: "",
          exit_code: 1,
        };
      }

      // Execute the command in the project directory
      const options = {
        cwd: this.projectRoot,
        maxBuffer: 1024 * 1024 * 10, // 10MB buffer
        timeout: 30000, // 30 second timeout
      };

      try {
        const stdout = execSync(command, options).toString();
        return {
          stdout: stdout,
          stderr: "",
          exit_code: 0,
        };
      } catch (execError) {
        // Command failed but we captured the output
        return {
          stdout: execError.stdout ? execError.stdout.toString() : "",
          stderr: execError.stderr
            ? execError.stderr.toString()
            : execError.message,
          exit_code: execError.status || 1,
        };
      }
    } catch (error) {
      this.log(`Bash tool error: ${error.message}`, "error");
      return {
        stderr: error.message,
        stdout: "",
        exit_code: 1,
      };
    }
  }

  /**
   * Execute web browser functions for research with real browsing
   */
  async executeBrowserTool(input) {
    try {
      const { url, action, query } = input;

      this.log(`Browser action: ${action} ${url || query}`, "debug");

      // Create a new browser page for browsing if needed
      if (!this.page) {
        if (!this.browser) {
          this.browser = await puppeteer.launch({
            headless: true,
            defaultViewport: {
              width: 1280,
              height: 800,
            },
            args: [
              "--no-sandbox",
              "--disable-setuid-sandbox",
              "--disable-dev-shm-usage",
            ],
          });
        }
        this.page = await this.browser.newPage();
      }

      // Set realistic user agent
      await this.page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36"
      );

      if (action === "search") {
        // Check cache first
        const cacheKey = `search:${query}`;
        if (this.cache.searchResults.has(cacheKey)) {
          return this.cache.searchResults.get(cacheKey);
        }

        // Perform a search on a search engine
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

        // Navigate to search page
        await this.page.goto(searchUrl, {
          waitUntil: "networkidle2",
          timeout: 30000,
        });

        // Extract search results
        const results = await this.page.evaluate(() => {
          const searchResults = [];
          // Look for search result elements (this selector may need updating based on the search engine's layout)
          const resultElements = document.querySelectorAll("div.g");

          for (const element of resultElements) {
            // Extract title, URL, and snippet
            const titleElement = element.querySelector("h3");
            const linkElement = element.querySelector("a");
            const snippetElement = element.querySelector("div.VwiC3b");

            if (titleElement && linkElement) {
              searchResults.push({
                title: titleElement.innerText,
                url: linkElement.href,
                snippet: snippetElement ? snippetElement.innerText : "",
              });
            }
          }

          return searchResults.slice(0, 5); // Return top 5 results
        });

        // Take a screenshot of search results
        const screenshotBuffer = await this.page.screenshot({
          fullPage: false,
          type: "jpeg",
          quality: 70,
        });

        const response = {
          results: results,
          query: query,
          search_engine: "google",
          screenshot_base64: screenshotBuffer.toString("base64"),
        };

        // Cache the results
        this.cache.searchResults.set(cacheKey, response);

        return response;
      } else if (action === "visit") {
        // Visit a webpage and extract content
        await this.page.goto(url, {
          waitUntil: "networkidle2",
          timeout: 30000,
        });

        // Extract page information
        const pageInfo = await this.page.evaluate(() => {
          return {
            page_title: document.title,
            content_summary: document.body.innerText.slice(0, 1000) + "...",
            meta_description:
              document.querySelector('meta[name="description"]')?.content || "",
          };
        });

        // Take a screenshot of the page
        const screenshotBuffer = await this.page.screenshot({
          fullPage: false,
          type: "jpeg",
          quality: 70,
        });

        return {
          ...pageInfo,
          url: this.page.url(),
          status: "success",
          screenshot_base64: screenshotBuffer.toString("base64"),
        };
      } else if (action === "extract") {
        // Extract specific content from a webpage
        if (!this.page.url() || this.page.url() === "about:blank") {
          await this.page.goto(url, {
            waitUntil: "networkidle2",
            timeout: 30000,
          });
        }

        // Extract content based on selector
        const selector = input.selector || "body";
        await this.page.waitForSelector(selector, { timeout: 5000 });

        const extractedContent = await this.page.evaluate((selector) => {
          const element = document.querySelector(selector);
          return element ? element.innerText : "";
        }, selector);

        return {
          url: this.page.url(),
          extraction_target: selector,
          content: extractedContent,
          status: "success",
        };
      } else {
        return {
          error: true,
          message: `Unknown browser action: ${action}`,
        };
      }
    } catch (error) {
      this.log(`Browser tool error: ${error.message}`, "error");
      return {
        error: true,
        message: `Browser tool error: ${error.message}`,
      };
    }
  }

  /**
   * Execute GitHub-specific operations with real GitHub API
   */
  async executeGithubTool(input) {
    try {
      const { action, repository, branch, path, content, query } = input;

      this.log(`GitHub action: ${action} on ${repository || query}`, "debug");

      // Check if we have GitHub access
      if (!this.octokit && process.env.GITHUB_TOKEN) {
        this.octokit = new Octokit({
          auth: process.env.GITHUB_TOKEN,
        });
      }

      // Fallback to scraping if no GitHub token is available
      if (!this.octokit && action !== "search") {
        return await this.githubScrapingFallback(input);
      }

      if (action === "search" && this.octokit) {
        // Search repositories on GitHub
        const searchResponse = await this.octokit.search.repos({
          q: query,
          sort: "stars",
          order: "desc",
          per_page: 5,
        });

        // Format results
        const results = searchResponse.data.items.map((repo) => ({
          name: repo.name,
          full_name: repo.full_name,
          stars: repo.stargazers_count,
          description: repo.description,
          url: repo.html_url,
          owner: repo.owner.login,
          language: repo.language,
          updated_at: repo.updated_at,
        }));

        return {
          results: results,
          query: query,
          total_count: Math.min(searchResponse.data.total_count, 1000), // GitHub limits to 1000
        };
      } else if (action === "get_file" && this.octokit) {
        // Extract owner and repo from repository string
        const [owner, repo] = repository.split("/");

        // Get file content from GitHub
        const fileResponse = await this.octokit.repos.getContent({
          owner: owner,
          repo: repo,
          path: path,
          ref: branch || "main",
        });

        // Decode content from base64
        let fileContent;
        if (fileResponse.data.encoding === "base64") {
          fileContent = Buffer.from(
            fileResponse.data.content,
            "base64"
          ).toString("utf8");
        } else {
          fileContent = fileResponse.data.content;
        }

        return {
          content: fileContent,
          path: path,
          repository: repository,
          branch: branch || "main",
          sha: fileResponse.data.sha,
          size: fileResponse.data.size,
        };
      } else if (action === "list_files" && this.octokit) {
        // Extract owner and repo from repository string
        const [owner, repo] = repository.split("/");

        // Get directory content from GitHub
        const contentsResponse = await this.octokit.repos.getContent({
          owner: owner,
          repo: repo,
          path: path || "",
          ref: branch || "main",
        });

        // Format the directory listing
        const files = Array.isArray(contentsResponse.data)
          ? contentsResponse.data.map((item) => ({
              name: item.name,
              path: item.path,
              type: item.type,
              size: item.size,
              url: item.html_url,
            }))
          : [];

        return {
          repository: repository,
          path: path || "",
          branch: branch || "main",
          files: files,
        };
      } else if (action === "search") {
        // Fallback search using web scraping
        return await this.githubScrapingFallback(input);
      } else {
        return {
          error: true,
          message: `GitHub action not supported: ${action}`,
        };
      }
    } catch (error) {
      this.log(`GitHub tool error: ${error.message}`, "error");

      // Try fallback method
      try {
        return await this.githubScrapingFallback(input);
      } catch (fallbackError) {
        return {
          error: true,
          message: `GitHub tool error: ${error.message}, Fallback also failed: ${fallbackError.message}`,
        };
      }
    }
  }

  /**
   * Fallback method to scrape GitHub when API access is not available
   */
  async githubScrapingFallback(input) {
    const { action, repository, path, query } = input;

    this.log(`Using GitHub scraping fallback for ${action}`, "warn");

    // Create a new browser page for scraping
    const page = await this.browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36"
    );

    try {
      if (action === "search") {
        // Search repositories on GitHub
        const searchUrl = `https://github.com/search?q=${encodeURIComponent(query)}&type=repositories`;
        await page.goto(searchUrl, {
          waitUntil: "networkidle2",
          timeout: 30000,
        });

        // Extract search results
        const results = await page.evaluate(() => {
          const searchResults = [];
          const resultElements = document.querySelectorAll(".repo-list-item");

          for (const element of resultElements) {
            const nameElement = element.querySelector(".v-align-middle");
            const descriptionElement = element.querySelector(".mb-1");
            const starsElement = element.querySelector(
              'a[href*="/stargazers"]'
            );

            if (nameElement) {
              searchResults.push({
                name: nameElement.textContent.trim().split("/")[1],
                full_name: nameElement.textContent.trim(),
                description: descriptionElement
                  ? descriptionElement.textContent.trim()
                  : "",
                stars: starsElement
                  ? parseInt(starsElement.textContent.trim().replace(",", ""))
                  : 0,
                url: "https://github.com/" + nameElement.textContent.trim(),
              });
            }
          }

          return searchResults.slice(0, 5);
        });

        await page.close();

        return {
          results: results,
          query: query,
          total_count: results.length,
          note: "Results obtained through web scraping (limited functionality)",
        };
      } else if (action === "get_file") {
        // Get file content from GitHub
        const fileUrl = `https://github.com/${repository}/blob/main/${path}`;
        await page.goto(fileUrl, { waitUntil: "networkidle2", timeout: 30000 });

        // Extract file content
        const fileContent = await page.evaluate(() => {
          const codeElement = document.querySelector(".blob-wrapper table");
          return codeElement ? codeElement.textContent : "";
        });

        await page.close();

        return {
          content: fileContent,
          path: path,
          repository: repository,
          note: "Content obtained through web scraping (may not be complete)",
        };
      } else {
        await page.close();
        return {
          error: true,
          message: `GitHub action not supported in fallback mode: ${action}`,
        };
      }
    } catch (error) {
      await page.close();
      throw error;
    }
  }

  /**
   * Update progress with more detailed information
   */
  updateProgress(progressInfo) {
    if (this.onProgress) {
      this.onProgress({
        timestamp: new Date().toISOString(),
        ...progressInfo,
      });
    }
  }

  /**
   * Improved logging with levels
   */
  log(message, level = "info") {
    if (!this.debugMode && level === "debug") return;

    const timestamp = new Date().toISOString();

    switch (level) {
      case "error":
        console.error(`[${timestamp}] [ERROR] ${message}`);
        break;
      case "warn":
        console.warn(`[${timestamp}] [WARN] ${message}`);
        break;
      case "debug":
        console.debug(`[${timestamp}] [DEBUG] ${message}`);
        break;
      case "info":
      default:
        console.log(`[${timestamp}] [INFO] ${message}`);
    }
  }

  /**
   * Get the current task status with detailed metrics
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      currentTask: this.currentTask,
      currentIteration: this.currentIteration,
      maxIterations: this.maxIterations,
      progress: this.isRunning
        ? (this.currentIteration / this.maxIterations) * 100
        : 0,
      startTime:
        this.taskHistory.length > 0 ? this.taskHistory[0].timestamp : null,
      lastActionTime:
        this.taskHistory.length > 0
          ? this.taskHistory[this.taskHistory.length - 1].timestamp
          : null,
      actionCount: this.taskHistory.length,
      toolUsage: this.analyzeToolUsage(),
    };
  }

  /**
   * Analyze tool usage patterns
   */
  analyzeToolUsage() {
    const toolUsage = {
      computer: 0,
      str_replace_editor: 0,
      bash: 0,
      browser: 0,
      github: 0,
    };

    // Count tool usage from history
    for (const action of this.taskHistory) {
      if (action.tool) {
        toolUsage[action.tool] = (toolUsage[action.tool] || 0) + 1;
      }
    }

    return toolUsage;
  }

  /**
   * Get the history of the current or last task
   */
  getTaskHistory() {
    return this.taskHistory;
  }

  /**
   * Export task history in different formats
   */
  exportTaskHistory(format = "json") {
    switch (format.toLowerCase()) {
      case "text":
        return this.taskHistory
          .map((item) => {
            if (item.role === "user") {
              return `User: ${item.content}`;
            } else if (item.role === "assistant") {
              if (item.content) {
                return `Assistant: ${item.content}`;
              } else if (item.tool) {
                return `Assistant: [Using tool: ${item.tool}]`;
              }
            } else if (item.role === "system") {
              return `System: ${item.content || JSON.stringify(item.tool_result)}`;
            }
            return `${item.role}: ${JSON.stringify(item)}`;
          })
          .join("\n\n");

      case "html":
        // Create an HTML report
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Task History Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .user { background: #f0f0f0; padding: 10px; border-radius: 5px; margin: 10px 0; }
              .assistant { background: #e1f5fe; padding: 10px; border-radius: 5px; margin: 10px 0; }
              .system { background: #ffebee; padding: 10px; border-radius: 5px; margin: 10px 0; }
              .tool { background: #e8f5e9; padding: 10px; border-radius: 5px; margin: 10px 0; }
              .timestamp { color: #757575; font-size: 0.8em; }
            </style>
          </head>
          <body>
            <h1>Task History Report</h1>
            ${this.taskHistory
              .map((item) => {
                const timestamp = item.timestamp
                  ? `<div class="timestamp">${item.timestamp}</div>`
                  : "";

                if (item.role === "user") {
                  return `<div class="user">${timestamp}<strong>User:</strong> ${item.content}</div>`;
                } else if (item.role === "assistant") {
                  if (item.content) {
                    return `<div class="assistant">${timestamp}<strong>Assistant:</strong> ${item.content}</div>`;
                  } else if (item.tool) {
                    return `<div class="tool">${timestamp}<strong>Assistant Tool:</strong> ${item.tool}<pre>${JSON.stringify(item.input, null, 2)}</pre></div>`;
                  }
                } else if (item.role === "system") {
                  if (item.content) {
                    return `<div class="system">${timestamp}<strong>System:</strong> ${item.content}</div>`;
                  } else if (item.tool_result) {
                    return `<div class="system">${timestamp}<strong>Tool Result:</strong><pre>${JSON.stringify(item.tool_result, null, 2)}</pre></div>`;
                  }
                }
                return `<div class="system">${timestamp}<pre>${JSON.stringify(item, null, 2)}</pre></div>`;
              })
              .join("")}
          </body>
          </html>
        `;
        return htmlContent;

      case "json":
      default:
        return JSON.stringify(this.taskHistory, null, 2);
    }
  }
}

export default AutonomousAgent;
