const EventEmitter = require("events");
const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs").promises;
const path = require("path");
const zlib = require("zlib");

class RequirementsModule extends EventEmitter {
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
      temperature: 0.2,
      outputDir: "./requirements",
      autoValidate: true,
      uml: {
        server: "https://www.plantuml.com/plantuml",
        localServer: process.env.PLANTUML_SERVER || null,
        outputFormat: "svg",
        includeSource: true,
        eraserApiKey: process.env.ERASER_API_KEY || null,
        eraserTeamId: process.env.ERASER_TEAM_ID || null,
      },
      streaming: {
        enabled: true,
        chunkSize: 100,
        debounceTime: 300,
      },
      ...config,
    };

    // Validate API key presence
    if (!this.config.apiKey) {
      throw new Error(
        "API key is required for RequirementsModule initialization"
      );
    }

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
      fr: 0,
      nfr: 0,
      us: 0,
      con: 0,
      spec: 0,
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

    // Ensure output directory exists
    this.ensureOutputDir();
  }

  /** Log messages with level and emit events */
  log(message, level = "info") {
    const logEntry = { timestamp: new Date().toISOString(), level, message };
    if (this.debug || level === "error") {
      console.log(
        `[${logEntry.timestamp}] [${level.toUpperCase()}] ${message}`
      );
    }
    this.emit("log", logEntry);
  }

  /** Ensure the output directory exists */
  async ensureOutputDir() {
    try {
      await fs.mkdir(this.config.outputDir, { recursive: true });
    } catch (error) {
      this.log(`Failed to create output directory: ${error.message}`, "error");
      throw new Error(`Output directory setup failed: ${error.message}`);
    }
  }

  /** Build prompts for NLP operations */
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

Output each requirement as a separate JSON object on its own line, like:
{"category": "functional", "id": "FR-1", "statement": "The system shall authenticate users via email and password", "priority": "high", "rationale": "Basic security feature needed to protect user data", "source": "Extracted from user input paragraph 2"}
{"category": "nonFunctional", "id": "NFR-1", "statement": "The system shall load pages in under 2 seconds", "priority": "medium", "rationale": "To provide a good user experience", "source": "Implied from performance needs"}

Be thorough but precise. Focus on extracting ONLY what's truly specified or strongly implied in the input.
      `,
      validation: `
You are a requirements validation expert ensuring requirements meet SMART criteria (Specific, Measurable, Achievable, Relevant, Time-bound).

Review the provided requirements and identify issues:

1. Completeness: Are any obvious requirements missing?
2. Clarity: Is each requirement unambiguous?
3. Consistency: Do requirements contradict each other?
4. Testability: Can each be objectively verified?
5. Feasibility: Are they technically achievable?

For each issue:
- Identify the requirement ID
- Describe the problem
- Suggest an improvement

Return JSON like:
{
  "validationResults": {
    "status": "issues_found",
    "issueCount": 1,
    "issues": [
      {
        "requirementId": "FR-1",
        "issueType": "clarity",
        "description": "Ambiguous term 'fast'",
        "suggestion": "Specify 'The system shall process requests in under 1 second'"
      }
    ],
    "missingRequirements": []
  }
}
      `,
      transformation: `
You are an expert transforming requirements into development-ready formats.

For each requirement:
1. User Stories: Add acceptance criteria, story points (1, 2, 3, 5, 8, 13), and components
2. Functional: Map to API endpoints, data entities, and test cases
3. Non-Functional: Suggest metrics, approaches, and challenges

Return JSON organized by requirement ID.
      `,
      umlGeneration: `
You are a software architect creating UML diagrams from requirements.

Generate:
1. UML Class Diagram: Entities, properties, methods, relationships
2. Sequence Diagram: Primary user flow with actors and messages

Use PlantUML syntax, ensuring:
- Class names in PascalCase
- Methods in camelCase
- Visibility (+, -, #)
- Data types
- Correct relationship syntax

Provide complete PlantUML scripts with @startuml and @enduml.
      `,
    };
  }

  /** Generate a cache key from input */
  generateCacheKey(input) {
    return crypto.createHash("sha256").update(input).digest("hex");
  }

  /** Extract requirements with streaming support */
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

    const cacheKey = this.generateCacheKey(userInput);
    if (this.cache.extractionResults.has(cacheKey) && !options.forceRefresh) {
      this.log("Using cached extraction results", "debug");
      return this.cache.extractionResults.get(cacheKey);
    }

    const useAnthropicAPI = this.config.apiKey.startsWith("sk-ant");
    try {
      this.emit("extraction:start", {
        inputLength: userInput.length,
        streamId: streamingEnabled ? streamId : null,
      });

      if (streamingEnabled) {
        this.activeStreams.set(streamId, {
          status: "processing",
          type: "requirements_extraction",
          progress: 0,
          startTime: Date.now(),
          currentData: null,
          lastEmitTime: 0,
        });
      }

      const promptContent = `${this.prompts.extraction}\n\nUser input:\n${userInput}`;
      let extractedRequirements;

      if (useAnthropicAPI) {
        extractedRequirements = streamingEnabled
          ? await this.streamClaudeExtraction(promptContent, streamId)
          : await this.nonStreamClaudeExtraction(promptContent);
      } else {
        extractedRequirements = streamingEnabled
          ? await this.streamOpenAIExtraction(promptContent, streamId)
          : await this.nonStreamOpenAIExtraction(promptContent);
      }

      if (!extractedRequirements) {
        throw new Error("Failed to parse requirements from API response");
      }

      const processedRequirements = await this.processExtractedRequirements(
        extractedRequirements,
        options
      );

      this.cache.extractionResults.set(cacheKey, processedRequirements);
      this.metadata.extractionCount++;
      this.metadata.updatedAt = new Date().toISOString();
      this.metadata.status = "requirements_extracted";

      if (streamingEnabled) {
        this.activeStreams.set(streamId, {
          ...this.activeStreams.get(streamId),
          status: "completed",
          progress: 100,
          endTime: Date.now(),
          currentData: processedRequirements,
        });
        this.emit("stream:complete", {
          streamId,
          type: "requirements_extraction",
          data: processedRequirements,
        });
      }

      this.emit("extraction:complete", {
        requirementsCount: this.getTotalRequirementsCount(),
        duration: Date.now() - new Date(this.metadata.updatedAt).getTime(),
        streamId: streamingEnabled ? streamId : null,
      });

      if (this.config.autoValidate) {
        await this.validateRequirements({ streaming: streamingEnabled });
      }

      return processedRequirements;
    } catch (error) {
      this.handleError("extraction", error, streamId, streamingEnabled, {
        inputLength: userInput.length,
      });
      throw error;
    }
  }

  /** Stream requirements extraction from Claude API */
  async streamClaudeExtraction(promptContent, streamId) {
    return new Promise((resolve, reject) => {
      let accumulatedText = "";
      let currentRequirements = [];

      const controller = new AbortController();
      const timeout = setTimeout(() => {
        controller.abort();
        reject(new Error("Streaming request timed out after 120 seconds"));
      }, 120000);

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
            signal: controller.signal,
          }
        )
        .then((response) => {
          response.data.on("data", (chunk) => {
            try {
              const chunkText = chunk.toString();
              const lines = chunkText.split("\n").filter((line) => line.trim());

              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  const data = line.slice(6);
                  if (data === "[DONE]") continue;

                  const parsedData = JSON.parse(data);
                  if (
                    parsedData.type === "content_block_delta" &&
                    parsedData.delta.text
                  ) {
                    accumulatedText += parsedData.delta.text;
                    const textLines = accumulatedText.split("\n");

                    for (let i = 0; i < textLines.length - 1; i++) {
                      const line = textLines[i].trim();
                      if (line) {
                        try {
                          const requirement = JSON.parse(line);
                          if (requirement && requirement.category) {
                            currentRequirements.push(requirement);
                            this.updateStreamContent(
                              streamId,
                              "requirements_extraction",
                              {
                                requirements: currentRequirements,
                              }
                            );
                          }
                        } catch (jsonErr) {
                          this.log(
                            `Ignoring invalid JSON line: ${jsonErr.message}`,
                            "debug"
                          );
                        }
                      }
                    }
                    accumulatedText = textLines[textLines.length - 1];
                  }
                }
              }
            } catch (err) {
              this.log(`Chunk processing error: ${err.message}`, "debug");
            }
          });

          response.data.on("end", () => {
            clearTimeout(timeout);
            if (accumulatedText.trim()) {
              try {
                const requirement = JSON.parse(accumulatedText.trim());
                if (requirement && requirement.category) {
                  currentRequirements.push(requirement);
                }
              } catch (jsonErr) {
                this.log(
                  `Final line parsing failed: ${jsonErr.message}`,
                  "debug"
                );
              }
            }

            const finalRequirements =
              this.categorizeRequirements(currentRequirements);
            resolve(finalRequirements);
          });

          response.data.on("error", (err) => {
            clearTimeout(timeout);
            reject(new Error(`Stream error: ${err.message}`));
          });
        })
        .catch((error) => {
          clearTimeout(timeout);
          reject(new Error(`API request failed: ${error.message}`));
        });
    });
  }

  /** Non-streaming extraction from Claude API */
  async nonStreamClaudeExtraction(promptContent) {
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
    const lines = response.data.content[0].text
      .split("\n")
      .filter((line) => line.trim());
    return this.parseRequirementLines(lines);
  }

  /** Stream requirements extraction from OpenAI API */
  async streamOpenAIExtraction(promptContent, streamId) {
    return new Promise((resolve, reject) => {
      let accumulatedText = "";
      let currentRequirements = [];

      const controller = new AbortController();
      const timeout = setTimeout(() => {
        controller.abort();
        reject(new Error("Streaming request timed out after 120 seconds"));
      }, 120000);

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
            signal: controller.signal,
          }
        )
        .then((response) => {
          response.data.on("data", (chunk) => {
            try {
              const chunkText = chunk.toString();
              const lines = chunkText.split("\n").filter((line) => line.trim());

              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  const data = line.slice(6);
                  if (data === "[DONE]") continue;

                  const parsedData = JSON.parse(data);
                  if (
                    parsedData.choices &&
                    parsedData.choices[0].delta.content
                  ) {
                    accumulatedText += parsedData.choices[0].delta.content;
                    const textLines = accumulatedText.split("\n");

                    for (let i = 0; i < textLines.length - 1; i++) {
                      const line = textLines[i].trim();
                      if (line) {
                        try {
                          const requirement = JSON.parse(line);
                          if (requirement && requirement.category) {
                            currentRequirements.push(requirement);
                            this.updateStreamContent(
                              streamId,
                              "requirements_extraction",
                              {
                                requirements: currentRequirements,
                              }
                            );
                          }
                        } catch (jsonErr) {
                          this.log(
                            `Ignoring invalid JSON line: ${jsonErr.message}`,
                            "debug"
                          );
                        }
                      }
                    }
                    accumulatedText = textLines[textLines.length - 1];
                  }
                }
              }
            } catch (err) {
              this.log(`Chunk processing error: ${err.message}`, "debug");
            }
          });

          response.data.on("end", () => {
            clearTimeout(timeout);
            if (accumulatedText.trim()) {
              try {
                const requirement = JSON.parse(accumulatedText.trim());
                if (requirement && requirement.category) {
                  currentRequirements.push(requirement);
                }
              } catch (jsonErr) {
                this.log(
                  `Final line parsing failed: ${jsonErr.message}`,
                  "debug"
                );
              }
            }

            const finalRequirements =
              this.categorizeRequirements(currentRequirements);
            resolve(finalRequirements);
          });

          response.data.on("error", (err) => {
            clearTimeout(timeout);
            reject(new Error(`Stream error: ${err.message}`));
          });
        })
        .catch((error) => {
          clearTimeout(timeout);
          reject(new Error(`API request failed: ${error.message}`));
        });
    });
  }

  /** Non-streaming extraction from OpenAI API */
  async nonStreamOpenAIExtraction(promptContent) {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        temperature: this.config.temperature,
        messages: [
          { role: "system", content: this.prompts.extraction },
          { role: "user", content: promptContent },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
      }
    );
    const lines = response.data.choices[0].message.content
      .split("\n")
      .filter((line) => line.trim());
    return this.parseRequirementLines(lines);
  }

  /** Parse requirement lines into categorized object */
  parseRequirementLines(lines) {
    const requirements = [];
    for (const line of lines) {
      try {
        const requirement = JSON.parse(line);
        if (requirement && requirement.category) {
          requirements.push(requirement);
        }
      } catch (jsonErr) {
        this.log(`Skipping invalid JSON line: ${jsonErr.message}`, "debug");
      }
    }
    return this.categorizeRequirements(requirements);
  }

  /** Categorize requirements into the expected structure */
  categorizeRequirements(requirements) {
    return {
      functional: requirements.filter((r) => r.category === "functional"),
      nonFunctional: requirements.filter((r) => r.category === "nonFunctional"),
      userStories: requirements.filter((r) => r.category === "userStory"),
      constraints: requirements.filter((r) => r.category === "constraint"),
    };
  }

  /** Process extracted requirements and update internal state */
  async processExtractedRequirements(extractedRequirements, options) {
    const processed = {
      functional: [],
      nonFunctional: [],
      userStories: [],
      constraints: [],
    };

    for (const category in extractedRequirements) {
      for (const req of extractedRequirements[category]) {
        const existing = this.requirements[category].find(
          (r) => r.id === req.id
        );
        if (!existing) {
          const processedReq = {
            ...req,
            status: "proposed",
            createdAt: new Date().toISOString(),
          };
          processed[category].push(processedReq);
          this.requirements[category].push(processedReq);
          this.counters[category.slice(0, 3)]++;
        }
      }
    }

    return processed;
  }

  /** Update stream content with debouncing */
  updateStreamContent(streamId, type, content) {
    if (!this.activeStreams.has(streamId)) return;

    const streamData = this.activeStreams.get(streamId);
    streamData.currentData = content;
    streamData.lastUpdate = Date.now();

    if (content.requirements) {
      const totalExpected = 10; // Arbitrary, could be config-driven
      const currentCount = content.requirements.length;
      streamData.progress = Math.min(90, (currentCount / totalExpected) * 100);
    } else {
      streamData.progress = Math.min(75, streamData.progress + 5);
    }

    this.activeStreams.set(streamId, streamData);

    const now = Date.now();
    if (
      !streamData.lastEmitTime ||
      now - streamData.lastEmitTime >= this.config.streaming.debounceTime
    ) {
      streamData.lastEmitTime = now;
      this.emit("stream:update", {
        streamId,
        type,
        content,
        progress: streamData.progress,
        timeSinceStart: now - streamData.startTime,
      });
    }
  }

  /** Validate requirements */
  async validateRequirements(options = {}) {
    const streamingEnabled = options.streaming && this.config.streaming.enabled;
    const streamId = streamingEnabled ? crypto.randomUUID() : null;

    this.log("Validating requirements", "info");
    const promptContent = `${this.prompts.validation}\n\nRequirements:\n${JSON.stringify(this.requirements, null, 2)}`;

    try {
      if (streamingEnabled) {
        this.activeStreams.set(streamId, {
          status: "processing",
          type: "requirements_validation",
          progress: 0,
          startTime: Date.now(),
          currentData: null,
          lastEmitTime: 0,
        });
      }

      const useAnthropicAPI = this.config.apiKey.startsWith("sk-ant");
      const response = await (useAnthropicAPI
        ? axios.post(
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
          )
        : axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
              model: "gpt-4o",
              temperature: this.config.temperature,
              messages: [
                { role: "system", content: this.prompts.validation },
                { role: "user", content: promptContent },
              ],
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.config.apiKey}`,
              },
            }
          ));

      const validationResult = useAnthropicAPI
        ? JSON.parse(response.data.content[0].text)
        : JSON.parse(response.data.choices[0].message.content);

      this.metadata.validationCount++;
      this.metadata.updatedAt = new Date().toISOString();

      if (streamingEnabled) {
        this.activeStreams.set(streamId, {
          ...this.activeStreams.get(streamId),
          status: "completed",
          progress: 100,
          endTime: Date.now(),
          currentData: validationResult,
        });
        this.emit("stream:complete", {
          streamId,
          type: "requirements_validation",
          data: validationResult,
        });
      }

      this.emit("validation:complete", {
        status: validationResult.validationResults.status,
        issueCount: validationResult.validationResults.issueCount,
      });

      return validationResult;
    } catch (error) {
      this.handleError("validation", error, streamId, streamingEnabled);
      throw error;
    }
  }

  /** Generate UML diagrams */
  async generateUMLDiagrams(options = {}) {
    const streamingEnabled = options.streaming && this.config.streaming.enabled;
    const streamId = streamingEnabled ? crypto.randomUUID() : null;

    this.log("Generating UML diagrams", "info");
    const promptContent = `${this.prompts.umlGeneration}\n\nRequirements:\n${JSON.stringify(this.requirements, null, 2)}`;

    try {
      if (streamingEnabled) {
        this.activeStreams.set(streamId, {
          status: "processing",
          type: "uml_generation",
          progress: 0,
          startTime: Date.now(),
          currentData: null,
          lastEmitTime: 0,
        });
      }

      const useAnthropicAPI = this.config.apiKey.startsWith("sk-ant");
      const response = await (useAnthropicAPI
        ? axios.post(
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
          )
        : axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
              model: "gpt-4o",
              temperature: this.config.temperature,
              messages: [
                { role: "system", content: this.prompts.umlGeneration },
                { role: "user", content: promptContent },
              ],
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.config.apiKey}`,
              },
            }
          ));

      const umlText = useAnthropicAPI
        ? response.data.content[0].text
        : response.data.choices[0].message.content;
      const diagrams = this.parseUMLDiagrams(umlText);

      const renderedDiagrams = await this.renderUMLDiagrams(diagrams);
      this.metadata.diagrams = renderedDiagrams;
      this.metadata.updatedAt = new Date().toISOString();

      if (streamingEnabled) {
        this.activeStreams.set(streamId, {
          ...this.activeStreams.get(streamId),
          status: "completed",
          progress: 100,
          endTime: Date.now(),
          currentData: renderedDiagrams,
        });
        this.emit("stream:complete", {
          streamId,
          type: "uml_generation",
          data: renderedDiagrams,
        });
      }

      this.emit("uml:complete", {
        diagramCount: Object.keys(renderedDiagrams).length,
      });
      return renderedDiagrams;
    } catch (error) {
      this.handleError("uml_generation", error, streamId, streamingEnabled);
      throw error;
    }
  }

  /** Parse UML diagrams from text */
  parseUMLDiagrams(text) {
    const diagrams = {};
    const sections = text.split(/@startuml\s/).slice(1);
    for (const section of sections) {
      const [typeLine, ...contentLines] = section.split("\n");
      const type = typeLine.trim().toLowerCase().includes("class")
        ? "class"
        : "sequence";
      const code = `@startuml\n${typeLine}\n${contentLines.join("\n")}`.trim();
      diagrams[
        `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
      ] = code;
    }
    return diagrams;
  }

  /** Render UML diagrams using PlantUML or Eraser */
  async renderUMLDiagrams(diagrams) {
    const rendered = {};
    for (const [id, code] of Object.entries(diagrams)) {
      if (this.config.uml.eraserApiKey && this.config.uml.eraserTeamId) {
        const eraserResponse = await axios.post(
          "https://api.eraser.io/v1/diagrams",
          { code, format: this.config.uml.outputFormat },
          {
            headers: {
              Authorization: `Bearer ${this.config.uml.eraserApiKey}`,
              "X-Team-ID": this.config.uml.eraserTeamId,
            },
          }
        );
        rendered[id] = {
          url: eraserResponse.data.url,
          source: this.config.uml.includeSource ? code : undefined,
        };
      } else {
        const compressed = zlib.deflateSync(code).toString("base64");
        const server = this.config.uml.localServer || this.config.uml.server;
        const url = `${server}/${this.config.uml.outputFormat}/${compressed}`;
        rendered[id] = {
          url,
          source: this.config.uml.includeSource ? code : undefined,
        };
      }
    }
    return rendered;
  }

  /** Save requirements to file */
  async saveRequirementsToFile(filename = "requirements.json") {
    const filePath = path.join(this.config.outputDir, filename);
    const data = { requirements: this.requirements, metadata: this.metadata };
    try {
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      this.log(`Requirements saved to ${filePath}`, "info");
      this.emit("save:complete", { filePath });
    } catch (error) {
      this.log(`Failed to save requirements: ${error.message}`, "error");
      throw new Error(`Save failed: ${error.message}`);
    }
  }

  /** Load requirements from file */
  async loadRequirementsFromFile(filename = "requirements.json") {
    const filePath = path.join(this.config.outputDir, filename);
    try {
      const data = await fs.readFile(filePath, "utf8");
      const parsed = JSON.parse(data);
      this.requirements = parsed.requirements;
      this.metadata = {
        ...this.metadata,
        ...parsed.metadata,
        updatedAt: new Date().toISOString(),
      };
      this.log(`Requirements loaded from ${filePath}`, "info");
      this.emit("load:complete", { filePath });
    } catch (error) {
      this.log(`Failed to load requirements: ${error.message}`, "error");
      throw new Error(`Load failed: ${error.message}`);
    }
  }

  /** Export requirements in a specified format */
  async exportRequirements(format = "json") {
    const filePath = path.join(
      this.config.outputDir,
      `requirements_export_${Date.now()}.${format}`
    );
    try {
      let content;
      switch (format.toLowerCase()) {
        case "json":
          content = JSON.stringify(this.requirements, null, 2);
          break;
        case "csv":
          content = this.requirementsToCSV();
          break;
        case "md":
          content = this.requirementsToMarkdown();
          break;
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
      await fs.writeFile(filePath, content);
      this.log(`Requirements exported to ${filePath}`, "info");
      this.emit("export:complete", { filePath, format });
      return filePath;
    } catch (error) {
      this.log(`Export failed: ${error.message}`, "error");
      throw new Error(`Export failed: ${error.message}`);
    }
  }

  /** Convert requirements to CSV */
  requirementsToCSV() {
    const headers = [
      "Category",
      "ID",
      "Statement",
      "Priority",
      "Rationale",
      "Status",
      "CreatedAt",
    ];
    const rows = [];
    for (const category in this.requirements) {
      for (const req of this.requirements[category]) {
        rows.push([
          category,
          req.id,
          `"${req.statement.replace(/"/g, '""')}"`,
          req.priority,
          `"${req.rationale.replace(/"/g, '""')}"`,
          req.status,
          req.createdAt,
        ]);
      }
    }
    return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  }

  /** Convert requirements to Markdown */
  requirementsToMarkdown() {
    let md = "# Requirements\n\n";
    for (const category in this.requirements) {
      md += `## ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;
      for (const req of this.requirements[category]) {
        md += `- **${req.id}**: ${req.statement}  
  - Priority: ${req.priority}  
  - Rationale: ${req.rationale}  
  - Status: ${req.status}  
  - Created: ${req.createdAt}\n\n`;
      }
    }
    return md;
  }

  /** Handle errors consistently */
  handleError(type, error, streamId, streamingEnabled, additionalData = {}) {
    this.log(`${type} failed: ${error.message}`, "error");
    if (streamingEnabled && streamId) {
      this.activeStreams.set(streamId, {
        ...this.activeStreams.get(streamId),
        status: "error",
        error: error.message,
        endTime: Date.now(),
      });
      this.emit("stream:error", { streamId, type, error: error.message });
    }
    this.emit(`${type}:error`, { error: error.message, ...additionalData });
  }

  /** Get total requirements count */
  getTotalRequirementsCount() {
    return Object.values(this.requirements).reduce(
      (sum, arr) => sum + arr.length,
      0
    );
  }
}

module.exports = RequirementsModule;
