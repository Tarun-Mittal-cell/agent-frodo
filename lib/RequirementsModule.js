// lib/RequirementsModule.js
import { EventEmitter } from "./EventEmitter";
import axios from "axios";
import fs from "fs/promises";
import path from "path";
import zlib from "zlib";
import { promisify } from "util";
import crypto from "crypto";

// Promisify zlib methods
const deflateRaw = promisify(zlib.deflateRaw);

/**
 * RequirementsModule - A comprehensive system for extracting, managing,
 * validating, and tracking software requirements during the development process.
 *
 * This module serves as the foundation for the requirements engineering phase,
 * providing structured storage, validation, and transformation of requirements
 * into formats usable by subsequent development phases.
 */
class RequirementsModule extends EventEmitter {
  /**
   * Create a new RequirementsModule instance
   * @param {Object} config - Configuration options
   */
  constructor(config = {}) {
    super();

    // Core requirements data structure
    this.requirements = {
      functional: [],
      nonFunctional: [],
      userStories: [],
      constraints: [],
      specifications: [],
    };

    // Configuration with defaults
    this.config = {
      apiKey: process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY || "",
      model: "claude-3-opus-20240229",
      maxTokens: 4096,
      temperature: 0.2, // Lower temperature for more precise requirement extraction
      outputDir: "./requirements",
      autoValidate: true,
      // UML diagram generation settings
      uml: {
        server: "https://www.plantuml.com/plantuml",
        localServer: process.env.PLANTUML_SERVER || null,
        outputFormat: "svg",
        includeSource: true,
        // Eraser API for UML generation (if available)
        eraserApiKey: process.env.ERASER_API_KEY || null,
        eraserTeamId: process.env.ERASER_TEAM_ID || null,
      },
      // Streaming configuration
      streaming: {
        enabled: true,
        chunkSize: 100, // Characters per chunk for streaming
        debounceTime: 300, // ms between streaming updates
      },
      ...config,
    };

    // Tracking metadata
    this.metadata = {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: "1.0.0",
      extractionCount: 0,
      validationCount: 0,
      status: "initialized",
      diagrams: {},
    };

    // Define priority levels and status options
    this.priorityLevels = ["critical", "high", "medium", "low"];
    this.statusOptions = [
      "proposed",
      "approved",
      "implemented",
      "verified",
      "deferred",
      "rejected",
    ];

    // Initialize counters for ID generation
    this.counters = {
      fr: 0, // Functional requirements
      nfr: 0, // Non-functional requirements
      us: 0, // User stories
      con: 0, // Constraints
      spec: 0, // Specifications
    };

    // Cache for NLP processing results
    this.cache = {
      extractionResults: new Map(),
      validationResults: new Map(),
      transformationResults: new Map(),
      renderedDiagrams: new Map(),
    };

    // Active streaming operations
    this.activeStreams = new Map();

    // Build the NLP prompts for various operations
    this.prompts = this.buildPrompts();

    // Initialize logging
    this.debug = config.debug || false;
    this.log("RequirementsModule initialized", "info");
  }

  /**
   * Build the set of prompts used for requirements engineering
   * @returns {Object} A collection of prompts for different requirements tasks
   * @private
   */
  buildPrompts() {
    return {
      extraction: `
You are an expert requirements engineer with decades of experience. Your task is to extract clear, specific requirements from the user's input.
Analyze the text carefully and identify:

1. Functional Requirements (FR): What the system should DO - specific behaviors, features, and capabilities
2. Non-Functional Requirements (NFR): Quality attributes like performance, security, usability, etc.
3. Constraints (CON): Technical, business, or regulatory limitations that must be considered
4. User Stories (US): User-centric descriptions in the format "As a [role], I want [feature] so that [benefit]"

For EACH requirement you identify:
- Assign a descriptive ID (e.g., FR-1, NFR-3)
- Write a clear, concise statement using active voice and "shall" statements for formal requirements
- Rate priority as: Critical, High, Medium, or Low
- Add a brief rationale explaining why this requirement matters

Format your response as structured JSON with these exact categories. Example:
{
  "functional": [
    {
      "id": "FR-1",
      "statement": "The system shall authenticate users via email and password",
      "priority": "high",
      "rationale": "Basic security feature needed to protect user data",
      "source": "Extracted from user input paragraph 2"
    }
  ],
  "nonFunctional": [...],
  "userStories": [...],
  "constraints": [...]
}

Be thorough but precise. Focus on extracting ONLY what's truly specified or strongly implied in the input.
      `,

      validation: `
You are a requirements validation expert who ensures requirements are high-quality and meet the SMART criteria (Specific, Measurable, Achievable, Relevant, Time-bound).

Review the following set of requirements and identify any issues or improvements:

1. Check for:
   - Completeness: Are any obvious requirements missing?
   - Clarity: Is each requirement clear and unambiguous?
   - Consistency: Do requirements contradict each other?
   - Testability: Can each requirement be verified objectively?
   - Feasibility: Are all requirements technically achievable?

2. For each issue found:
   - Identify the specific requirement ID
   - Describe the problem
   - Suggest a specific improvement

Format your response as structured JSON. Example:
{
  "validationResults": {
    "status": "issues_found", // or "valid" if no issues
    "issueCount": 2,
    "issues": [
      {
        "requirementId": "FR-3",
        "issueType": "clarity",
        "description": "Requirement uses ambiguous term 'fast loading'",
        "suggestion": "Specify a measurable loading time, e.g., 'The system shall load pages in under 2 seconds'"
      }
    ],
    "missingRequirements": [
      {
        "category": "functional",
        "description": "No requirements specified for user logout functionality",
        "suggestion": "Add requirement for user session termination"
      }
    ]
  }
}

Focus on substantive issues that would impact development, not merely stylistic concerns.
      `,

      transformation: `
You are an expert at transforming raw requirements into structured formats for software engineering. 

Convert the following requirements into specific output formats that will help with development:

1. For user stories:
   - Break them down into acceptance criteria
   - Add estimated story points (1, 2, 3, 5, 8, 13)
   - Identify frontend and backend components needed

2. For functional requirements:
   - Map each to potential API endpoints or functions
   - Identify data entities and attributes needed
   - Suggest appropriate test cases

3. For non-functional requirements:
   - Suggest specific metrics to measure success
   - Recommend implementation approaches
   - Identify potential technical challenges

Format your response as structured JSON with these transformations organized by requirement ID.
      `,

      umlGeneration: `
You are an expert software architect who creates UML diagrams from requirements.

Based on the provided requirements, generate code representing:

1. A UML Class Diagram showing:
   - Main entities/classes with properties and methods
   - Relationships between classes (inheritance, association, composition)
   - Multiplicity where appropriate

2. A sequence diagram for the primary user flow showing:
   - Actors/systems involved
   - Message exchanges
   - Method calls and returns
   
Use PlantUML syntax for both diagrams. The code should be valid and ready to render in a PlantUML processor.

Ensure diagrams follow these quality standards:
- Class names should be singular nouns in PascalCase
- Methods should use camelCase verbs
- Include proper visibility indicators (+ public, - private, # protected)
- Include data types for attributes and method parameters/returns
- Use correct relationship syntax (--|>, -->, --o, --*, etc.)
- For sequence diagrams, use proper activation/deactivation markers

Provide each diagram as a complete, standalone PlantUML script including @startuml and @enduml tags.
      `,
    };
  }

  /**
   * Extract structured requirements from user input text
   * @param {string} userInput - The raw user input containing requirements
   * @param {Object} options - Options to customize extraction behavior
   * @returns {Promise<Object>} The structured requirements extracted
   */
  async extractRequirements(userInput, options = {}) {
    const streamingEnabled =
      options.streaming !== false && this.config.streaming.enabled;
    const streamId = crypto.randomUUID();

    this.log(
      `Extracting requirements from input (${userInput.length} chars)`,
      "info"
    );

    if (!userInput || userInput.trim().length === 0) {
      throw new Error("User input cannot be empty for requirements extraction");
    }

    // Generate a cache key from the input
    const cacheKey = this.generateCacheKey(userInput);

    // Check if we have cached results
    if (this.cache.extractionResults.has(cacheKey) && !options.forceRefresh) {
      this.log("Using cached extraction results", "debug");
      return this.cache.extractionResults.get(cacheKey);
    }

    // Determine which model and API to use
    const useAnthropicAPI = this.config.apiKey.startsWith("sk-ant");

    try {
      // Emit event to notify processing start
      this.emit("extraction:start", {
        inputLength: userInput.length,
        streamId: streamingEnabled ? streamId : null,
      });

      // Initialize streaming data if enabled
      if (streamingEnabled) {
        this.activeStreams.set(streamId, {
          status: "processing",
          type: "requirements_extraction",
          progress: 0,
          startTime: Date.now(),
          currentData: null,
        });
      }

      // Construct the extraction prompt
      const promptContent = `${this.prompts.extraction}\n\nHere is the user's input to analyze:\n\n${userInput}`;

      let extractedRequirements;

      if (useAnthropicAPI) {
        // Use Anthropic Claude API with streaming if enabled
        if (streamingEnabled) {
          extractedRequirements = await this.streamClaudeExtraction(
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
          extractedRequirements = this.extractJSONFromText(responseContent);
        }
      } else {
        // Use OpenAI API as fallback with streaming if enabled
        if (streamingEnabled) {
          extractedRequirements = await this.streamOpenAIExtraction(
            promptContent,
            streamId
          );
        } else {
          const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
              model: "gpt-4o",
              temperature: this.config.temperature,
              messages: [
                { role: "system", content: this.prompts.extraction },
                { role: "user", content: userInput },
              ],
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.config.apiKey}`,
              },
            }
          );

          // Extract the content from OpenAI's response
          const responseContent = response.data.choices[0].message.content;

          // Parse the JSON from the response
          extractedRequirements = this.extractJSONFromText(responseContent);
        }
      }

      if (!extractedRequirements) {
        throw new Error("Failed to parse requirements from API response");
      }

      // Process and integrate the extracted requirements
      const processedRequirements = await this.processExtractedRequirements(
        extractedRequirements,
        options
      );

      // Cache the results
      this.cache.extractionResults.set(cacheKey, processedRequirements);

      // Update metadata
      this.metadata.extractionCount++;
      this.metadata.updatedAt = new Date().toISOString();
      this.metadata.status = "requirements_extracted";

      // Update streaming status if enabled
      if (streamingEnabled) {
        this.activeStreams.set(streamId, {
          status: "completed",
          type: "requirements_extraction",
          progress: 100,
          endTime: Date.now(),
          currentData: processedRequirements,
        });

        // Emit completion event for streaming
        this.emit("stream:complete", {
          streamId,
          type: "requirements_extraction",
          data: processedRequirements,
        });
      }

      // Emit completion event
      this.emit("extraction:complete", {
        requirementsCount: this.getTotalRequirementsCount(),
        duration: new Date() - new Date(this.metadata.updatedAt),
        streamId: streamingEnabled ? streamId : null,
      });

      // Auto-validate if configured
      if (this.config.autoValidate) {
        this.validateRequirements({
          streaming: streamingEnabled,
        }).catch((err) => {
          this.log(`Auto-validation failed: ${err.message}`, "error");
        });
      }

      return processedRequirements;
    } catch (error) {
      this.log(`Requirements extraction failed: ${error.message}`, "error");

      // Update streaming status if enabled
      if (streamingEnabled) {
        this.activeStreams.set(streamId, {
          status: "error",
          type: "requirements_extraction",
          error: error.message,
          endTime: Date.now(),
        });

        // Emit error event for streaming
        this.emit("stream:error", {
          streamId,
          type: "requirements_extraction",
          error: error.message,
        });
      }

      // Emit error event with details
      this.emit("extraction:error", {
        error: error.message,
        inputLength: userInput.length,
        streamId: streamingEnabled ? streamId : null,
      });

      throw new Error(`Failed to extract requirements: ${error.message}`);
    }
  }

  /**
   * Stream requirements extraction using Claude API
   * @param {string} promptContent - The prompt to send to Claude
   * @param {string} streamId - The ID for this streaming operation
   * @returns {Promise<Object>} The extracted requirements
   * @private
   */
  async streamClaudeExtraction(promptContent, streamId) {
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
        reject(new Error("Streaming request timed out after 120 seconds"));
      }, 120000);

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
                          if (potentialJSON) {
                            responseObject = potentialJSON;
                          }
                        }
                      } catch (jsonErr) {
                        // Ignore JSON parsing errors during streaming
                      }

                      // Update stream with latest content
                      this.updateStreamContent(
                        streamId,
                        "requirements_extraction",
                        {
                          text: accumulatedText,
                          requirements: responseObject,
                        }
                      );
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

            // Extract final requirements from complete response
            const finalRequirements = this.extractJSONFromText(accumulatedText);
            if (finalRequirements) {
              resolve(finalRequirements);
            } else {
              reject(
                new Error(
                  "Failed to parse JSON from complete streaming response"
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
   * Stream requirements extraction using OpenAI API
   * @param {string} promptContent - The prompt to send to OpenAI
   * @param {string} streamId - The ID for this streaming operation
   * @returns {Promise<Object>} The extracted requirements
   * @private
   */
  async streamOpenAIExtraction(promptContent, streamId) {
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
        reject(new Error("Streaming request timed out after 120 seconds"));
      }, 120000);

      // Make streaming request to OpenAI
      axios
        .post(
          "https://api.openai.com/v1/chat/completions",
          {
            model: "gpt-4o",
            temperature: this.config.temperature,
            messages: [
              { role: "system", content: this.prompts.extraction },
              { role: "user", content: promptContent },
            ],
            stream: true,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${this.config.apiKey}`,
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
                      parsedData.choices &&
                      parsedData.choices[0].delta.content
                    ) {
                      const text = parsedData.choices[0].delta.content;
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
                          if (potentialJSON) {
                            responseObject = potentialJSON;
                          }
                        }
                      } catch (jsonErr) {
                        // Ignore JSON parsing errors during streaming
                      }

                      // Update stream with latest content
                      this.updateStreamContent(
                        streamId,
                        "requirements_extraction",
                        {
                          text: accumulatedText,
                          requirements: responseObject,
                        }
                      );
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

            // Extract final requirements from complete response
            const finalRequirements = this.extractJSONFromText(accumulatedText);
            if (finalRequirements) {
              resolve(finalRequirements);
            } else {
              reject(
                new Error(
                  "Failed to parse JSON from complete streaming response"
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

    // Calculate progress based on content if possible
    if (content.requirements) {
      // If we have parsed requirements, we're making good progress
      streamData.progress = Math.min(90, streamData.progress + 10);
    } else {
      // Otherwise increment progress slowly
      streamData.progress = Math.min(75, streamData.progress + 5);
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
   * Process and integrate extracted requirements into the module's state
   * @param {Object} extractedRequirements - The raw extracted requirements
   * @param {Object} options - Processing options
   * @returns {Promise<Object>} The processed requirements
   * @private
   */
  async processExtractedRequirements(extractedRequirements, options = {}) {
    // Process functional requirements
    if (Array.isArray(extractedRequirements.functional)) {
      for (const req of extractedRequirements.functional) {
        // Generate proper ID if not provided
        if (!req.id || !req.id.startsWith("FR-")) {
          this.counters.fr++;
          req.id = `FR-${this.counters.fr}`;
        }

        // Add metadata
        req.createdAt = new Date().toISOString();
        req.status = "proposed";
        req.category = "functional";

        // Add to our requirements store
        this.requirements.functional.push(req);
      }
    }

    // Process non-functional requirements
    if (Array.isArray(extractedRequirements.nonFunctional)) {
      for (const req of extractedRequirements.nonFunctional) {
        // Generate proper ID if not provided
        if (!req.id || !req.id.startsWith("NFR-")) {
          this.counters.nfr++;
          req.id = `NFR-${this.counters.nfr}`;
        }

        // Add metadata
        req.createdAt = new Date().toISOString();
        req.status = "proposed";
        req.category = "nonFunctional";

        // Add to our requirements store
        this.requirements.nonFunctional.push(req);
      }
    }

    // Process user stories
    if (Array.isArray(extractedRequirements.userStories)) {
      for (const story of extractedRequirements.userStories) {
        // Generate proper ID if not provided
        if (!story.id || !story.id.startsWith("US-")) {
          this.counters.us++;
          story.id = `US-${this.counters.us}`;
        }

        // Add metadata
        story.createdAt = new Date().toISOString();
        story.status = "proposed";
        story.category = "userStory";

        // Add to our requirements store
        this.requirements.userStories.push(story);
      }
    }

    // Process constraints
    if (Array.isArray(extractedRequirements.constraints)) {
      for (const constraint of extractedRequirements.constraints) {
        // Generate proper ID if not provided
        if (!constraint.id || !constraint.id.startsWith("CON-")) {
          this.counters.con++;
          constraint.id = `CON-${this.counters.con}`;
        }

        // Add metadata
        constraint.createdAt = new Date().toISOString();
        constraint.status = "proposed";
        constraint.category = "constraint";

        // Add to our requirements store
        this.requirements.constraints.push(constraint);
      }
    }

    // Save to file if specified
    if (options.saveToFile) {
      await this.saveRequirementsToFile();
    }

    return this.requirements;
  }

  /**
   * Validate the current requirements for quality and completeness
   * @param {Object} options - Validation options
   * @returns {Promise<Object>} Validation results
   */
  async validateRequirements(options = {}) {
    const streamingEnabled =
      options.streaming !== false && this.config.streaming.enabled;
    const streamId = crypto.randomUUID();

    this.log("Validating requirements", "info");

    if (this.getTotalRequirementsCount() === 0) {
      throw new Error("No requirements available to validate");
    }

    try {
      // Emit validation start event
      this.emit("validation:start", {
        requirementsCount: this.getTotalRequirementsCount(),
        streamId: streamingEnabled ? streamId : null,
      });

      // Initialize streaming data if enabled
      if (streamingEnabled) {
        this.activeStreams.set(streamId, {
          status: "processing",
          type: "requirements_validation",
          progress: 0,
          startTime: Date.now(),
          currentData: null,
        });
      }

      // Prepare the content for validation
      const requirementsForValidation = JSON.stringify(
        this.requirements,
        null,
        2
      );

      // Determine which model and API to use
      const useAnthropicAPI = this.config.apiKey.startsWith("sk-ant");

      let validationResults;

      if (useAnthropicAPI) {
        if (streamingEnabled) {
          // Use streaming validation
          const promptContent = `${this.prompts.validation}\n\nRequirements to validate:\n\n${requirementsForValidation}`;
          validationResults = await this.streamClaudeValidation(
            promptContent,
            streamId
          );
        } else {
          // Use standard validation
          const response = await axios.post(
            "https://api.anthropic.com/v1/messages",
            {
              model: this.config.model,
              max_tokens: this.config.maxTokens,
              temperature: 0.2,
              messages: [
                {
                  role: "user",
                  content: `${this.prompts.validation}\n\nRequirements to validate:\n\n${requirementsForValidation}`,
                },
              ],
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
          validationResults = this.extractJSONFromText(responseContent);
        }
      } else {
        if (streamingEnabled) {
          // Use streaming validation
          const messages = [
            { role: "system", content: this.prompts.validation },
            { role: "user", content: requirementsForValidation },
          ];
          validationResults = await this.streamOpenAIValidation(
            messages,
            streamId
          );
        } else {
          // Use standard validation
          const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
              model: "gpt-4o",
              temperature: 0.2,
              messages: [
                { role: "system", content: this.prompts.validation },
                { role: "user", content: requirementsForValidation },
              ],
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.config.apiKey}`,
              },
            }
          );

          // Extract the content from OpenAI's response
          const responseContent = response.data.choices[0].message.content;

          // Parse the JSON from the response
          validationResults = this.extractJSONFromText(responseContent);
        }
      }

      if (!validationResults || !validationResults.validationResults) {
        throw new Error("Failed to parse validation results from API response");
      }

      // Store validation results in metadata
      this.metadata.validationResults = validationResults.validationResults;
      this.metadata.validationCount++;
      this.metadata.lastValidatedAt = new Date().toISOString();

      // Apply suggested fixes if requested
      if (
        options.applyFixes &&
        validationResults.validationResults.issues &&
        validationResults.validationResults.issues.length > 0
      ) {
        await this.applyValidationFixes(
          validationResults.validationResults.issues
        );
      }

      // Update streaming status if enabled
      if (streamingEnabled) {
        this.activeStreams.set(streamId, {
          status: "completed",
          type: "requirements_validation",
          progress: 100,
          endTime: Date.now(),
          currentData: validationResults.validationResults,
        });

        // Emit completion event for streaming
        this.emit("stream:complete", {
          streamId,
          type: "requirements_validation",
          data: validationResults.validationResults,
        });
      }

      // Emit validation complete event
      this.emit("validation:complete", {
        status: validationResults.validationResults.status,
        issueCount: validationResults.validationResults.issueCount || 0,
        streamId: streamingEnabled ? streamId : null,
      });

      return validationResults.validationResults;
    } catch (error) {
      this.log(`Requirements validation failed: ${error.message}`, "error");

      // Update streaming status if enabled
      if (streamingEnabled) {
        this.activeStreams.set(streamId, {
          status: "error",
          type: "requirements_validation",
          error: error.message,
          endTime: Date.now(),
        });

        // Emit error event for streaming
        this.emit("stream:error", {
          streamId,
          type: "requirements_validation",
          error: error.message,
        });
      }

      // Emit validation error event
      this.emit("validation:error", {
        error: error.message,
        requirementsCount: this.getTotalRequirementsCount(),
        streamId: streamingEnabled ? streamId : null,
      });

      throw new Error(`Validation failed: ${error.message}`);
    }
  }

  /**
   * Stream validation using Claude API
   * @param {string} promptContent - The prompt to send to Claude
   * @param {string} streamId - The ID for this streaming operation
   * @returns {Promise<Object>} The validation results
   * @private
   */
  async streamClaudeValidation(promptContent, streamId) {
    // Use similar approach as streamClaudeExtraction but adapted for validation
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
        reject(new Error("Streaming request timed out after 120 seconds"));
      }, 120000);

      // Make streaming request to Claude
      axios
        .post(
          "https://api.anthropic.com/v1/messages",
          {
            model: this.config.model,
            max_tokens: this.config.maxTokens,
            temperature: 0.2,
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
                          if (
                            potentialJSON &&
                            potentialJSON.validationResults
                          ) {
                            responseObject = potentialJSON;
                          }
                        }
                      } catch (jsonErr) {
                        // Ignore JSON parsing errors during streaming
                      }

                      // Update stream with latest content
                      this.updateStreamContent(
                        streamId,
                        "requirements_validation",
                        {
                          text: accumulatedText,
                          validationResults: responseObject
                            ? responseObject.validationResults
                            : null,
                        }
                      );
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

            // Extract final validation results from complete response
            const finalResults = this.extractJSONFromText(accumulatedText);
            if (finalResults) {
              resolve(finalResults);
            } else {
              reject(
                new Error(
                  "Failed to parse JSON from complete streaming response"
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
   * Stream validation using OpenAI API
   * @param {Array} messages - The messages to send to OpenAI
   * @param {string} streamId - The ID for this streaming operation
   * @returns {Promise<Object>} The validation results
   * @private
   */
  async streamOpenAIValidation(messages, streamId) {
    // Use similar approach as streamOpenAIExtraction but adapted for validation
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
        reject(new Error("Streaming request timed out after 120 seconds"));
      }, 120000);

      // Make streaming request to OpenAI
      axios
        .post(
          "https://api.openai.com/v1/chat/completions",
          {
            model: "gpt-4o",
            temperature: 0.2,
            messages: messages,
            stream: true,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${this.config.apiKey}`,
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
                      parsedData.choices &&
                      parsedData.choices[0].delta.content
                    ) {
                      const text = parsedData.choices[0].delta.content;
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
                          if (
                            potentialJSON &&
                            potentialJSON.validationResults
                          ) {
                            responseObject = potentialJSON;
                          }
                        }
                      } catch (jsonErr) {
                        // Ignore JSON parsing errors during streaming
                      }

                      // Update stream with latest content
                      this.updateStreamContent(
                        streamId,
                        "requirements_validation",
                        {
                          text: accumulatedText,
                          validationResults: responseObject
                            ? responseObject.validationResults
                            : null,
                        }
                      );
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

            // Extract final validation results from complete response
            const finalResults = this.extractJSONFromText(accumulatedText);
            if (finalResults) {
              resolve(finalResults);
            } else {
              reject(
                new Error(
                  "Failed to parse JSON from complete streaming response"
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
   * Apply suggested fixes from validation
   * @param {Array} issues - The issues to fix
   * @returns {Promise<void>}
   * @private
   */
  async applyValidationFixes(issues) {
    this.log(`Applying ${issues.length} validation fixes`, "info");

    for (const issue of issues) {
      const { requirementId, suggestion } = issue;

      if (!requirementId || !suggestion) {
        continue;
      }

      // Find the requirement by ID
      const requirement = this.findRequirementById(requirementId);

      if (requirement) {
        // Add an annotation about the change
        if (!requirement.revisions) {
          requirement.revisions = [];
        }

        requirement.revisions.push({
          timestamp: new Date().toISOString(),
          issueType: issue.issueType,
          previousStatement: requirement.statement,
          change: "Applied validation fix",
        });

        // Update the statement with the suggestion
        // For more complex suggestions, we'd need more sophisticated logic
        if (
          issue.issueType === "clarity" ||
          issue.issueType === "specificity"
        ) {
          requirement.statement = suggestion;
        }

        // Mark the requirement as reviewed
        requirement.reviewed = true;
        requirement.reviewedAt = new Date().toISOString();
      }
    }

    this.log("Validation fixes applied", "info");
  }

  /**
   * Generate UML diagrams based on the requirements
   * @param {Object} options - UML generation options
   * @returns {Promise<Object>} Generated UML content
   */
  async generateUMLDiagrams(options = {}) {
    const streamingEnabled =
      options.streaming !== false && this.config.streaming.enabled;
    const streamId = crypto.randomUUID();
    const renderDiagrams = options.render !== false;
    const outputFormat =
      options.outputFormat || this.config.uml.outputFormat || "svg";

    this.log("Generating UML diagrams from requirements", "info");

    if (this.getTotalRequirementsCount() === 0) {
      throw new Error("No requirements available for UML generation");
    }

    try {
      // Emit UML generation start event
      this.emit("uml:start", {
        requirementsCount: this.getTotalRequirementsCount(),
        streamId: streamingEnabled ? streamId : null,
      });

      // Initialize streaming data if enabled
      if (streamingEnabled) {
        this.activeStreams.set(streamId, {
          status: "processing",
          type: "uml_generation",
          progress: 0,
          startTime: Date.now(),
          currentData: null,
        });
      }

      // Prepare the content for UML generation
      const requirementsForUML = JSON.stringify(this.requirements, null, 2);

      // Determine which model and API to use
      const useAnthropicAPI = this.config.apiKey.startsWith("sk-ant");

      let umlResults;

      if (useAnthropicAPI) {
        if (streamingEnabled) {
          // Use streaming UML generation
          const promptContent = `${this.prompts.umlGeneration}\n\nRequirements to model with UML:\n\n${requirementsForUML}`;
          umlResults = await this.streamClaudeUMLGeneration(
            promptContent,
            streamId
          );
        } else {
          // Use standard UML generation
          const response = await axios.post(
            "https://api.anthropic.com/v1/messages",
            {
              model: this.config.model,
              max_tokens: this.config.maxTokens,
              temperature: 0.2,
              messages: [
                {
                  role: "user",
                  content: `${this.prompts.umlGeneration}\n\nRequirements to model with UML:\n\n${requirementsForUML}`,
                },
              ],
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

          // Extract PlantUML code blocks
          umlResults = this.extractUMLFromText(responseContent);
        }
      } else {
        if (streamingEnabled) {
          // Use streaming UML generation
          const messages = [
            { role: "system", content: this.prompts.umlGeneration },
            { role: "user", content: requirementsForUML },
          ];
          umlResults = await this.streamOpenAIUMLGeneration(messages, streamId);
        } else {
          // Use standard UML generation
          const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
              model: "gpt-4o",
              temperature: 0.2,
              messages: [
                { role: "system", content: this.prompts.umlGeneration },
                { role: "user", content: requirementsForUML },
              ],
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.config.apiKey}`,
              },
            }
          );

          // Extract the content from OpenAI's response
          const responseContent = response.data.choices[0].message.content;

          // Extract PlantUML code blocks
          umlResults = this.extractUMLFromText(responseContent);
        }
      }

      if (
        !umlResults ||
        (!umlResults.classDiagram && !umlResults.sequenceDiagram)
      ) {
        throw new Error("Failed to extract UML diagrams from API response");
      }

      // Update streaming progress
      if (streamingEnabled) {
        this.updateStreamContent(streamId, "uml_generation", {
          status: "processing",
          progress: 50,
          message: "UML diagrams extracted, rendering diagrams...",
          diagrams: umlResults,
        });
      }

      // Render diagrams if requested
      if (renderDiagrams) {
        umlResults = await this.renderUMLDiagrams(umlResults, outputFormat);
      }

      // Save generated UML if requested
      if (options.saveToFile) {
        await this.saveUMLToFile(umlResults);
      }

      // Store UML in metadata
      this.metadata.umlGenerated = true;
      this.metadata.umlGeneratedAt = new Date().toISOString();
      this.metadata.diagrams = {
        classDiagram: umlResults.classDiagram ? true : false,
        sequenceDiagram: umlResults.sequenceDiagram ? true : false,
        format: outputFormat,
        renderedAt: new Date().toISOString(),
      };

      // Update streaming status if enabled
      if (streamingEnabled) {
        this.activeStreams.set(streamId, {
          status: "completed",
          type: "uml_generation",
          progress: 100,
          endTime: Date.now(),
          currentData: umlResults,
        });

        // Emit completion event for streaming
        this.emit("stream:complete", {
          streamId,
          type: "uml_generation",
          data: umlResults,
        });
      }

      // Emit UML generation complete event
      this.emit("uml:complete", {
        diagrams: Object.keys(umlResults),
        streamId: streamingEnabled ? streamId : null,
      });

      return umlResults;
    } catch (error) {
      this.log(`UML generation failed: ${error.message}`, "error");

      // Update streaming status if enabled
      if (streamingEnabled) {
        this.activeStreams.set(streamId, {
          status: "error",
          type: "uml_generation",
          error: error.message,
          endTime: Date.now(),
        });

        // Emit error event for streaming
        this.emit("stream:error", {
          streamId,
          type: "uml_generation",
          error: error.message,
        });
      }

      // Emit UML generation error event
      this.emit("uml:error", {
        error: error.message,
        requirementsCount: this.getTotalRequirementsCount(),
        streamId: streamingEnabled ? streamId : null,
      });

      throw new Error(`UML generation failed: ${error.message}`);
    }
  }

  /**
   * Stream UML generation using Claude API
   * @param {string} promptContent - The prompt to send to Claude
   * @param {string} streamId - The ID for this streaming operation
   * @returns {Promise<Object>} The UML diagrams
   * @private
   */
  async streamClaudeUMLGeneration(promptContent, streamId) {
    return new Promise((resolve, reject) => {
      let accumulatedText = "";
      let classDiagramStarted = false;
      let sequenceDiagramStarted = false;
      let classDiagramBuffer = "";
      let sequenceDiagramBuffer = "";

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
            temperature: 0.2,
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
                      parsedData.delta.text
                    ) {
                      const text = parsedData.delta.text;
                      accumulatedText += text;

                      // Detect and track class diagram content
                      if (
                        text.includes("@startuml") &&
                        text.toLowerCase().includes("class ") &&
                        !classDiagramStarted
                      ) {
                        classDiagramStarted = true;
                      }

                      if (classDiagramStarted && !sequenceDiagramStarted) {
                        classDiagramBuffer += text;

                        if (text.includes("@enduml")) {
                          classDiagramStarted = false;
                        }
                      }

                      // Detect and track sequence diagram content
                      if (
                        text.includes("@startuml") &&
                        (text.includes("->") ||
                          text.toLowerCase().includes("sequence")) &&
                        !sequenceDiagramStarted &&
                        !classDiagramStarted
                      ) {
                        sequenceDiagramStarted = true;
                      }

                      if (sequenceDiagramStarted) {
                        sequenceDiagramBuffer += text;

                        if (text.includes("@enduml")) {
                          sequenceDiagramStarted = false;
                        }
                      }

                      // Extract diagrams from buffers
                      const currentDiagrams = {};

                      if (
                        classDiagramBuffer.includes("@startuml") &&
                        classDiagramBuffer.includes("@enduml")
                      ) {
                        currentDiagrams.classDiagram = this.extractUMLCode(
                          classDiagramBuffer,
                          "class"
                        );
                      }

                      if (
                        sequenceDiagramBuffer.includes("@startuml") &&
                        sequenceDiagramBuffer.includes("@enduml")
                      ) {
                        currentDiagrams.sequenceDiagram = this.extractUMLCode(
                          sequenceDiagramBuffer,
                          "sequence"
                        );
                      }

                      // Update stream with latest content
                      this.updateStreamContent(streamId, "uml_generation", {
                        text: accumulatedText,
                        diagrams: currentDiagrams,
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

            // Extract final UML diagrams from complete response
            const finalDiagrams = this.extractUMLFromText(accumulatedText);
            if (
              finalDiagrams &&
              (finalDiagrams.classDiagram || finalDiagrams.sequenceDiagram)
            ) {
              resolve(finalDiagrams);
            } else {
              reject(
                new Error(
                  "Failed to extract UML diagrams from complete streaming response"
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
   * Stream UML generation using OpenAI API
   * @param {Array} messages - The messages to send to OpenAI
   * @param {string} streamId - The ID for this streaming operation
   * @returns {Promise<Object>} The UML diagrams
   * @private
   */
  async streamOpenAIUMLGeneration(messages, streamId) {
    return new Promise((resolve, reject) => {
      let accumulatedText = "";
      let classDiagramStarted = false;
      let sequenceDiagramStarted = false;
      let classDiagramBuffer = "";
      let sequenceDiagramBuffer = "";

      const controller = new AbortController();
      const signal = controller.signal;

      // Timeout handling
      const timeout = setTimeout(() => {
        controller.abort();
        reject(new Error("Streaming request timed out after 180 seconds"));
      }, 180000);

      // Make streaming request to OpenAI
      axios
        .post(
          "https://api.openai.com/v1/chat/completions",
          {
            model: "gpt-4o",
            temperature: 0.2,
            messages: messages,
            stream: true,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${this.config.apiKey}`,
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
                      parsedData.choices &&
                      parsedData.choices[0].delta.content
                    ) {
                      const text = parsedData.choices[0].delta.content;
                      accumulatedText += text;

                      // Detect and track class diagram content
                      if (
                        text.includes("@startuml") &&
                        text.toLowerCase().includes("class ") &&
                        !classDiagramStarted
                      ) {
                        classDiagramStarted = true;
                      }

                      if (classDiagramStarted && !sequenceDiagramStarted) {
                        classDiagramBuffer += text;

                        if (text.includes("@enduml")) {
                          classDiagramStarted = false;
                        }
                      }

                      // Detect and track sequence diagram content
                      if (
                        text.includes("@startuml") &&
                        (text.includes("->") ||
                          text.toLowerCase().includes("sequence")) &&
                        !sequenceDiagramStarted &&
                        !classDiagramStarted
                      ) {
                        sequenceDiagramStarted = true;
                      }

                      if (sequenceDiagramStarted) {
                        sequenceDiagramBuffer += text;

                        if (text.includes("@enduml")) {
                          sequenceDiagramStarted = false;
                        }
                      }

                      // Extract diagrams from buffers
                      const currentDiagrams = {};

                      if (
                        classDiagramBuffer.includes("@startuml") &&
                        classDiagramBuffer.includes("@enduml")
                      ) {
                        currentDiagrams.classDiagram = this.extractUMLCode(
                          classDiagramBuffer,
                          "class"
                        );
                      }

                      if (
                        sequenceDiagramBuffer.includes("@startuml") &&
                        sequenceDiagramBuffer.includes("@enduml")
                      ) {
                        currentDiagrams.sequenceDiagram = this.extractUMLCode(
                          sequenceDiagramBuffer,
                          "sequence"
                        );
                      }

                      // Update stream with latest content
                      this.updateStreamContent(streamId, "uml_generation", {
                        text: accumulatedText,
                        diagrams: currentDiagrams,
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

            // Extract final UML diagrams from complete response
            const finalDiagrams = this.extractUMLFromText(accumulatedText);
            if (
              finalDiagrams &&
              (finalDiagrams.classDiagram || finalDiagrams.sequenceDiagram)
            ) {
              resolve(finalDiagrams);
            } else {
              reject(
                new Error(
                  "Failed to extract UML diagrams from complete streaming response"
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
   * Extract clean UML code from text
   * @param {string} text - The text containing UML code
   * @param {string} type - The type of diagram (class or sequence)
   * @returns {string} The extracted UML code
   * @private
   */
  extractUMLCode(text, type) {
    try {
      const startTag = "@startuml";
      const endTag = "@enduml";

      const startIndex = text.indexOf(startTag);
      if (startIndex === -1) return null;

      const endIndex = text.indexOf(endTag, startIndex);
      if (endIndex === -1) return null;

      // Extract the UML code including the tags
      const umlCode = text.substring(startIndex, endIndex + endTag.length);

      // For class diagrams, ensure it contains class definitions
      if (type === "class" && !umlCode.toLowerCase().includes("class ")) {
        return null;
      }

      // For sequence diagrams, ensure it contains sequence elements
      if (type === "sequence" && !umlCode.includes("->")) {
        return null;
      }

      return umlCode;
    } catch (error) {
      this.log(`Error extracting UML code: ${error.message}`, "error");
      return null;
    }
  }

  /**
   * Render UML diagrams to visual formats
   * @param {Object} umlResults - The UML diagram source code
   * @param {string} format - The output format (svg, png, etc.)
   * @returns {Promise<Object>} The rendered diagrams
   * @private
   */
  async renderUMLDiagrams(umlResults, format = "svg") {
    this.log(`Rendering UML diagrams to ${format} format`, "info");

    const result = {
      classDiagram: umlResults.classDiagram,
      sequenceDiagram: umlResults.sequenceDiagram,
      renderedClassDiagram: null,
      renderedSequenceDiagram: null,
    };

    try {
      // First check if we can use Eraser API for rendering
      if (this.config.uml.eraserApiKey && this.config.uml.eraserTeamId) {
        return await this.renderUMLWithEraser(umlResults, format);
      }

      // Otherwise use PlantUML server for rendering
      // Determine the PlantUML server to use
      const plantUmlServer =
        this.config.uml.localServer ||
        this.config.uml.server ||
        "https://www.plantuml.com/plantuml";

      // Render class diagram if present
      if (umlResults.classDiagram) {
        const classDiagramUrl = await this.generatePlantUmlUrl(
          umlResults.classDiagram,
          plantUmlServer,
          format
        );

        // Fetch the rendered diagram
        if (classDiagramUrl) {
          result.renderedClassDiagram = await this.fetchRenderedDiagram(
            classDiagramUrl,
            format
          );

          // Cache the result
          const cacheKey = this.generateCacheKey(umlResults.classDiagram);
          this.cache.renderedDiagrams.set(
            `${cacheKey}_class_${format}`,
            result.renderedClassDiagram
          );
        }
      }

      // Render sequence diagram if present
      if (umlResults.sequenceDiagram) {
        const sequenceDiagramUrl = await this.generatePlantUmlUrl(
          umlResults.sequenceDiagram,
          plantUmlServer,
          format
        );

        // Fetch the rendered diagram
        if (sequenceDiagramUrl) {
          result.renderedSequenceDiagram = await this.fetchRenderedDiagram(
            sequenceDiagramUrl,
            format
          );

          // Cache the result
          const cacheKey = this.generateCacheKey(umlResults.sequenceDiagram);
          this.cache.renderedDiagrams.set(
            `${cacheKey}_sequence_${format}`,
            result.renderedSequenceDiagram
          );
        }
      }

      return result;
    } catch (error) {
      this.log(`Error rendering UML diagrams: ${error.message}`, "error");

      // Return the source diagrams even if rendering failed
      return {
        classDiagram: umlResults.classDiagram,
        sequenceDiagram: umlResults.sequenceDiagram,
        renderingError: error.message,
      };
    }
  }

  /**
   * Generate a PlantUML URL for rendering
   * @param {string} umlCode - The PlantUML code
   * @param {string} server - The PlantUML server URL
   * @param {string} format - The output format
   * @returns {Promise<string>} The URL for the rendered diagram
   * @private
   */
  async generatePlantUmlUrl(umlCode, server, format) {
    try {
      if (!umlCode) return null;

      // Ensure the UML code is clean and properly formatted
      if (!umlCode.includes("@startuml")) {
        umlCode = `@startuml\n${umlCode}\n@enduml`;
      }

      // Compress the UML text using zlib deflate
      const deflated = await deflateRaw(Buffer.from(umlCode, "utf8"));

      // Encode the compressed data in base64
      const base64 = deflated.toString("base64");

      // Convert to PlantUML encoding (replace specific characters)
      const encoded = this.encodePlantUmlUrl(base64);

      // Construct the URL
      return `${server}/${format}/${encoded}`;
    } catch (error) {
      this.log(`Error generating PlantUML URL: ${error.message}`, "error");
      return null;
    }
  }

  /**
   * Encode a base64 string for PlantUML URL
   * @param {string} base64 - The base64 string to encode
   * @returns {string} The encoded string for PlantUML URL
   * @private
   */
  encodePlantUmlUrl(base64) {
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  }

  /**
   * Fetch a rendered diagram from a URL
   * @param {string} url - The URL to fetch the diagram from
   * @param {string} format - The format of the diagram
   * @returns {Promise<Object>} The rendered diagram
   * @private
   */
  async fetchRenderedDiagram(url, format) {
    try {
      const response = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 30000,
      });

      // Get the base64 representation
      const base64 = Buffer.from(response.data).toString("base64");

      return {
        contentType: format === "svg" ? "image/svg+xml" : `image/${format}`,
        data: base64,
        format: format,
        url: url,
      };
    } catch (error) {
      this.log(`Error fetching rendered diagram: ${error.message}`, "error");
      throw error;
    }
  }

  /**
   * Render UML diagrams using Eraser API
   * @param {Object} umlResults - The UML diagram source code
   * @param {string} format - The output format (svg, png, etc.)
   * @returns {Promise<Object>} The rendered diagrams
   * @private
   */
  async renderUMLWithEraser(umlResults, format) {
    this.log("Rendering UML diagrams with Eraser API", "info");

    const result = {
      classDiagram: umlResults.classDiagram,
      sequenceDiagram: umlResults.sequenceDiagram,
      renderedClassDiagram: null,
      renderedSequenceDiagram: null,
      eraserDiagrams: {},
    };

    try {
      // Render class diagram if present
      if (umlResults.classDiagram) {
        const classDiagramResponse = await axios.post(
          `https://api.eraser.io/team/${this.config.uml.eraserTeamId}/diagrams`,
          {
            source: umlResults.classDiagram,
            sourceType: "plantuml",
            outputFormat: format.toUpperCase(),
            diagramType: "CLASS",
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${this.config.uml.eraserApiKey}`,
            },
          }
        );

        if (classDiagramResponse.data && classDiagramResponse.data.id) {
          result.eraserDiagrams.classDiagram = classDiagramResponse.data;

          // Get the rendered image data
          const renderedResponse = await axios.get(
            `https://api.eraser.io/team/${this.config.uml.eraserTeamId}/diagrams/${classDiagramResponse.data.id}/rendered`,
            {
              headers: {
                Authorization: `Bearer ${this.config.uml.eraserApiKey}`,
              },
              responseType: "arraybuffer",
            }
          );

          result.renderedClassDiagram = {
            contentType:
              format === "svg"
                ? "image/svg+xml"
                : `image/${format.toLowerCase()}`,
            data: Buffer.from(renderedResponse.data).toString("base64"),
            format: format.toLowerCase(),
            eraserId: classDiagramResponse.data.id,
          };
        }
      }

      // Render sequence diagram if present
      if (umlResults.sequenceDiagram) {
        const sequenceDiagramResponse = await axios.post(
          `https://api.eraser.io/team/${this.config.uml.eraserTeamId}/diagrams`,
          {
            source: umlResults.sequenceDiagram,
            sourceType: "plantuml",
            outputFormat: format.toUpperCase(),
            diagramType: "SEQUENCE",
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${this.config.uml.eraserApiKey}`,
            },
          }
        );

        if (sequenceDiagramResponse.data && sequenceDiagramResponse.data.id) {
          result.eraserDiagrams.sequenceDiagram = sequenceDiagramResponse.data;

          // Get the rendered image data
          const renderedResponse = await axios.get(
            `https://api.eraser.io/team/${this.config.uml.eraserTeamId}/diagrams/${sequenceDiagramResponse.data.id}/rendered`,
            {
              headers: {
                Authorization: `Bearer ${this.config.uml.eraserApiKey}`,
              },
              responseType: "arraybuffer",
            }
          );

          result.renderedSequenceDiagram = {
            contentType:
              format === "svg"
                ? "image/svg+xml"
                : `image/${format.toLowerCase()}`,
            data: Buffer.from(renderedResponse.data).toString("base64"),
            format: format.toLowerCase(),
            eraserId: sequenceDiagramResponse.data.id,
          };
        }
      }

      return result;
    } catch (error) {
      this.log(`Error rendering UML with Eraser: ${error.message}`, "error");

      // Fall back to PlantUML rendering
      this.log("Falling back to PlantUML rendering", "warn");
      return this.renderUMLDiagrams(umlResults, format);
    }
  }

  /**
   * Generate user stories from existing functional requirements
   * @param {Object} options - Story generation options
   * @returns {Promise<Array>} Generated user stories
   */
  async generateUserStories(options = {}) {
    const streamingEnabled =
      options.streaming !== false && this.config.streaming.enabled;
    const streamId = crypto.randomUUID();

    this.log("Generating user stories from functional requirements", "info");

    if (this.requirements.functional.length === 0) {
      throw new Error(
        "No functional requirements available for user story generation"
      );
    }

    try {
      // Emit event to notify processing start
      this.emit("story:start", {
        requirementsCount: this.requirements.functional.length,
        streamId: streamingEnabled ? streamId : null,
      });

      // Initialize streaming data if enabled
      if (streamingEnabled) {
        this.activeStreams.set(streamId, {
          status: "processing",
          type: "user_story_generation",
          progress: 0,
          startTime: Date.now(),
          currentData: null,
        });
      }

      // Create a prompt for user story generation
      const prompt = `
Convert the following functional requirements into user stories following the format:
"As a [role], I want to [action], so that [benefit]"

For each user story, also include:
1. Acceptance criteria (3-5 specific conditions that must be met)
2. Estimated story points (using Fibonacci: 1, 2, 3, 5, 8, 13)
3. Dependencies on other requirements (if any)

Functional Requirements:
${this.requirements.functional
  .map(
    (fr) =>
      `ID: ${fr.id}
Statement: ${fr.statement}
Priority: ${fr.priority}`
  )
  .join("\n\n")}

Return the user stories in JSON format with the following structure:
{
  "userStories": [
    {
      "id": "US-1",
      "statement": "As a user, I want to...",
      "acceptanceCriteria": ["Criteria 1", "Criteria 2", ...],
      "storyPoints": 3,
      "priority": "high",
      "relatedRequirements": ["FR-1", "FR-2"]
    },
    ...
  ]
}
      `;

      // Determine which model and API to use
      const useAnthropicAPI = this.config.apiKey.startsWith("sk-ant");

      let storiesResults;

      if (useAnthropicAPI) {
        if (streamingEnabled) {
          // Use streaming story generation
          storiesResults = await this.streamClaudeStoryGeneration(
            prompt,
            streamId
          );
        } else {
          // Use standard story generation
          const response = await axios.post(
            "https://api.anthropic.com/v1/messages",
            {
              model: this.config.model,
              max_tokens: this.config.maxTokens,
              temperature: 0.3,
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
          const responseContent = response.data.content[0].text;

          // Extract JSON with user stories
          storiesResults = this.extractJSONFromText(responseContent);
        }
      } else {
        if (streamingEnabled) {
          // Use streaming story generation
          const messages = [
            {
              role: "system",
              content: "You are an expert in agile requirements engineering.",
            },
            { role: "user", content: prompt },
          ];
          storiesResults = await this.streamOpenAIStoryGeneration(
            messages,
            streamId
          );
        } else {
          // Use standard story generation
          const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
              model: "gpt-4o",
              temperature: 0.3,
              messages: [
                {
                  role: "system",
                  content:
                    "You are an expert in agile requirements engineering.",
                },
                { role: "user", content: prompt },
              ],
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.config.apiKey}`,
              },
            }
          );

          // Extract the content from OpenAI's response
          const responseContent = response.data.choices[0].message.content;

          // Extract JSON with user stories
          storiesResults = this.extractJSONFromText(responseContent);
        }
      }

      if (!storiesResults || !Array.isArray(storiesResults.userStories)) {
        throw new Error("Failed to extract user stories from API response");
      }

      // Process and integrate the user stories
      for (const story of storiesResults.userStories) {
        // Generate ID if needed
        if (!story.id) {
          this.counters.us++;
          story.id = `US-${this.counters.us}`;
        }

        // Add metadata
        story.createdAt = new Date().toISOString();
        story.status = "proposed";
        story.category = "userStory";
        story.generatedFrom = story.relatedRequirements || [];

        // Add to our requirements store if not a duplicate
        if (!this.requirements.userStories.some((us) => us.id === story.id)) {
          this.requirements.userStories.push(story);
        }
      }

      // Update streaming status if enabled
      if (streamingEnabled) {
        this.activeStreams.set(streamId, {
          status: "completed",
          type: "user_story_generation",
          progress: 100,
          endTime: Date.now(),
          currentData: this.requirements.userStories,
        });

        // Emit completion event for streaming
        this.emit("stream:complete", {
          streamId,
          type: "user_story_generation",
          data: this.requirements.userStories,
        });
      }

      // Emit completion event
      this.emit("story:complete", {
        storiesCount: this.requirements.userStories.length,
        streamId: streamingEnabled ? streamId : null,
      });

      // Save to file if specified
      if (options.saveToFile) {
        await this.saveRequirementsToFile();
      }

      return this.requirements.userStories;
    } catch (error) {
      this.log(`User story generation failed: ${error.message}`, "error");

      // Update streaming status if enabled
      if (streamingEnabled) {
        this.activeStreams.set(streamId, {
          status: "error",
          type: "user_story_generation",
          error: error.message,
          endTime: Date.now(),
        });

        // Emit error event for streaming
        this.emit("stream:error", {
          streamId,
          type: "user_story_generation",
          error: error.message,
        });
      }

      // Emit error event
      this.emit("story:error", {
        error: error.message,
        streamId: streamingEnabled ? streamId : null,
      });

      throw new Error(`Failed to generate user stories: ${error.message}`);
    }
  }

  /**
   * Stream user story generation using Claude API
   * @param {string} promptContent - The prompt to send to Claude
   * @param {string} streamId - The ID for this streaming operation
   * @returns {Promise<Object>} The user stories
   * @private
   */
  async streamClaudeStoryGeneration(promptContent, streamId) {
    // Use similar approach as other streaming methods but adapted for story generation
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
        reject(new Error("Streaming request timed out after 120 seconds"));
      }, 120000);

      // Make streaming request to Claude
      axios
        .post(
          "https://api.anthropic.com/v1/messages",
          {
            model: this.config.model,
            max_tokens: this.config.maxTokens,
            temperature: 0.3,
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
                          if (
                            potentialJSON &&
                            Array.isArray(potentialJSON.userStories)
                          ) {
                            responseObject = potentialJSON;
                          }
                        }
                      } catch (jsonErr) {
                        // Ignore JSON parsing errors during streaming
                      }

                      // Update stream with latest content
                      this.updateStreamContent(
                        streamId,
                        "user_story_generation",
                        {
                          text: accumulatedText,
                          userStories: responseObject
                            ? responseObject.userStories
                            : null,
                        }
                      );
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

            // Extract final user stories from complete response
            const finalStories = this.extractJSONFromText(accumulatedText);
            if (finalStories && Array.isArray(finalStories.userStories)) {
              resolve(finalStories);
            } else {
              reject(
                new Error(
                  "Failed to parse JSON from complete streaming response"
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
   * Stream user story generation using OpenAI API
   * @param {Array} messages - The messages to send to OpenAI
   * @param {string} streamId - The ID for this streaming operation
   * @returns {Promise<Object>} The user stories
   * @private
   */
  async streamOpenAIStoryGeneration(messages, streamId) {
    // Use similar approach as other streaming methods but adapted for story generation
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
        reject(new Error("Streaming request timed out after 120 seconds"));
      }, 120000);

      // Make streaming request to OpenAI
      axios
        .post(
          "https://api.openai.com/v1/chat/completions",
          {
            model: "gpt-4o",
            temperature: 0.3,
            messages: messages,
            stream: true,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${this.config.apiKey}`,
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
                      parsedData.choices &&
                      parsedData.choices[0].delta.content
                    ) {
                      const text = parsedData.choices[0].delta.content;
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
                          if (
                            potentialJSON &&
                            Array.isArray(potentialJSON.userStories)
                          ) {
                            responseObject = potentialJSON;
                          }
                        }
                      } catch (jsonErr) {
                        // Ignore JSON parsing errors during streaming
                      }

                      // Update stream with latest content
                      this.updateStreamContent(
                        streamId,
                        "user_story_generation",
                        {
                          text: accumulatedText,
                          userStories: responseObject
                            ? responseObject.userStories
                            : null,
                        }
                      );
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

            // Extract final user stories from complete response
            const finalStories = this.extractJSONFromText(accumulatedText);
            if (finalStories && Array.isArray(finalStories.userStories)) {
              resolve(finalStories);
            } else {
              reject(
                new Error(
                  "Failed to parse JSON from complete streaming response"
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
   * Save requirements to file
   * @param {string} [filePath] - Optional custom file path
   * @returns {Promise<string>} Path to the saved file
   */
  async saveRequirementsToFile(filePath) {
    const outputPath =
      filePath || path.join(this.config.outputDir, "requirements.json");

    try {
      // Ensure output directory exists
      await fs.mkdir(path.dirname(outputPath), { recursive: true });

      // Prepare data for saving
      const dataToSave = {
        metadata: this.metadata,
        requirements: this.requirements,
      };

      // Write to file
      await fs.writeFile(
        outputPath,
        JSON.stringify(dataToSave, null, 2),
        "utf8"
      );

      this.log(`Requirements saved to ${outputPath}`, "info");
      return outputPath;
    } catch (error) {
      this.log(`Failed to save requirements: ${error.message}`, "error");
      throw new Error(`Failed to save requirements: ${error.message}`);
    }
  }

  /**
   * Save UML diagrams to files
   * @param {Object} umlResults - UML diagram contents
   * @returns {Promise<Object>} Paths to saved files
   * @private
   */
  async saveUMLToFile(umlResults) {
    const outputPaths = {};

    try {
      // Ensure output directory exists
      const umlDir = path.join(this.config.outputDir, "uml");
      await fs.mkdir(umlDir, { recursive: true });

      // Save class diagram if present
      if (umlResults.classDiagram) {
        const classPath = path.join(umlDir, "class-diagram.puml");
        await fs.writeFile(classPath, umlResults.classDiagram, "utf8");
        outputPaths.classDiagram = classPath;

        // Save rendered diagram if available
        if (
          umlResults.renderedClassDiagram &&
          umlResults.renderedClassDiagram.data
        ) {
          const format = umlResults.renderedClassDiagram.format || "svg";
          const renderedPath = path.join(umlDir, `class-diagram.${format}`);
          await fs.writeFile(
            renderedPath,
            Buffer.from(umlResults.renderedClassDiagram.data, "base64")
          );
          outputPaths.renderedClassDiagram = renderedPath;
        }
      }

      // Save sequence diagram if present
      if (umlResults.sequenceDiagram) {
        const sequencePath = path.join(umlDir, "sequence-diagram.puml");
        await fs.writeFile(sequencePath, umlResults.sequenceDiagram, "utf8");
        outputPaths.sequenceDiagram = sequencePath;

        // Save rendered diagram if available
        if (
          umlResults.renderedSequenceDiagram &&
          umlResults.renderedSequenceDiagram.data
        ) {
          const format = umlResults.renderedSequenceDiagram.format || "svg";
          const renderedPath = path.join(umlDir, `sequence-diagram.${format}`);
          await fs.writeFile(
            renderedPath,
            Buffer.from(umlResults.renderedSequenceDiagram.data, "base64")
          );
          outputPaths.renderedSequenceDiagram = renderedPath;
        }
      }

      this.log(`UML diagrams saved to ${umlDir}`, "info");
      return outputPaths;
    } catch (error) {
      this.log(`Failed to save UML diagrams: ${error.message}`, "error");
      throw new Error(`Failed to save UML diagrams: ${error.message}`);
    }
  }

  /**
   * Load requirements from a file
   * @param {string} filePath - Path to the requirements file
   * @returns {Promise<Object>} Loaded requirements
   */
  async loadRequirementsFromFile(filePath) {
    try {
      // Read the file
      const fileContent = await fs.readFile(filePath, "utf8");

      // Parse the JSON
      const data = JSON.parse(fileContent);

      // Validate the structure
      if (!data.requirements || !data.metadata) {
        throw new Error("Invalid requirements file format");
      }

      // Update the requirements and metadata
      this.requirements = data.requirements;
      this.metadata = data.metadata;

      // Update counters based on loaded data
      this.updateCountersFromRequirements();

      this.log(`Requirements loaded from ${filePath}`, "info");

      // Emit load event
      this.emit("requirements:loaded", {
        requirementsCount: this.getTotalRequirementsCount(),
        source: filePath,
      });

      return this.requirements;
    } catch (error) {
      this.log(`Failed to load requirements: ${error.message}`, "error");
      throw new Error(`Failed to load requirements: ${error.message}`);
    }
  }

  /**
   * Export requirements to different formats
   * @param {string} format - The format to export (json, markdown, html, csv)
   * @param {Object} options - Export options
   * @returns {Promise<string>} The exported content
   */
  async exportRequirements(format = "json", options = {}) {
    this.log(`Exporting requirements to ${format} format`, "info");

    try {
      let exportContent = "";

      switch (format.toLowerCase()) {
        case "json":
          // JSON export
          exportContent = JSON.stringify(
            {
              metadata: this.metadata,
              requirements: this.requirements,
            },
            null,
            2
          );
          break;

        case "markdown":
          // Markdown export
          exportContent = this.generateMarkdownExport();
          break;

        case "html":
          // HTML export
          exportContent = this.generateHTMLExport();
          break;

        case "csv":
          // CSV export
          exportContent = this.generateCSVExport();
          break;

        default:
          throw new Error(`Unsupported export format: ${format}`);
      }

      // Save to file if requested
      if (options.saveToFile) {
        const outputPath =
          options.filePath ||
          path.join(
            this.config.outputDir,
            `requirements.${format.toLowerCase()}`
          );

        // Ensure output directory exists
        await fs.mkdir(path.dirname(outputPath), { recursive: true });

        // Write to file
        await fs.writeFile(outputPath, exportContent, "utf8");

        this.log(`Requirements exported to ${outputPath}`, "info");
      }

      return exportContent;
    } catch (error) {
      this.log(`Export failed: ${error.message}`, "error");
      throw new Error(`Export failed: ${error.message}`);
    }
  }

  /**
   * Generate a markdown export of requirements
   * @returns {string} Markdown content
   * @private
   */
  generateMarkdownExport() {
    let markdown = `# Requirements Document\n\n`;

    // Add metadata
    markdown += `## Metadata\n\n`;
    markdown += `- Created: ${this.metadata.createdAt}\n`;
    markdown += `- Last Updated: ${this.metadata.updatedAt}\n`;
    markdown += `- Version: ${this.metadata.version}\n`;
    markdown += `- Status: ${this.metadata.status}\n\n`;

    // Add functional requirements
    if (this.requirements.functional.length > 0) {
      markdown += `## Functional Requirements\n\n`;

      for (const req of this.requirements.functional) {
        markdown += `### ${req.id}: ${req.statement}\n\n`;
        markdown += `- **Priority:** ${req.priority}\n`;
        if (req.rationale) markdown += `- **Rationale:** ${req.rationale}\n`;
        if (req.source) markdown += `- **Source:** ${req.source}\n`;
        if (req.status) markdown += `- **Status:** ${req.status}\n`;
        markdown += `\n`;
      }
    }

    // Add non-functional requirements
    if (this.requirements.nonFunctional.length > 0) {
      markdown += `## Non-Functional Requirements\n\n`;

      for (const req of this.requirements.nonFunctional) {
        markdown += `### ${req.id}: ${req.statement}\n\n`;
        markdown += `- **Priority:** ${req.priority}\n`;
        if (req.rationale) markdown += `- **Rationale:** ${req.rationale}\n`;
        if (req.source) markdown += `- **Source:** ${req.source}\n`;
        if (req.status) markdown += `- **Status:** ${req.status}\n`;
        markdown += `\n`;
      }
    }

    // Add user stories
    if (this.requirements.userStories.length > 0) {
      markdown += `## User Stories\n\n`;

      for (const story of this.requirements.userStories) {
        markdown += `### ${story.id}\n\n`;
        markdown += `${story.statement}\n\n`;

        if (story.acceptanceCriteria && story.acceptanceCriteria.length > 0) {
          markdown += `**Acceptance Criteria:**\n\n`;
          for (const criteria of story.acceptanceCriteria) {
            markdown += `- ${criteria}\n`;
          }
          markdown += `\n`;
        }

        if (story.storyPoints)
          markdown += `**Story Points:** ${story.storyPoints}\n`;
        if (story.priority) markdown += `**Priority:** ${story.priority}\n`;
        if (story.status) markdown += `**Status:** ${story.status}\n`;
        markdown += `\n`;
      }
    }

    // Add constraints
    if (this.requirements.constraints.length > 0) {
      markdown += `## Constraints\n\n`;

      for (const constraint of this.requirements.constraints) {
        markdown += `### ${constraint.id}: ${constraint.statement}\n\n`;
        if (constraint.rationale)
          markdown += `- **Rationale:** ${constraint.rationale}\n`;
        if (constraint.source)
          markdown += `- **Source:** ${constraint.source}\n`;
        markdown += `\n`;
      }
    }

    return markdown;
  }

  /**
   * Generate an HTML export of requirements
   * @returns {string} HTML content
   * @private
   */
  generateHTMLExport() {
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Requirements Document</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 1200px; margin: 0 auto; padding: 20px; }
    h1 { color: #2c3e50; border-bottom: 2px solid #eee; padding-bottom: 10px; }
    h2 { color: #3498db; margin-top: 30px; }
    h3 { color: #2980b9; }
    .metadata { background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    .requirement { background: #fff; border: 1px solid #ddd; border-radius: 5px; padding: 15px; margin-bottom: 15px; }
    .requirement h3 { margin-top: 0; }
    .functional { border-left: 5px solid #27ae60; }
    .non-functional { border-left: 5px solid #e74c3c; }
    .user-story { border-left: 5px solid #f39c12; }
    .constraint { border-left: 5px solid #9b59b6; }
    .priority-critical { color: #e74c3c; font-weight: bold; }
    .priority-high { color: #f39c12; font-weight: bold; }
    .priority-medium { color: #2980b9; }
    .priority-low { color: #27ae60; }
  </style>
</head>
<body>
  <h1>Requirements Document</h1>
  
  <div class="metadata">
    <h2>Metadata</h2>
    <p><strong>Created:</strong> ${this.metadata.createdAt}</p>
    <p><strong>Last Updated:</strong> ${this.metadata.updatedAt}</p>
    <p><strong>Version:</strong> ${this.metadata.version}</p>
    <p><strong>Status:</strong> ${this.metadata.status}</p>
  </div>`;

    // Add functional requirements
    if (this.requirements.functional.length > 0) {
      html += `
  <h2>Functional Requirements</h2>`;

      for (const req of this.requirements.functional) {
        html += `
  <div class="requirement functional">
    <h3>${req.id}: ${req.statement}</h3>
    <p><strong>Priority:</strong> <span class="priority-${req.priority.toLowerCase()}">${req.priority}</span></p>`;

        if (req.rationale)
          html += `    <p><strong>Rationale:</strong> ${req.rationale}</p>`;
        if (req.source)
          html += `    <p><strong>Source:</strong> ${req.source}</p>`;
        if (req.status)
          html += `    <p><strong>Status:</strong> ${req.status}</p>`;

        html += `
  </div>`;
      }
    }

    // Add non-functional requirements
    if (this.requirements.nonFunctional.length > 0) {
      html += `
  <h2>Non-Functional Requirements</h2>`;

      for (const req of this.requirements.nonFunctional) {
        html += `
  <div class="requirement non-functional">
    <h3>${req.id}: ${req.statement}</h3>
    <p><strong>Priority:</strong> <span class="priority-${req.priority.toLowerCase()}">${req.priority}</span></p>`;

        if (req.rationale)
          html += `    <p><strong>Rationale:</strong> ${req.rationale}</p>`;
        if (req.source)
          html += `    <p><strong>Source:</strong> ${req.source}</p>`;
        if (req.status)
          html += `    <p><strong>Status:</strong> ${req.status}</p>`;

        html += `
  </div>`;
      }
    }

    // Add user stories
    if (this.requirements.userStories.length > 0) {
      html += `
  <h2>User Stories</h2>`;

      for (const story of this.requirements.userStories) {
        html += `
  <div class="requirement user-story">
    <h3>${story.id}</h3>
    <p>${story.statement}</p>`;

        if (story.acceptanceCriteria && story.acceptanceCriteria.length > 0) {
          html += `    <p><strong>Acceptance Criteria:</strong></p>
    <ul>`;

          for (const criteria of story.acceptanceCriteria) {
            html += `
      <li>${criteria}</li>`;
          }

          html += `
    </ul>`;
        }

        if (story.storyPoints)
          html += `    <p><strong>Story Points:</strong> ${story.storyPoints}</p>`;
        if (story.priority)
          html += `    <p><strong>Priority:</strong> <span class="priority-${story.priority.toLowerCase()}">${story.priority}</span></p>`;
        if (story.status)
          html += `    <p><strong>Status:</strong> ${story.status}</p>`;

        html += `
  </div>`;
      }
    }

    // Add constraints
    if (this.requirements.constraints.length > 0) {
      html += `
  <h2>Constraints</h2>`;

      for (const constraint of this.requirements.constraints) {
        html += `
  <div class="requirement constraint">
    <h3>${constraint.id}: ${constraint.statement}</h3>`;

        if (constraint.rationale)
          html += `    <p><strong>Rationale:</strong> ${constraint.rationale}</p>`;
        if (constraint.source)
          html += `    <p><strong>Source:</strong> ${constraint.source}</p>`;

        html += `
  </div>`;
      }
    }

    // Add UML diagrams if available
    if (
      this.metadata.diagrams &&
      (this.metadata.diagrams.classDiagram ||
        this.metadata.diagrams.sequenceDiagram)
    ) {
      html += `
  <h2>UML Diagrams</h2>
  <p>UML diagrams were generated on ${this.metadata.diagrams.renderedAt}</p>`;

      if (this.metadata.diagrams.classDiagram) {
        html += `
  <div class="requirement">
    <h3>Class Diagram</h3>
    <p>A class diagram showing the main entities and their relationships is available in the UML directory.</p>
  </div>`;
      }

      if (this.metadata.diagrams.sequenceDiagram) {
        html += `
  <div class="requirement">
    <h3>Sequence Diagram</h3>
    <p>A sequence diagram showing the main interaction flow is available in the UML directory.</p>
  </div>`;
      }
    }

    // Close HTML tags
    html += `
</body>
</html>`;

    return html;
  }

  /**
   * Generate a CSV export of requirements
   * @returns {string} CSV content
   * @private
   */
  generateCSVExport() {
    // Create CSV column headers
    let csv = "ID,Category,Statement,Priority,Status,Source,Rationale\n";

    // Add all requirements
    const allRequirements = [
      ...this.requirements.functional.map((r) => ({
        ...r,
        category: "Functional",
      })),
      ...this.requirements.nonFunctional.map((r) => ({
        ...r,
        category: "Non-Functional",
      })),
      ...this.requirements.userStories.map((r) => ({
        ...r,
        category: "User Story",
      })),
      ...this.requirements.constraints.map((r) => ({
        ...r,
        category: "Constraint",
      })),
    ];

    // Helper function to escape CSV field
    const escapeCSV = (field) => {
      if (field === undefined || field === null) return "";
      return `"${String(field).replace(/"/g, '""')}"`;
    };

    // Add rows
    for (const req of allRequirements) {
      csv += `${escapeCSV(req.id)},`;
      csv += `${escapeCSV(req.category)},`;
      csv += `${escapeCSV(req.statement)},`;
      csv += `${escapeCSV(req.priority)},`;
      csv += `${escapeCSV(req.status)},`;
      csv += `${escapeCSV(req.source)},`;
      csv += `${escapeCSV(req.rationale)}\n`;
    }

    return csv;
  }

  /**
   * Update the counters based on loaded requirements
   * @private
   */
  updateCountersFromRequirements() {
    // Reset counters
    this.counters = {
      fr: 0,
      nfr: 0,
      us: 0,
      con: 0,
      spec: 0,
    };

    // Update functional requirement counter
    for (const req of this.requirements.functional) {
      if (req.id && req.id.startsWith("FR-")) {
        const num = parseInt(req.id.substring(3), 10);
        if (!isNaN(num) && num > this.counters.fr) {
          this.counters.fr = num;
        }
      }
    }

    // Update non-functional requirement counter
    for (const req of this.requirements.nonFunctional) {
      if (req.id && req.id.startsWith("NFR-")) {
        const num = parseInt(req.id.substring(4), 10);
        if (!isNaN(num) && num > this.counters.nfr) {
          this.counters.nfr = num;
        }
      }
    }

    // Update user story counter
    for (const story of this.requirements.userStories) {
      if (story.id && story.id.startsWith("US-")) {
        const num = parseInt(story.id.substring(3), 10);
        if (!isNaN(num) && num > this.counters.us) {
          this.counters.us = num;
        }
      }
    }

    // Update constraint counter
    for (const constraint of this.requirements.constraints) {
      if (constraint.id && constraint.id.startsWith("CON-")) {
        const num = parseInt(constraint.id.substring(4), 10);
        if (!isNaN(num) && num > this.counters.con) {
          this.counters.con = num;
        }
      }
    }

    this.log("Counters updated from loaded requirements", "debug");
  }

  /**
   * Finds a requirement by its ID
   * @param {string} id - The requirement ID to find
   * @returns {Object|null} The found requirement or null
   */
  findRequirementById(id) {
    // Search in functional requirements
    let found = this.requirements.functional.find((r) => r.id === id);
    if (found) return found;

    // Search in non-functional requirements
    found = this.requirements.nonFunctional.find((r) => r.id === id);
    if (found) return found;

    // Search in user stories
    found = this.requirements.userStories.find((r) => r.id === id);
    if (found) return found;

    // Search in constraints
    found = this.requirements.constraints.find((r) => r.id === id);
    if (found) return found;

    return null;
  }

  /**
   * Get the total count of all requirements
   * @returns {number} The total requirements count
   */
  getTotalRequirementsCount() {
    return (
      this.requirements.functional.length +
      this.requirements.nonFunctional.length +
      this.requirements.userStories.length +
      this.requirements.constraints.length
    );
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
   * Extract UML diagrams from text
   * @param {string} text - The text containing PlantUML code
   * @returns {Object} Object with class and sequence diagrams
   * @private
   */
  extractUMLFromText(text) {
    const result = {
      classDiagram: null,
      sequenceDiagram: null,
    };

    try {
      // Extract class diagram
      const classPattern =
        /```(?:plantuml)?\s*[\r\n]*([\s\S]*?@startuml[\s\S]*?class[\s\S]*?@enduml)[\r\n]*```|(@startuml[\s\S]*?class[\s\S]*?@enduml)/i;
      const classMatch = text.match(classPattern);

      if (classMatch) {
        result.classDiagram = (classMatch[1] || classMatch[2]).trim();
      }

      // Extract sequence diagram
      const sequencePattern =
        /```(?:plantuml)?\s*[\r\n]*([\s\S]*?@startuml[\s\S]*?->[\s\S]*?@enduml)[\r\n]*```|(@startuml[\s\S]*?->[\s\S]*?@enduml)/i;
      const sequenceMatch = text.match(sequencePattern);

      if (sequenceMatch) {
        result.sequenceDiagram = (sequenceMatch[1] || sequenceMatch[2]).trim();
      }

      return result;
    } catch (error) {
      this.log(`UML extraction error: ${error.message}`, "error");
      return result;
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
    const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] RequirementsModule: ${message}`;

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
      module: "RequirementsModule",
    });
  }
}

export default RequirementsModule;
