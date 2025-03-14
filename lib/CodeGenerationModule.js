// lib/CodeGenerationModule.js
import { EventEmitter } from "./EventEmitter";
import axios from "axios";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import zlib from "zlib";
import { promisify } from "util";
import { exec } from "child_process";

// Promisify functions
const execAsync = promisify(exec);
const deflateRaw = promisify(zlib.deflateRaw);

/**
 * CodeGenerationModule - A comprehensive system for generating high-quality
 * production-ready code from requirements and design specifications.
 *
 * This module transforms requirements and UML diagrams into fully functional
 * application code, handling file generation, dependency management, and
 * component integration.
 */
class CodeGenerationModule extends EventEmitter {
  /**
   * Create a new CodeGenerationModule instance
   * @param {Object} config - Configuration options
   */
  constructor(config = {}) {
    super();

    // Core configuration
    this.config = {
      apiKey: process.env.ANTHROPIC_API_KEY || "",
      model: "claude-3-5-sonnet-20240620", // Always use Claude 3.5
      maxTokens: 4096,
      temperature: 0.2, // Lower temperature for more precise code generation
      projectRoot: process.cwd(),
      outputDir: "./output/generated-code",
      formatCode: true,
      installDependencies: true,
      // Framework options
      framework: config.framework || "next", // Default to Next.js
      styling: config.styling || "tailwind", // Default to Tailwind CSS
      typescript: config.typescript !== undefined ? config.typescript : true,
      // Streaming configuration
      streaming: {
        enabled: true,
        chunkSize: 100, // Characters per chunk for streaming
        debounceTime: 300, // ms between streaming updates
      },
      // Template configuration
      templates: {
        dir: "./templates",
        useTemplates: true,
      },
      // Testing configuration
      testing: {
        generateTests: true,
        testFramework: "jest",
      },
      // Rendering configuration
      rendering: {
        previewEnabled: true,
        port: 3000,
        host: "localhost",
      },
      ...config,
    };

    // Setup code generation templates and patterns
    this.templates = {
      next: {},
      react: {},
      vue: {},
      angular: {},
      express: {},
    };

    // Code generation state
    this.codebase = {
      files: new Map(), // Map of file paths to content
      dependencies: new Set(), // Set of package dependencies
      devDependencies: new Set(), // Set of dev dependencies
      framework: this.config.framework,
      structure: {}, // Project structure metadata
      entryPoints: [], // Main entry points
      generatedAt: null,
    };

    // Cache for optimizations
    this.cache = {
      generationResults: new Map(),
      fileContents: new Map(),
      renderedPreviews: new Map(),
    };

    // Active streaming operations
    this.activeStreams = new Map();

    // Tracking metadata
    this.metadata = {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "initialized",
      generationCount: 0,
      fileCount: 0,
      lastError: null,
    };

    // Build the prompts for code generation
    this.prompts = this.buildPrompts();

    // Initialize logging
    this.debug = config.debug || false;
    this.log("CodeGenerationModule initialized", "info");
  }

  /**
   * Build the set of prompts used for code generation
   * @returns {Object} A collection of prompts for different code generation tasks
   * @private
   */
  buildPrompts() {
    return {
      projectStructure: `
You are an expert full-stack developer. Based on the provided requirements and UML diagrams, 
create a complete project structure for a ${this.config.framework} application.

For each file in the project:
1. Specify the file path relative to the project root
2. Briefly describe its purpose
3. Note any important interfaces or functions it should contain
4. Identify its dependencies on other files

Return a JSON structure containing:
{
  "framework": "${this.config.framework}",
  "directories": [
    { "path": "path/to/directory", "purpose": "Description of this directory" }
  ],
  "files": [
    {
      "path": "path/to/file.js",
      "purpose": "Description of what this file does",
      "content": "Brief description of expected content",
      "dependencies": ["other/file.js"]
    }
  ],
  "entryPoints": ["path/to/main/entry.js"],
  "dependencies": ["package-name"],
  "devDependencies": ["dev-package-name"]
}

Ensure your structure follows best practices for the ${this.config.framework} framework and includes:
- Appropriate directory organization
- Proper separation of concerns
- Well-structured component hierarchy
- Modern code practices and patterns
      `,

      fileContent: `
You are an expert full-stack developer. Generate complete, production-ready code for the specified file based on the project requirements and specifications.

File Path: {{filePath}}
File Purpose: {{filePurpose}}

Project Details:
- Framework: ${this.config.framework}
- Styling: ${this.config.styling}
- TypeScript: ${this.config.typescript ? "Yes" : "No"}

Requirements: {{requirements}}

Additional Context:
- Component Dependencies: {{dependencies}}
- Project Structure: {{projectStructure}}

Guidelines:
1. Write complete, production-ready code - not pseudocode or placeholders
2. Include proper error handling, validation, and edge cases
3. Add comprehensive comments explaining complex logic
4. Follow best practices for the specified framework and styling approach
5. Ensure the code is properly typed if using TypeScript
6. Implement responsive design for UI components
7. Include any necessary imports and exports

Return ONLY the complete file content with no additional explanation.
      `,

      componentGeneration: `
You are an expert frontend developer. Generate a complete, production-ready UI component based on the requirements.

Component Name: {{componentName}}
Component Purpose: {{componentPurpose}}

Project Details:
- Framework: ${this.config.framework}
- Styling: ${this.config.styling}
- TypeScript: ${this.config.typescript ? "Yes" : "No"}

Requirements: {{requirements}}

Guidelines:
1. Write complete, production-ready code - not pseudocode or placeholders
2. Create a fully functional, reusable component
3. Implement responsive design with mobile, tablet, and desktop support
4. Include proper prop validation
5. Add comprehensive JSDoc comments
6. Use modern features of the framework (hooks, composition API, etc.)
7. Implement loading, error, and empty states where appropriate
8. Add proper accessibility attributes (ARIA) and keyboard navigation
9. Include any necessary imports

Return ONLY the complete file content with no additional explanation.
      `,

      apiEndpointGeneration: `
You are an expert backend developer. Generate a complete API endpoint implementation based on the requirements.

Endpoint: {{endpoint}}
Method: {{method}}
Purpose: {{purpose}}

Project Details:
- Framework: ${this.config.framework}
- TypeScript: ${this.config.typescript ? "Yes" : "No"}
- Database: {{database}}

Requirements: {{requirements}}

Guidelines:
1. Write complete, production-ready code - not pseudocode or placeholders
2. Implement proper request validation and error handling
3. Include database operations if needed
4. Add appropriate HTTP status codes and response formats
5. Implement authentication/authorization checks if required
6. Include error logging and handling
7. Add comprehensive comments explaining the logic
8. Use async/await for asynchronous operations
9. Include proper typings if using TypeScript

Return ONLY the complete file content with no additional explanation.
      `,

      styleGeneration: `
You are an expert frontend developer with deep knowledge of CSS and ${this.config.styling}. 
Generate complete styling code for the specified component or page.

Component/Page: {{componentName}}
Purpose: {{purpose}}

Project Details:
- Styling System: ${this.config.styling}
- Framework: ${this.config.framework}

Design Requirements: {{requirements}}

Guidelines:
1. Write complete, production-ready styling code
2. Implement responsive design with mobile-first approach
3. Use modern CSS features appropriately
4. Optimize for performance
5. Ensure accessibility compliance (color contrast, etc.)
6. Follow consistent naming conventions
7. Include any necessary media queries
8. Add comments for complex styling decisions

Return ONLY the complete styling code with no additional explanation.
      `,

      testGeneration: `
You are an expert in test-driven development. Generate comprehensive tests for the provided code.

File to test: {{filePath}}
File content: {{fileContent}}

Project Details:
- Framework: ${this.config.framework}
- Test Framework: ${this.config.testing.testFramework}
- TypeScript: ${this.config.typescript ? "Yes" : "No"}

Requirements: {{requirements}}

Guidelines:
1. Write complete, production-ready test code
2. Cover all main functionality with appropriate tests
3. Include unit tests for individual functions/methods
4. Add integration tests for component interactions if relevant
5. Test both success and error paths
6. Mock external dependencies as needed
7. Include setup and teardown logic
8. Follow test best practices (arrange-act-assert, etc.)
9. Add descriptive test names and comments

Return ONLY the complete test file content with no additional explanation.
      `,
    };
  }

  /**
   * Generate a complete project structure based on requirements and design
   * @param {Object} requirements - The requirements for the project
   * @param {Object} design - The design specifications and UML diagrams
   * @param {Object} options - Options for project generation
   * @returns {Promise<Object>} The generated project structure
   */
  async generateProjectStructure(requirements, design, options = {}) {
    const streamingEnabled =
      options.streaming !== false && this.config.streaming.enabled;
    const streamId = crypto.randomUUID();

    this.log(
      "Generating project structure from requirements and design",
      "info"
    );

    if (!requirements) {
      throw new Error(
        "Requirements must be provided for project structure generation"
      );
    }

    try {
      // Emit event to notify processing start
      this.emit("structure:start", {
        streamId: streamingEnabled ? streamId : null,
      });

      // Initialize streaming data if enabled
      if (streamingEnabled) {
        this.activeStreams.set(streamId, {
          status: "processing",
          type: "project_structure",
          progress: 0,
          startTime: Date.now(),
          currentData: null,
        });
      }

      // Prepare the requirements and design input
      const requirementsStr = JSON.stringify(requirements, null, 2);
      const designStr = design ? JSON.stringify(design, null, 2) : "";

      // Create the prompt for project structure generation
      const promptContent = `
${this.prompts.projectStructure}

Requirements:
${requirementsStr}

${
  design
    ? `UML Diagrams:
${designStr}`
    : ""
}
      `;

      let projectStructure;

      // Generate the project structure using Claude API
      if (streamingEnabled) {
        projectStructure = await this.streamClaudeProjectStructure(
          promptContent,
          streamId
        );
      } else {
        const response = await axios.post(
          "https://api.anthropic.com/v1/messages",
          {
            model: this.config.model,
            max_tokens: this.config.maxTokens,
            temperature: this.config.temperature,
            messages: [{ role: "user", content: promptContent }],
          },
          {
            headers: {
              "Content-Type": "application/json",
              "x-api-key": this.config.apiKey,
              "anthropic-version": "2023-06-01",
            },
          }
        );

        // Extract the content from Claude's response
        const responseContent = response.data.content[0].text;

        // Parse the JSON from the response
        projectStructure = this.extractJSONFromText(responseContent);
      }

      // Validate the structure
      if (
        !projectStructure ||
        !projectStructure.files ||
        !Array.isArray(projectStructure.files)
      ) {
        throw new Error("Invalid project structure generated");
      }

      // Update the codebase with the project structure
      this.codebase.structure = projectStructure;
      this.codebase.framework =
        projectStructure.framework || this.config.framework;
      this.codebase.entryPoints = projectStructure.entryPoints || [];

      // Add dependencies
      if (
        projectStructure.dependencies &&
        Array.isArray(projectStructure.dependencies)
      ) {
        projectStructure.dependencies.forEach((dep) =>
          this.codebase.dependencies.add(dep)
        );
      }

      // Add dev dependencies
      if (
        projectStructure.devDependencies &&
        Array.isArray(projectStructure.devDependencies)
      ) {
        projectStructure.devDependencies.forEach((dep) =>
          this.codebase.devDependencies.add(dep)
        );
      }

      // Update metadata
      this.metadata.updatedAt = new Date().toISOString();
      this.metadata.status = "structure_generated";

      // Update streaming status if enabled
      if (streamingEnabled) {
        this.activeStreams.set(streamId, {
          status: "completed",
          type: "project_structure",
          progress: 100,
          endTime: Date.now(),
          currentData: projectStructure,
        });

        // Emit completion event for streaming
        this.emit("stream:complete", {
          streamId,
          type: "project_structure",
          data: projectStructure,
        });
      }

      // Emit project structure generation complete event
      this.emit("structure:complete", {
        fileCount: projectStructure.files.length,
        directoryCount: projectStructure.directories
          ? projectStructure.directories.length
          : 0,
        dependencyCount: this.codebase.dependencies.size,
        streamId: streamingEnabled ? streamId : null,
      });

      this.log(
        `Project structure generated with ${projectStructure.files.length} files`,
        "info"
      );

      return projectStructure;
    } catch (error) {
      this.metadata.lastError = {
        phase: "project_structure",
        message: error.message,
        timestamp: new Date().toISOString(),
      };

      this.log(
        `Project structure generation failed: ${error.message}`,
        "error"
      );

      // Update streaming status if enabled
      if (streamingEnabled) {
        this.activeStreams.set(streamId, {
          status: "error",
          type: "project_structure",
          error: error.message,
          endTime: Date.now(),
        });

        // Emit error event for streaming
        this.emit("stream:error", {
          streamId,
          type: "project_structure",
          error: error.message,
        });
      }

      // Emit error event
      this.emit("structure:error", {
        error: error.message,
        timestamp: new Date().toISOString(),
        streamId: streamingEnabled ? streamId : null,
      });

      throw new Error(`Failed to generate project structure: ${error.message}`);
    }
  }

  /**
   * Stream project structure generation using Claude API
   * @param {string} promptContent - The prompt to send to Claude
   * @param {string} streamId - The ID for this streaming operation
   * @returns {Promise<Object>} The project structure
   * @private
   */
  async streamClaudeProjectStructure(promptContent, streamId) {
    return new Promise((resolve, reject) => {
      let accumulatedText = "";
      let jsonStarted = false;
      let jsonBuffer = "";
      let responseObject = null;

      const controller = new AbortController();
      const signal = controller.signal;

      // Timeout handling
      const timeout = setTimeout(() => {
        controller.abort();
        reject(new Error("Streaming request timed out after 180 seconds"));
      }, 180000);

      // Make streaming request to Claude
      axios
        .post(
          "https://api.anthropic.com/v1/messages",
          {
            model: this.config.model,
            max_tokens: this.config.maxTokens,
            temperature: this.config.temperature,
            messages: [{ role: "user", content: promptContent }],
            stream: true,
          },
          {
            headers: {
              "Content-Type": "application/json",
              "x-api-key": this.config.apiKey,
              "anthropic-version": "2023-06-01",
            },
            responseType: "stream",
            signal,
          }
        )
        .then((response) => {
          response.data.on("data", (chunk) => {
            try {
              // Parse the chunk data
              const chunkText = chunk.toString();
              const lines = chunkText
                .split("\n")
                .filter((line) => line.trim() !== "");

              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  const data = line.slice(6);
                  if (data === "[DONE]") continue;

                  try {
                    const parsedData = JSON.parse(data);
                    if (
                      parsedData.type === "content_block_delta" &&
                      parsedData.delta &&
                      parsedData.delta.text
                    ) {
                      const text = parsedData.delta.text;
                      accumulatedText += text;

                      // Track JSON content
                      if (text.includes("{") && !jsonStarted) {
                        jsonStarted = true;
                      }

                      if (jsonStarted) {
                        jsonBuffer += text;
                      }

                      // Try to extract and parse JSON continually
                      try {
                        if (jsonStarted) {
                          const potentialJSON =
                            this.extractJSONFromText(jsonBuffer);
                          if (potentialJSON && potentialJSON.files) {
                            responseObject = potentialJSON;

                            // Update progress based on completeness
                            const progress = Math.min(
                              90,
                              Math.round(
                                (Object.keys(potentialJSON).length / 5) * 100
                              )
                            );

                            this.updateStreamContent(
                              streamId,
                              "project_structure",
                              {
                                text: accumulatedText,
                                structure: responseObject,
                                progress,
                              }
                            );
                          }
                        }
                      } catch (jsonErr) {
                        // Ignore JSON parsing errors during streaming
                      }

                      // Update stream with latest content
                      this.updateStreamContent(streamId, "project_structure", {
                        text: accumulatedText,
                        structure: responseObject,
                      });
                    }
                  } catch (parseErr) {
                    // Skip unparseable data chunks
                  }
                }
              }
            } catch (err) {
              // Skip chunk processing errors
            }
          });

          response.data.on("end", () => {
            clearTimeout(timeout);

            // Extract final structure from complete response
            const finalStructure = this.extractJSONFromText(accumulatedText);
            if (finalStructure && finalStructure.files) {
              resolve(finalStructure);
            } else {
              reject(
                new Error(
                  "Failed to parse project structure from complete streaming response"
                )
              );
            }
          });

          response.data.on("error", (err) => {
            clearTimeout(timeout);
            reject(new Error(`Stream error: ${err.message}`));
          });
        })
        .catch((error) => {
          clearTimeout(timeout);
          reject(error);
        });
    });
  }

  /**
   * Update streaming content with latest data
   * @param {string} streamId - The stream ID
   * @param {string} type - The stream type
   * @param {Object} content - The content to stream
   * @private
   */
  updateStreamContent(streamId, type, content) {
    if (!this.activeStreams.has(streamId)) return;

    const streamData = this.activeStreams.get(streamId);
    streamData.currentData = content;
    streamData.lastUpdate = Date.now();

    // Calculate progress if not provided
    if (content.progress !== undefined) {
      streamData.progress = content.progress;
    } else {
      // Default progress increment
      streamData.progress = Math.min(95, streamData.progress + 2);
    }

    this.activeStreams.set(streamId, streamData);

    // Emit streaming update event
    this.emit("stream:update", {
      streamId,
      type,
      content,
      progress: streamData.progress,
      timeSinceStart: Date.now() - streamData.startTime,
    });
  }

  /**
   * Generate a single file based on the project structure and requirements
   * @param {string} filePath - The path of the file to generate
   * @param {Object} fileInfo - Information about the file from the project structure
   * @param {Object} requirements - The project requirements
   * @param {Object} options - Options for file generation
   * @returns {Promise<Object>} The generated file content
   */
  async generateFile(filePath, fileInfo, requirements, options = {}) {
    const streamingEnabled =
      options.streaming !== false && this.config.streaming.enabled;
    const streamId = crypto.randomUUID();

    this.log(`Generating file: ${filePath}`, "info");

    if (!this.codebase.structure) {
      throw new Error("Project structure must be generated first");
    }

    if (!filePath || !fileInfo) {
      throw new Error(
        "File path and info must be provided for file generation"
      );
    }

    try {
      // Emit event to notify processing start
      this.emit("file:start", {
        filePath,
        streamId: streamingEnabled ? streamId : null,
      });

      // Initialize streaming data if enabled
      if (streamingEnabled) {
        this.activeStreams.set(streamId, {
          status: "processing",
          type: "file_generation",
          filePath,
          progress: 0,
          startTime: Date.now(),
          currentData: null,
        });
      }

      // Check if we already have this file cached
      const cacheKey = `${filePath}:${this.generateCacheKey(JSON.stringify(fileInfo))}`;
      if (this.cache.fileContents.has(cacheKey) && !options.forceRefresh) {
        this.log(`Using cached file content for ${filePath}`, "debug");

        const cachedContent = this.cache.fileContents.get(cacheKey);

        // Update streaming status if enabled
        if (streamingEnabled) {
          this.activeStreams.set(streamId, {
            status: "completed",
            type: "file_generation",
            filePath,
            progress: 100,
            endTime: Date.now(),
            currentData: { content: cachedContent, fromCache: true },
          });

          // Emit completion event for streaming
          this.emit("stream:complete", {
            streamId,
            type: "file_generation",
            data: { content: cachedContent, fromCache: true },
          });
        }

        // Emit completion event
        this.emit("file:complete", {
          filePath,
          fromCache: true,
          streamId: streamingEnabled ? streamId : null,
        });

        return {
          filePath,
          content: cachedContent,
          fromCache: true,
        };
      }

      // Determine if this is a component, API endpoint, or other type of file
      const isComponent = this.isComponentFile(filePath);
      const isApiEndpoint = this.isApiEndpointFile(filePath);
      const isStyleFile = this.isStyleFile(filePath);
      const isTestFile = this.isTestFile(filePath);

      // Create dependencies string
      const dependencies = fileInfo.dependencies
        ? fileInfo.dependencies.join(", ")
        : "";

      // Create a simplified project structure for context
      const projectStructureContext = {
        framework: this.codebase.structure.framework,
        entryPoints: this.codebase.structure.entryPoints,
        files: this.codebase.structure.files.map((f) => ({
          path: f.path,
          purpose: f.purpose,
        })),
      };

      // Choose the appropriate prompt template
      let promptTemplate;
      if (isComponent) {
        promptTemplate = this.prompts.componentGeneration;
      } else if (isApiEndpoint) {
        promptTemplate = this.prompts.apiEndpointGeneration;
      } else if (isStyleFile) {
        promptTemplate = this.prompts.styleGeneration;
      } else if (isTestFile) {
        promptTemplate = this.prompts.testGeneration;
      } else {
        promptTemplate = this.prompts.fileContent;
      }

      // Replace placeholders in the prompt template
      let prompt = promptTemplate
        .replace("{{filePath}}", filePath)
        .replace(
          "{{filePurpose}}",
          fileInfo.purpose || "No specific purpose provided"
        )
        .replace(
          "{{componentName}}",
          path.basename(filePath, path.extname(filePath))
        )
        .replace(
          "{{componentPurpose}}",
          fileInfo.purpose || "No specific purpose provided"
        )
        .replace(
          "{{purpose}}",
          fileInfo.purpose || "No specific purpose provided"
        )
        .replace("{{endpoint}}", this.extractApiEndpoint(filePath))
        .replace("{{method}}", this.inferHttpMethod(fileInfo.purpose || ""))
        .replace("{{database}}", options.database || "Not specified")
        .replace("{{dependencies}}", dependencies)
        .replace("{{requirements}}", JSON.stringify(requirements, null, 2))
        .replace(
          "{{projectStructure}}",
          JSON.stringify(projectStructureContext, null, 2)
        );

      // If this is a test file, add the file content to test
      if (isTestFile && options.fileToTest) {
        prompt = prompt.replace("{{fileContent}}", options.fileToTest);
      }

      let fileContent;

      // Generate the file content using Claude API
      if (streamingEnabled) {
        fileContent = await this.streamClaudeFileGeneration(
          prompt,
          filePath,
          streamId
        );
      } else {
        const response = await axios.post(
          "https://api.anthropic.com/v1/messages",
          {
            model: this.config.model,
            max_tokens: this.config.maxTokens,
            temperature: this.config.temperature,
            messages: [{ role: "user", content: prompt }],
          },
          {
            headers: {
              "Content-Type": "application/json",
              "x-api-key": this.config.apiKey,
              "anthropic-version": "2023-06-01",
            },
          }
        );

        // Extract the content from Claude's response
        fileContent = response.data.content[0].text;
      }

      // Strip any code block markers from the content
      fileContent = this.cleanCodeBlockMarkers(fileContent);

      // Format the code if enabled
      if (this.config.formatCode) {
        fileContent = await this.formatCode(fileContent, filePath);
      }

      // Store the file content in the codebase
      this.codebase.files.set(filePath, fileContent);

      // Cache the file content
      this.cache.fileContents.set(cacheKey, fileContent);

      // Update metadata
      this.metadata.updatedAt = new Date().toISOString();
      this.metadata.fileCount = this.codebase.files.size;

      // Update streaming status if enabled
      if (streamingEnabled) {
        this.activeStreams.set(streamId, {
          status: "completed",
          type: "file_generation",
          filePath,
          progress: 100,
          endTime: Date.now(),
          currentData: { content: fileContent },
        });

        // Emit completion event for streaming
        this.emit("stream:complete", {
          streamId,
          type: "file_generation",
          data: { filePath, content: fileContent },
        });
      }

      // Emit file generation complete event
      this.emit("file:complete", {
        filePath,
        contentLength: fileContent.length,
        streamId: streamingEnabled ? streamId : null,
      });

      this.log(
        `File generated: ${filePath} (${fileContent.length} bytes)`,
        "info"
      );

      return {
        filePath,
        content: fileContent,
      };
    } catch (error) {
      this.metadata.lastError = {
        phase: "file_generation",
        filePath,
        message: error.message,
        timestamp: new Date().toISOString(),
      };

      this.log(
        `File generation failed for ${filePath}: ${error.message}`,
        "error"
      );

      // Update streaming status if enabled
      if (streamingEnabled) {
        this.activeStreams.set(streamId, {
          status: "error",
          type: "file_generation",
          filePath,
          error: error.message,
          endTime: Date.now(),
        });

        // Emit error event for streaming
        this.emit("stream:error", {
          streamId,
          type: "file_generation",
          filePath,
          error: error.message,
        });
      }

      // Emit error event
      this.emit("file:error", {
        filePath,
        error: error.message,
        timestamp: new Date().toISOString(),
        streamId: streamingEnabled ? streamId : null,
      });

      throw new Error(`Failed to generate file ${filePath}: ${error.message}`);
    }
  }

  /**
   * Stream file generation using Claude API
   * @param {string} promptContent - The prompt to send to Claude
   * @param {string} filePath - The path of the file being generated
   * @param {string} streamId - The ID for this streaming operation
   * @returns {Promise<string>} The file content
   * @private
   */
  async streamClaudeFileGeneration(promptContent, filePath, streamId) {
    return new Promise((resolve, reject) => {
      let accumulatedText = "";
      let codeBlockStarted = false;
      let codeBuffer = "";

      const controller = new AbortController();
      const signal = controller.signal;

      // Timeout handling
      const timeout = setTimeout(() => {
        controller.abort();
        reject(new Error("Streaming request timed out after 180 seconds"));
      }, 180000);

      // Make streaming request to Claude
      axios
        .post(
          "https://api.anthropic.com/v1/messages",
          {
            model: this.config.model,
            max_tokens: this.config.maxTokens,
            temperature: this.config.temperature,
            messages: [{ role: "user", content: promptContent }],
            stream: true,
          },
          {
            headers: {
              "Content-Type": "application/json",
              "x-api-key": this.config.apiKey,
              "anthropic-version": "2023-06-01",
            },
            responseType: "stream",
            signal,
          }
        )
        .then((response) => {
          response.data.on("data", (chunk) => {
            try {
              // Parse the chunk data
              const chunkText = chunk.toString();
              const lines = chunkText
                .split("\n")
                .filter((line) => line.trim() !== "");

              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  const data = line.slice(6);
                  if (data === "[DONE]") continue;

                  try {
                    const parsedData = JSON.parse(data);
                    if (
                      parsedData.type === "content_block_delta" &&
                      parsedData.delta &&
                      parsedData.delta.text
                    ) {
                      const text = parsedData.delta.text;
                      accumulatedText += text;

                      // Track code block content
                      if (text.includes("```") && !codeBlockStarted) {
                        codeBlockStarted = true;
                        // Extract only the code part after the opening ```
                        const codeStart = text.indexOf("```") + 3;
                        // Skip language identifier if present
                        const nextLineBreak = text.indexOf("\n", codeStart);
                        if (nextLineBreak > codeStart) {
                          codeBuffer += text.substring(nextLineBreak + 1);
                        } else {
                          codeBuffer += text.substring(codeStart);
                        }
                      } else if (codeBlockStarted && text.includes("```")) {
                        // End of code block, include everything before the closing ```
                        const codeEnd = text.indexOf("```");
                        if (codeEnd > 0) {
                          codeBuffer += text.substring(0, codeEnd);
                        }
                        codeBlockStarted = false;
                      } else if (codeBlockStarted) {
                        codeBuffer += text;
                      } else if (!accumulatedText.includes("```")) {
                        // If no code blocks detected yet, the entire content might be code
                        codeBuffer = accumulatedText;
                      }

                      // Calculate progress based on accumulated text length
                      // This is an approximation as we don't know the final length
                      const estimatedProgress = Math.min(
                        90,
                        Math.round((accumulatedText.length / 3000) * 100)
                      );

                      // Update stream with latest content
                      this.updateStreamContent(streamId, "file_generation", {
                        filePath,
                        content: codeBuffer,
                        progress: estimatedProgress,
                      });
                    }
                  } catch (parseErr) {
                    // Skip unparseable data chunks
                  }
                }
              }
            } catch (err) {
              // Skip chunk processing errors
            }
          });

          response.data.on("end", () => {
            clearTimeout(timeout);

            // Use the code buffer if it contains code, otherwise use the full text
            const finalContent = codeBuffer.trim() || accumulatedText.trim();

            // Clean the content of any remaining code block markers
            const cleanedContent = this.cleanCodeBlockMarkers(finalContent);

            resolve(cleanedContent);
          });

          response.data.on("error", (err) => {
            clearTimeout(timeout);
            reject(new Error(`Stream error: ${err.message}`));
          });
        })
        .catch((error) => {
          clearTimeout(timeout);
          reject(error);
        });
    });
  }

  /**
   * Generate all files for the project based on the project structure and requirements
   * @param {Object} requirements - The project requirements
   * @param {Object} options - Options for project generation
   * @returns {Promise<Object>} The generated project files
   */
  async generateProject(requirements, options = {}) {
    const streamingEnabled =
      options.streaming !== false && this.config.streaming.enabled;
    const streamId = crypto.randomUUID();

    this.log("Starting complete project generation", "info");

    if (!this.codebase.structure) {
      // Generate project structure first if we don't have one
      this.log("No project structure found, generating one first", "info");
      await this.generateProjectStructure(requirements, options.design, {
        streaming: streamingEnabled,
        ...options,
      });
    }

    if (!this.codebase.structure || !this.codebase.structure.files) {
      throw new Error("Project structure must be generated first");
    }

    try {
      // Create overall project stream if streaming is enabled
      if (streamingEnabled) {
        this.activeStreams.set(streamId, {
          status: "processing",
          type: "project_generation",
          progress: 0,
          startTime: Date.now(),
          currentData: {
            files: {},
            filesGenerated: 0,
            totalFiles: this.codebase.structure.files.length,
          },
        });

        // Emit project generation start event
        this.emit("project:start", {
          fileCount: this.codebase.structure.files.length,
          streamId: streamId,
        });
      }

      // Track the files we've generated
      const generatedFiles = [];
      let filesGenerated = 0;
      const totalFiles = this.codebase.structure.files.length;

      // Generate files in a specific order to respect dependencies
      const orderedFiles = this.orderFilesByDependencies(
        this.codebase.structure.files
      );

      // Generate each file
      for (const fileInfo of orderedFiles) {
        try {
          const filePath = fileInfo.path;

          // Update progress
          filesGenerated++;
          const progress = Math.round((filesGenerated / totalFiles) * 100);

          // Update the project generation stream
          if (streamingEnabled) {
            this.updateStreamContent(streamId, "project_generation", {
              files: generatedFiles,
              filesGenerated,
              totalFiles,
              progress,
              currentFile: filePath,
            });
          }

          // Generate the file
          const result = await this.generateFile(
            filePath,
            fileInfo,
            requirements,
            {
              streaming: false, // We're already streaming at the project level
              ...options,
            }
          );

          generatedFiles.push({
            path: filePath,
            contentLength: result.content.length,
          });

          // Emit progress event
          this.emit("project:progress", {
            filesGenerated,
            totalFiles,
            progress,
            currentFile: filePath,
            streamId: streamingEnabled ? streamId : null,
          });
        } catch (fileError) {
          this.log(
            `Error generating file ${fileInfo.path}: ${fileError.message}`,
            "error"
          );

          // Add to generated files with error status
          generatedFiles.push({
            path: fileInfo.path,
            error: fileError.message,
          });

          // Emit file error event
          this.emit("file:error", {
            filePath: fileInfo.path,
            error: fileError.message,
            timestamp: new Date().toISOString(),
          });

          // Continue with next file rather than failing the whole project
          continue;
        }
      }

      // Create the project manifest
      const projectManifest = {
        name: options.projectName || "generated-project",
        version: "1.0.0",
        framework: this.codebase.framework,
        files: Array.from(this.codebase.files.keys()),
        dependencies: Array.from(this.codebase.dependencies),
        devDependencies: Array.from(this.codebase.devDependencies),
        entryPoints: this.codebase.entryPoints,
        generatedAt: new Date().toISOString(),
      };

      // Save the project to disk if requested
      if (options.saveToFileSystem !== false) {
        await this.saveProjectToFileSystem(
          options.outputDir || this.config.outputDir
        );
      }

      // Update metadata
      this.codebase.generatedAt = new Date().toISOString();
      this.metadata.updatedAt = new Date().toISOString();
      this.metadata.status = "project_generated";
      this.metadata.generationCount++;

      // Update streaming status if enabled
      if (streamingEnabled) {
        this.activeStreams.set(streamId, {
          status: "completed",
          type: "project_generation",
          progress: 100,
          endTime: Date.now(),
          currentData: {
            files: generatedFiles,
            filesGenerated,
            totalFiles,
            manifest: projectManifest,
          },
        });

        // Emit completion event for streaming
        this.emit("stream:complete", {
          streamId,
          type: "project_generation",
          data: {
            files: generatedFiles,
            manifest: projectManifest,
          },
        });
      }

      // Emit project generation complete event
      this.emit("project:complete", {
        fileCount: generatedFiles.length,
        framework: this.codebase.framework,
        dependencies: this.codebase.dependencies.size,
        streamId: streamingEnabled ? streamId : null,
      });

      // Install dependencies if requested
      if (
        options.installDependencies !== false &&
        this.config.installDependencies
      ) {
        try {
          await this.installProjectDependencies(
            options.outputDir || this.config.outputDir
          );
        } catch (installError) {
          this.log(
            `Dependency installation failed: ${installError.message}`,
            "error"
          );
        }
      }

      // Start the preview server if requested
      if (
        options.startPreview !== false &&
        this.config.rendering.previewEnabled
      ) {
        try {
          const previewUrl = await this.startPreviewServer(
            options.outputDir || this.config.outputDir
          );
          projectManifest.previewUrl = previewUrl;
        } catch (previewError) {
          this.log(
            `Preview server failed to start: ${previewError.message}`,
            "error"
          );
        }
      }

      this.log(
        `Project generation completed with ${generatedFiles.length} files`,
        "info"
      );

      return {
        manifest: projectManifest,
        generatedFiles,
        errorCount: generatedFiles.filter((f) => f.error).length,
      };
    } catch (error) {
      this.metadata.lastError = {
        phase: "project_generation",
        message: error.message,
        timestamp: new Date().toISOString(),
      };

      this.log(`Project generation failed: ${error.message}`, "error");

      // Update streaming status if enabled
      if (streamingEnabled) {
        this.activeStreams.set(streamId, {
          status: "error",
          type: "project_generation",
          error: error.message,
          endTime: Date.now(),
        });

        // Emit error event for streaming
        this.emit("stream:error", {
          streamId,
          type: "project_generation",
          error: error.message,
        });
      }

      // Emit error event
      this.emit("project:error", {
        error: error.message,
        timestamp: new Date().toISOString(),
        streamId: streamingEnabled ? streamId : null,
      });

      throw new Error(`Failed to generate project: ${error.message}`);
    }
  }

  /**
   * Save the generated project to the file system
   * @param {string} outputDir - Directory where project files should be saved
   * @returns {Promise<string>} Path to the saved project
   */
  async saveProjectToFileSystem(outputDir) {
    const projectDir = outputDir || this.config.outputDir;

    this.log(`Saving project to ${projectDir}`, "info");

    try {
      // Create the output directory
      await fs.mkdir(projectDir, { recursive: true });

      // Write each file
      for (const [filePath, content] of this.codebase.files.entries()) {
        const fullPath = path.join(projectDir, filePath);

        // Create the directory for the file if it doesn't exist
        await fs.mkdir(path.dirname(fullPath), { recursive: true });

        // Write the file
        await fs.writeFile(fullPath, content, "utf8");

        this.log(`Saved file: ${fullPath}`, "debug");
      }

      // Create package.json if it doesn't exist
      if (!this.codebase.files.has("package.json")) {
        const packageJson = {
          name: path.basename(projectDir),
          version: "1.0.0",
          private: true,
          scripts: {
            dev: this.getDevScript(),
            build: this.getBuildScript(),
            start: this.getStartScript(),
            test: this.getTestScript(),
          },
          dependencies: Object.fromEntries(
            Array.from(this.codebase.dependencies).map((dep) => [dep, "*"])
          ),
          devDependencies: Object.fromEntries(
            Array.from(this.codebase.devDependencies).map((dep) => [dep, "*"])
          ),
        };

        await fs.writeFile(
          path.join(projectDir, "package.json"),
          JSON.stringify(packageJson, null, 2),
          "utf8"
        );

        this.log("Created package.json file", "debug");
      }

      // Create README.md if it doesn't exist
      if (!this.codebase.files.has("README.md")) {
        const readme = this.generateReadme();
        await fs.writeFile(path.join(projectDir, "README.md"), readme, "utf8");
        this.log("Created README.md file", "debug");
      }

      // Create a project manifest file
      const manifest = {
        name: path.basename(projectDir),
        framework: this.codebase.framework,
        files: Array.from(this.codebase.files.keys()),
        dependencies: Array.from(this.codebase.dependencies),
        devDependencies: Array.from(this.codebase.devDependencies),
        entryPoints: this.codebase.entryPoints,
        generatedAt: new Date().toISOString(),
      };

      await fs.writeFile(
        path.join(projectDir, ".project-manifest.json"),
        JSON.stringify(manifest, null, 2),
        "utf8"
      );

      this.log("Created project manifest file", "debug");
      this.log(`Project saved to ${projectDir}`, "info");

      return projectDir;
    } catch (error) {
      this.log(
        `Failed to save project to file system: ${error.message}`,
        "error"
      );
      throw new Error(`Failed to save project: ${error.message}`);
    }
  }

  /**
   * Install project dependencies in the output directory
   * @param {string} projectDir - Directory where the project is saved
   * @returns {Promise<Object>} Result of the dependency installation
   */
  async installProjectDependencies(projectDir) {
    const projectPath = projectDir || this.config.outputDir;

    this.log(`Installing dependencies in ${projectPath}`, "info");

    try {
      // Verify package.json exists
      const packageJsonPath = path.join(projectPath, "package.json");
      await fs.access(packageJsonPath);

      // Execute npm/yarn install
      const useYarn = await this.checkYarnAvailable();
      const installCmd = useYarn ? "yarn" : "npm install";

      // Emit dependency installation start event
      this.emit("dependencies:start", {
        projectDir: projectPath,
        command: installCmd,
      });

      // Execute the install command
      const { stdout, stderr } = await execAsync(installCmd, {
        cwd: projectPath,
      });

      // Log the results
      this.log(`Dependencies installed successfully: ${stdout}`, "debug");

      if (stderr) {
        this.log(`Dependency installation warnings: ${stderr}`, "warn");
      }

      // Emit dependency installation complete event
      this.emit("dependencies:complete", {
        projectDir: projectPath,
        success: true,
      });

      return {
        success: true,
        command: installCmd,
        output: stdout,
      };
    } catch (error) {
      this.log(`Failed to install dependencies: ${error.message}`, "error");

      // Emit dependency installation error event
      this.emit("dependencies:error", {
        projectDir: projectPath,
        error: error.message,
        command: error.cmd,
      });

      throw new Error(`Failed to install dependencies: ${error.message}`);
    }
  }

  /**
   * Start a preview server for the generated project
   * @param {string} projectDir - Directory where the project is saved
   * @returns {Promise<string>} URL where the preview is available
   */
  async startPreviewServer(projectDir) {
    const projectPath = projectDir || this.config.outputDir;
    const port = this.config.rendering.port;
    const host = this.config.rendering.host;

    this.log(
      `Starting preview server for ${projectPath} on port ${port}`,
      "info"
    );

    try {
      // Check if package.json exists
      const packageJsonPath = path.join(projectPath, "package.json");
      await fs.access(packageJsonPath);

      // Determine the appropriate command based on framework
      let startCmd;

      // For Next.js projects
      if (this.codebase.framework === "next") {
        startCmd = "npx next dev";
      }
      // For React projects
      else if (this.codebase.framework === "react") {
        startCmd = "npx react-scripts start";
      }
      // For Vue projects
      else if (this.codebase.framework === "vue") {
        startCmd = "npx vue-cli-service serve";
      }
      // For Angular projects
      else if (this.codebase.framework === "angular") {
        startCmd = "npx ng serve";
      }
      // For Express projects
      else if (this.codebase.framework === "express") {
        startCmd = "node index.js";
      }
      // Default fallback
      else {
        startCmd = "npx serve -s";
      }

      // Add port if not specified in the command
      if (!startCmd.includes(" -p ") && !startCmd.includes(" --port ")) {
        startCmd += ` --port ${port}`;
      }

      // Emit preview server start event
      this.emit("preview:start", {
        projectDir: projectPath,
        command: startCmd,
        port: port,
      });

      // Execute the start command as a background process
      const child = execAsync(startCmd, {
        cwd: projectPath,
        detached: true,
        stdio: "ignore",
      });

      // Give the server a moment to start
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const previewUrl = `http://${host}:${port}`;

      // Emit preview server ready event
      this.emit("preview:ready", {
        projectDir: projectPath,
        url: previewUrl,
      });

      this.log(`Preview server started: ${previewUrl}`, "info");

      return previewUrl;
    } catch (error) {
      this.log(`Failed to start preview server: ${error.message}`, "error");

      // Emit preview server error event
      this.emit("preview:error", {
        projectDir: projectPath,
        error: error.message,
      });

      throw new Error(`Failed to start preview server: ${error.message}`);
    }
  }

  /**
   * Format generated code for a specific file
   * @param {string} content - The code content to format
   * @param {string} filePath - Path of the file being formatted
   * @returns {Promise<string>} The formatted code
   * @private
   */
  async formatCode(content, filePath) {
    // Skip formatting if disabled
    if (!this.config.formatCode) {
      return content;
    }

    try {
      this.log(`Formatting code for ${filePath}`, "debug");

      // For production code, we should try to use a dedicated formatter like Prettier
      // But for this implementation, we'll do simple indentation fixes and cleanup

      const ext = path.extname(filePath).toLowerCase();

      // JavaScript/TypeScript/JSX/TSX files
      if ([".js", ".jsx", ".ts", ".tsx"].includes(ext)) {
        // Basic formatting: consistent indentation and spacing
        let formatted = content
          // Fix indentation
          .replace(/^\s+/gm, (match) => " ".repeat(match.length))
          // Remove trailing whitespace
          .replace(/\s+$/gm, "")
          // Ensure consistent spacing around operators
          .replace(/([=!<>]+)([^\s=])/g, "$1 $2")
          .replace(/([^\s=])([=!<>]+)/g, "$1 $2")
          // Ensure newline after imports
          .replace(/(import .+?;)\n(?![\n\r]|import)/g, "$1\n\n");

        return formatted;
      }

      // CSS/SCSS files
      if ([".css", ".scss", ".sass"].includes(ext)) {
        // Basic formatting for CSS
        let formatted = content
          // Fix indentation
          .replace(/^\s+/gm, (match) => " ".repeat(match.length))
          // Fix spacing after colons in properties
          .replace(/:\s*/g, ": ")
          // Remove trailing whitespace
          .replace(/\s+$/gm, "")
          // Ensure newline after closing braces
          .replace(/}(?![\n\r])/g, "}\n");

        return formatted;
      }

      // HTML files
      if ([".html", ".htm"].includes(ext)) {
        // Basic formatting for HTML
        let formatted = content
          // Fix indentation
          .replace(/^\s+/gm, (match) => " ".repeat(match.length))
          // Remove trailing whitespace
          .replace(/\s+$/gm, "");

        return formatted;
      }

      // JSON files
      if (ext === ".json") {
        try {
          // Parse and stringify for proper formatting
          const json = JSON.parse(content);
          return JSON.stringify(json, null, 2);
        } catch (e) {
          // If parsing fails, return the original content
          return content;
        }
      }

      // For other file types, return as is
      return content;
    } catch (error) {
      this.log(
        `Code formatting failed for ${filePath}: ${error.message}`,
        "warn"
      );
      // Return the original content if formatting fails
      return content;
    }
  }

  /**
   * Check if yarn is available on the system
   * @returns {Promise<boolean>} True if yarn is available
   * @private
   */
  async checkYarnAvailable() {
    try {
      await execAsync("yarn --version");
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate the appropriate dev script based on the framework
   * @returns {string} The dev script command
   * @private
   */
  getDevScript() {
    switch (this.codebase.framework) {
      case "next":
        return "next dev";
      case "react":
        return "react-scripts start";
      case "vue":
        return "vue-cli-service serve";
      case "angular":
        return "ng serve";
      case "express":
        return "nodemon index.js";
      default:
        return "serve -s .";
    }
  }

  /**
   * Generate the appropriate build script based on the framework
   * @returns {string} The build script command
   * @private
   */
  getBuildScript() {
    switch (this.codebase.framework) {
      case "next":
        return "next build";
      case "react":
        return "react-scripts build";
      case "vue":
        return "vue-cli-service build";
      case "angular":
        return "ng build";
      case "express":
        return 'echo "No build step required"';
      default:
        return 'echo "No build step defined"';
    }
  }

  /**
   * Generate the appropriate start script based on the framework
   * @returns {string} The start script command
   * @private
   */
  getStartScript() {
    switch (this.codebase.framework) {
      case "next":
        return "next start";
      case "react":
        return "serve -s build";
      case "vue":
        return "serve -s dist";
      case "angular":
        return "serve -s dist";
      case "express":
        return "node index.js";
      default:
        return "serve -s .";
    }
  }

  /**
   * Generate the appropriate test script based on the framework
   * @returns {string} The test script command
   * @private
   */
  getTestScript() {
    const testFramework = this.config.testing.testFramework;

    switch (testFramework) {
      case "jest":
        return "jest";
      case "mocha":
        return "mocha";
      case "cypress":
        return "cypress run";
      default:
        return 'echo "No test command defined"';
    }
  }

  /**
   * Generate a README.md file for the project
   * @returns {string} The README content
   * @private
   */
  generateReadme() {
    const projectName = path.basename(this.config.outputDir);
    const framework = this.codebase.framework;
    const isTypescript = this.config.typescript;

    return `# ${projectName}

## Overview
This project was automatically generated using the CodeGenerationModule from requirements and specifications.

## Project Details
- Framework: ${framework}${isTypescript ? " with TypeScript" : ""}
- Styling: ${this.config.styling}
- Generated: ${new Date().toISOString()}

## Getting Started

### Installation
\`\`\`bash
# Install dependencies
npm install
# or
yarn
\`\`\`

### Development Server
\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

### Building for Production
\`\`\`bash
npm run build
# or
yarn build
\`\`\`

### Running Tests
\`\`\`bash
npm test
# or
yarn test
\`\`\`

## Project Structure
This project follows the standard ${framework} structure with the following key directories:

${this.generateProjectStructureDescription()}

## Dependencies
${Array.from(this.codebase.dependencies)
  .map((dep) => `- ${dep}`)
  .join("\n")}
`;
  }

  /**
   * Generate a description of the project structure for the README
   * @returns {string} Description of the project structure
   * @private
   */
  generateProjectStructureDescription() {
    // Group files by directory
    const dirStructure = {};

    Array.from(this.codebase.files.keys()).forEach((filePath) => {
      const dir = path.dirname(filePath);
      if (!dirStructure[dir]) {
        dirStructure[dir] = [];
      }
      dirStructure[dir].push(path.basename(filePath));
    });

    // Generate the description
    let description = "";

    Object.keys(dirStructure)
      .sort()
      .forEach((dir) => {
        if (dir === ".") {
          description += `- Root: Contains ${dirStructure[dir].join(", ")}\n`;
        } else {
          description += `- ${dir}/: Contains ${dirStructure[dir].length} file(s)\n`;
        }
      });

    return description;
  }

  /**
   * Order files by their dependencies to ensure correct generation order
   * @param {Array} files - Array of file information objects
   * @returns {Array} Ordered array of file information
   * @private
   */
  orderFilesByDependencies(files) {
    const result = [];
    const remaining = [...files];
    const visited = new Set();

    // Helper function to add a file and its dependencies
    const addFile = (file) => {
      // Skip if already visited
      if (visited.has(file.path)) return;

      // Mark as visited to prevent cycles
      visited.add(file.path);

      // Process dependencies first
      if (file.dependencies && Array.isArray(file.dependencies)) {
        for (const depPath of file.dependencies) {
          const depFile = remaining.find((f) => f.path === depPath);
          if (depFile) {
            addFile(depFile);
          }
        }
      }

      // Add to result if not already present
      if (!result.some((f) => f.path === file.path)) {
        result.push(file);
      }

      // Remove from remaining
      const index = remaining.findIndex((f) => f.path === file.path);
      if (index !== -1) {
        remaining.splice(index, 1);
      }
    };

    // Process all entry points first
    if (this.codebase.entryPoints && this.codebase.entryPoints.length > 0) {
      for (const entryPoint of this.codebase.entryPoints) {
        const entryFile = remaining.find((f) => f.path === entryPoint);
        if (entryFile) {
          addFile(entryFile);
        }
      }
    }

    // Process configuration files early
    const configFiles = remaining.filter((f) => this.isConfigFile(f.path));
    for (const configFile of configFiles) {
      addFile(configFile);
    }

    // Process remaining files
    while (remaining.length > 0) {
      addFile(remaining[0]);
    }

    return result;
  }

  /**
   * Check if a file is a component
   * @param {string} filePath - Path of the file
   * @returns {boolean} True if the file is a component
   * @private
   */
  isComponentFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const isJsxFile = [".jsx", ".tsx"].includes(ext);

    if (isJsxFile) return true;

    const filename = path.basename(filePath, ext);
    const dir = path.dirname(filePath);

    // Check for component naming patterns
    const isCapitalized =
      filename.charAt(0) === filename.charAt(0).toUpperCase();
    const inComponentsDir =
      dir.includes("components") || dir.includes("Components");
    const hasComponentName =
      filename.includes("Component") || filename.endsWith("View");

    // For React/Next in .js/.ts files
    if ([".js", ".ts"].includes(ext) && this.codebase.framework !== "angular") {
      return isCapitalized && (inComponentsDir || hasComponentName);
    }

    // For Vue components
    if (ext === ".vue") return true;

    // For Angular components
    if (
      this.codebase.framework === "angular" &&
      filename.includes(".component")
    )
      return true;

    return false;
  }

  /**
   * Check if a file is an API endpoint
   * @param {string} filePath - Path of the file
   * @returns {boolean} True if the file is an API endpoint
   * @private
   */
  isApiEndpointFile(filePath) {
    // Next.js API routes
    if (filePath.includes("/api/") && !filePath.includes("/api/lib/"))
      return true;

    // Express routes
    if (
      filePath.includes("/routes/") ||
      filePath.endsWith("Controller.js") ||
      filePath.endsWith("Controller.ts")
    )
      return true;

    // NestJS controllers
    if (
      filePath.endsWith(".controller.ts") ||
      filePath.endsWith(".controller.js")
    )
      return true;

    return false;
  }

  /**
   * Extract the API endpoint path from the file path
   * @param {string} filePath - Path of the file
   * @returns {string} The API endpoint path
   * @private
   */
  extractApiEndpoint(filePath) {
    // Next.js API routes
    if (filePath.includes("/api/")) {
      const apiPart = filePath.split("/api/")[1];
      return `/api/${apiPart.replace(/\.(js|ts)$/, "")}`;
    }

    // Express routes - make a best guess
    if (filePath.includes("/routes/")) {
      const routePart = filePath.split("/routes/")[1];
      return `/${routePart.replace(/\.(js|ts)$/, "")}`;
    }

    // NestJS controllers
    if (
      filePath.endsWith(".controller.ts") ||
      filePath.endsWith(".controller.js")
    ) {
      const baseName = path.basename(filePath).split(".controller")[0];
      return `/${baseName}`;
    }

    return "/unknown-endpoint";
  }

  /**
   * Infer the HTTP method from the file purpose description
   * @param {string} purpose - Purpose description of the file
   * @returns {string} The HTTP method (GET, POST, etc.)
   * @private
   */
  inferHttpMethod(purpose) {
    purpose = purpose.toLowerCase();

    if (
      purpose.includes("create") ||
      purpose.includes("add") ||
      purpose.includes("insert")
    ) {
      return "POST";
    }

    if (
      purpose.includes("update") ||
      purpose.includes("edit") ||
      purpose.includes("modify")
    ) {
      return "PUT";
    }

    if (purpose.includes("delete") || purpose.includes("remove")) {
      return "DELETE";
    }

    if (
      purpose.includes("get") ||
      purpose.includes("fetch") ||
      purpose.includes("retrieve") ||
      purpose.includes("list")
    ) {
      return "GET";
    }

    return "GET"; // Default to GET
  }

  /**
   * Check if a file is a style file
   * @param {string} filePath - Path of the file
   * @returns {boolean} True if the file is a style file
   * @private
   */
  isStyleFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return [".css", ".scss", ".sass", ".less", ".styl"].includes(ext);
  }

  /**
   * Check if a file is a test file
   * @param {string} filePath - Path of the file
   * @returns {boolean} True if the file is a test file
   * @private
   */
  isTestFile(filePath) {
    const filename = path.basename(filePath);
    return (
      filename.includes(".test.") ||
      filename.includes(".spec.") ||
      filePath.includes("/__tests__/") ||
      filePath.includes("/tests/")
    );
  }

  /**
   * Check if a file is a configuration file
   * @param {string} filePath - Path of the file
   * @returns {boolean} True if the file is a configuration file
   * @private
   */
  isConfigFile(filePath) {
    const filename = path.basename(filePath);
    return (
      filename === "package.json" ||
      filename === "tsconfig.json" ||
      filename === "next.config.js" ||
      filename === "next.config.ts" ||
      filename === "webpack.config.js" ||
      filename === ".eslintrc.js" ||
      filename === ".babelrc" ||
      filename.startsWith("postcss.config.") ||
      filename.startsWith("tailwind.config.")
    );
  }

  /**
   * Remove code block markers from generated code
   * @param {string} content - The content to clean
   * @returns {string} Cleaned content
   * @private
   */
  cleanCodeBlockMarkers(content) {
    // First, check if the content is wrapped in code block markers
    if (content.startsWith("```") && content.endsWith("```")) {
      // Extract content between the code block markers
      const firstMarkerIndex = content.indexOf("\n");
      const lastMarkerIndex = content.lastIndexOf("```");

      if (firstMarkerIndex !== -1 && lastMarkerIndex !== -1) {
        return content.substring(firstMarkerIndex + 1, lastMarkerIndex).trim();
      }
    }

    // Check for language identifier at the beginning
    if (content.startsWith("```")) {
      const endOfFirstLine = content.indexOf("\n");
      if (endOfFirstLine !== -1) {
        content = content.substring(endOfFirstLine + 1);
      }
    }

    // Remove trailing backticks
    if (content.endsWith("```")) {
      content = content.substring(0, content.lastIndexOf("```"));
    }

    return content.trim();
  }

  /**
   * Extract JSON from a text response that might contain other content
   * @param {string} text - The text to parse
   * @returns {Object|null} The parsed JSON or null if parsing failed
   * @private
   */
  extractJSONFromText(text) {
    try {
      // First try directly parsing the whole text
      try {
        return JSON.parse(text);
      } catch (directParseError) {
        // If that fails, try to extract JSON from within the text
        const jsonPattern = /```(?:json)?\s*([\s\S]*?)```|(\{[\s\S]*\})/g;
        const jsonMatches = [...text.matchAll(jsonPattern)];

        if (jsonMatches.length > 0) {
          // Use the first match
          const jsonText = (jsonMatches[0][1] || jsonMatches[0][2]).trim();
          return JSON.parse(jsonText);
        }

        // If no matches with code blocks, try to find any JSON object in the text
        const objectPattern = /(\{[\s\S]*\})/;
        const objectMatch = text.match(objectPattern);

        if (objectMatch) {
          return JSON.parse(objectMatch[1]);
        }

        // If we reach here, parsing failed
        this.log("Failed to extract JSON from text", "error");
        return null;
      }
    } catch (error) {
      this.log(`JSON extraction error: ${error.message}`, "error");
      return null;
    }
  }

  /**
   * Generate a cache key for a given input
   * @param {string} input - The input to generate a key for
   * @returns {string} A cache key
   * @private
   */
  generateCacheKey(input) {
    if (!input) return "";

    // Use a simple hashing approach for the cache key
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return `key_${Math.abs(hash)}`;
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
    const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] CodeGenerationModule: ${message}`;

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
      module: "CodeGenerationModule",
    });
  }
}

export default CodeGenerationModule;
