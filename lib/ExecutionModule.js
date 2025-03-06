/**
 * ExecutionModule.js
 * Responsible for executing actions planned by the PlanningModule.
 * Supports various types of actions like research, code generation, and testing.
 */

class ExecutionModule {
  constructor(llmService, config = {}) {
    this.llm = llmService;
    this.browserInterface = config.browserInterface || null;
    this.fileSystem = config.fileSystem || null;
    this.computerControl = config.computerControl || null;
    this.logger = config.logger || console;
    this.actionHandlers = new Map();

    // Register default action handlers
    this._registerDefaultHandlers();
  }

  /**
   * Set or update the LLM service
   * @param {Object} llmService - LLM service
   */
  setLLM(llmService) {
    this.llm = llmService;
  }

  /**
   * Set browser interface for web interactions
   * @param {Object} browserInterface - Browser interface
   */
  setBrowserInterface(browserInterface) {
    this.browserInterface = browserInterface;
  }

  /**
   * Set file system interface for file operations
   * @param {Object} fileSystem - File system interface
   */
  setFileSystem(fileSystem) {
    this.fileSystem = fileSystem;
  }

  /**
   * Set computer control interface for OS-level interactions
   * @param {Object} computerControl - Computer control interface
   */
  setComputerControl(computerControl) {
    this.computerControl = computerControl;
  }

  /**
   * Register action handlers
   * @private
   */
  _registerDefaultHandlers() {
    // Register handlers for different action types
    this.registerActionHandler(
      "research",
      this._handleResearchAction.bind(this)
    );
    this.registerActionHandler(
      "generate_code",
      this._handleCodeGenerationAction.bind(this)
    );
    this.registerActionHandler(
      "architecture",
      this._handleArchitectureAction.bind(this)
    );
    this.registerActionHandler("testing", this._handleTestingAction.bind(this));
    this.registerActionHandler(
      "deployment",
      this._handleDeploymentAction.bind(this)
    );
    this.registerActionHandler(
      "unblock_plan",
      this._handleUnblockPlanAction.bind(this)
    );
    this.registerActionHandler(
      "browse_web",
      this._handleBrowseWebAction.bind(this)
    );
    this.registerActionHandler(
      "file_operation",
      this._handleFileOperationAction.bind(this)
    );
    this.registerActionHandler(
      "computer_control",
      this._handleComputerControlAction.bind(this)
    );
  }

  /**
   * Register a custom action handler
   * @param {string} actionType - Type of action
   * @param {Function} handler - Handler function
   */
  registerActionHandler(actionType, handler) {
    if (typeof handler !== "function") {
      throw new Error(
        `Handler for action type '${actionType}' must be a function`
      );
    }
    this.actionHandlers.set(actionType, handler);
  }

  /**
   * Execute an action
   * @param {Object} action - Action to execute
   * @param {Object} context - Execution context
   * @returns {Object} - Execution result
   */
  async execute(action, context = {}) {
    this.logger.info(`Executing action: ${action.type}`, { action });

    // Check if we have a handler for this action type
    const handler = this.actionHandlers.get(action.type);
    if (!handler) {
      this.logger.warn(`No handler registered for action type: ${action.type}`);
      return {
        status: "failed",
        error: `Unsupported action type: ${action.type}`,
        action,
      };
    }

    try {
      const result = await handler(action, context);
      this.logger.info(`Action executed successfully: ${action.type}`, {
        actionId: action.id,
      });
      return {
        status: "success",
        result,
        action,
      };
    } catch (error) {
      this.logger.error(`Action execution failed: ${action.type}`, {
        error,
        action,
      });
      return {
        status: "failed",
        error: error.message,
        stack: error.stack,
        action,
      };
    }
  }

  /**
   * Extract JSON from a string response or return null if not found
   * @private
   */
  _extractJsonFromString(str) {
    try {
      // Try direct parsing first
      return JSON.parse(str);
    } catch (e) {
      try {
        // Look for JSON object pattern
        const jsonMatch = str.match(/(\{[\s\S]*\})/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (e2) {
        // If both approaches fail, return null
        return null;
      }
    }
    return null;
  }

  /**
   * Handle research action
   * @private
   */
  async _handleResearchAction(action, context) {
    this.logger.info("Executing research action", {
      queries: action.researchQueries,
    });

    if (!action.researchQueries || action.researchQueries.length === 0) {
      throw new Error("Research action missing required queries");
    }

    const results = [];

    // If we have browser interface, use it for web research
    if (this.browserInterface) {
      for (const query of action.researchQueries) {
        try {
          const searchResults = await this.browserInterface.search(query);

          // Visit top results and extract information
          const extractedInfo = [];
          for (const result of searchResults.slice(0, 3)) {
            // Limit to top 3 results
            try {
              const pageContent = await this.browserInterface.visitUrl(
                result.url
              );
              const extraction = await this._extractRelevantInformation(
                pageContent,
                query,
                action.researchContext
              );
              extractedInfo.push({
                url: result.url,
                title: result.title,
                extractedContent: extraction,
              });
            } catch (e) {
              this.logger.warn(
                `Failed to process search result: ${result.url}`,
                { error: e.message }
              );
            }
          }

          results.push({
            query,
            searchResults: searchResults.slice(0, 5), // Include top 5 results metadata
            extractedInfo,
          });
        } catch (e) {
          this.logger.error(`Research query failed: ${query}`, {
            error: e.message,
          });
          results.push({
            query,
            error: e.message,
            searchResults: [],
            extractedInfo: [],
          });
        }
      }
    } else {
      // Fall back to LLM for research if no browser interface
      if (!this.llm) {
        throw new Error("No LLM or browser interface available for research");
      }

      for (const query of action.researchQueries) {
        const researchPrompt = `
            You are an expert researcher with access to the latest information.
            
            RESEARCH QUERY:
            ${query}
            
            CONTEXT:
            ${JSON.stringify(action.researchContext || {}, null, 2)}
            
            Based on your knowledge, provide a detailed and accurate research report on this topic.
            Focus on the most relevant information for frontend development.
            Include technical details, best practices, and examples where appropriate.
            Be thorough but concise.
            
            Format your response as a detailed research report with sections and bullet points.
            `;

        try {
          const researchResponse = await this.llm.complete(researchPrompt, {
            temperature: 0.3,
            maxTokens: 2000,
          });

          results.push({
            query,
            llmResearch: researchResponse,
            searchResults: [],
            extractedInfo: [],
          });
        } catch (e) {
          this.logger.error(`LLM research failed: ${query}`, {
            error: e.message,
          });
          results.push({
            query,
            error: e.message,
            llmResearch: null,
            searchResults: [],
            extractedInfo: [],
          });
        }
      }
    }

    // Synthesize research results
    const synthesis = await this._synthesizeResearchResults(results, action);

    return {
      status: "success",
      researchResults: results,
      synthesis,
    };
  }

  /**
   * Extract relevant information from page content
   * @private
   */
  async _extractRelevantInformation(pageContent, query, context) {
    if (!this.llm) {
      // Simple extraction without LLM
      return pageContent.substring(0, 1000); // Just grab the first 1000 chars
    }

    const extractionPrompt = `
        You are an expert information extractor.
        
        WEBPAGE CONTENT:
        ${pageContent.substring(0, 6000)} // Limit content size to avoid token limits
        
        RESEARCH QUERY:
        ${query}
        
        CONTEXT:
        ${JSON.stringify(context || {}, null, 2)}
        
        Extract the most relevant information from this webpage content that specifically addresses the research query.
        Focus only on extracting factual, accurate information related to frontend development.
        Ignore advertisements, navigation elements, footers, and other irrelevant content.
        
        Format your response as a concise summary with the most important technical details, code examples (if any), and best practices.
        `;

    try {
      const extraction = await this.llm.complete(extractionPrompt, {
        temperature: 0.1,
        maxTokens: 1000,
      });

      return extraction;
    } catch (e) {
      this.logger.warn("Failed to extract relevant information with LLM", {
        error: e.message,
      });
      return pageContent.substring(0, 1000); // Fall back to simple extraction
    }
  }

  /**
   * Synthesize research results into a coherent summary
   * @private
   */
  async _synthesizeResearchResults(results, action) {
    if (!this.llm) {
      return {
        summary:
          "Research results collected but no LLM available for synthesis.",
        keyFindings: results.map((r) => r.query),
      };
    }

    const synthesisPrompt = `
        You are an expert frontend developer synthesizing research findings.
        
        RESEARCH RESULTS:
        ${JSON.stringify(results, null, 2)}
        
        RESEARCH CONTEXT:
        ${JSON.stringify(action.researchContext || {}, null, 2)}
        
        Synthesize these research findings into a coherent and comprehensive report.
        Identify common themes, best practices, technical specifications, and actionable insights.
        Resolve any contradictions in the research and provide a definitive perspective.
        
        Your response MUST be formatted as a valid JSON object with the following structure:
        {
          "summary": "Overall summary of research findings",
          "keyFindings": ["Finding 1", "Finding 2", ...],
          "technicalDetails": { ... },
          "implementationGuidelines": [ ... ],
          "challenges": [ ... ],
          "recommendations": [ ... ]
        }
        
        DO NOT include any text outside of the JSON structure.
        `;

    try {
      const synthesisResponse = await this.llm.complete(synthesisPrompt, {
        temperature: 0.3,
        responseFormat: { type: "json_object" },
        maxTokens: 2000,
      });

      let synthesis;
      try {
        if (typeof synthesisResponse === "string") {
          // Try to extract JSON from the string
          synthesis = this._extractJsonFromString(synthesisResponse);

          // If extraction failed, create a fallback
          if (!synthesis) {
            synthesis = {
              summary: synthesisResponse.substring(0, 500),
              keyFindings: results.map((r) => r.query),
              rawResponse: synthesisResponse.substring(0, 1000),
            };
          }
        } else {
          // Already an object
          synthesis = synthesisResponse;
        }
      } catch (e) {
        // Create a minimal fallback structure
        synthesis = {
          summary: synthesisResponse.substring(0, 500),
          error: e.message,
        };
      }

      return synthesis;
    } catch (e) {
      this.logger.warn("Failed to synthesize research results", {
        error: e.message,
      });
      return {
        summary: "Failed to synthesize research results due to an error.",
        error: e.message,
        keyFindings: results.map((r) => r.query),
      };
    }
  }

  /**
   * Handle code generation action
   * @private
   */
  async _handleCodeGenerationAction(action, context) {
    this.logger.info("Executing code generation action", {
      stepId: action.stepId,
    });

    if (!this.llm) {
      throw new Error("LLM service required for code generation");
    }

    const codePrompt = `
        You are an expert frontend developer generating production-quality code.
        
        CODE REQUIREMENTS:
        ${JSON.stringify(action.codeRequirements, null, 2)}
        
        PROJECT STRUCTURE:
        ${JSON.stringify(action.codeRequirements.projectStructure || {}, null, 2)}
        
        EXISTING CODE:
        ${
          action.codeRequirements.existingCode
            ?.map(
              (snippet) =>
                `File: ${snippet.path}\n\`\`\`${snippet.language || "javascript"}\n${snippet.code}\n\`\`\``
            )
            .join("\n\n") || "No existing code provided."
        }
        
        Generate clean, maintainable, production-ready code for this task.
        Follow best practices for frontend development.
        Include helpful comments to explain complex logic.
        Make sure the code is compatible with the existing project structure.
        
        Your response MUST be a valid JSON object with the following structure:
        {
          "files": [
            {
              "path": "path/to/file.js",
              "code": "// Code content here",
              "description": "What this file does and how it fits into the project"
            },
            // More files as needed
          ],
          "explanation": "Overall explanation of how these files work together"
        }
        
        DO NOT include any explanatory text outside the JSON structure. The entire response must be valid JSON.
        `;

    try {
      const codeResponse = await this.llm.complete(codePrompt, {
        temperature: 0.2,
        responseFormat: { type: "json_object" },
        maxTokens: 4000,
      });

      // Parse the response, handling various formats
      let codeGeneration;
      try {
        // If it's a string, try to extract JSON
        if (typeof codeResponse === "string") {
          // Try to find JSON in the response
          codeGeneration = this._extractJsonFromString(codeResponse);

          // If no valid JSON found, create a simple object with the response
          if (!codeGeneration) {
            // Try to extract code blocks from the response
            const codeBlocks = [];
            const regex = /```(?:[\w-]+)?\s*([\s\S]*?)```/g;
            let match;
            let index = 0;

            while ((match = regex.exec(codeResponse)) !== null) {
              codeBlocks.push({
                path: `extracted-code-${index++}.js`,
                code: match[1],
                description: "Extracted code block from LLM response",
              });
            }

            if (codeBlocks.length === 0) {
              // No code blocks found, use the raw response
              codeBlocks.push({
                path: "generated-content.txt",
                code: codeResponse,
                description: "Generated content from LLM",
              });
            }

            codeGeneration = {
              files: codeBlocks,
              explanation: "Code extracted from LLM natural language response",
            };
          }
        } else {
          // If it's already an object, use it directly
          codeGeneration = codeResponse;
        }
      } catch (e) {
        this.logger.warn(
          `Failed to parse code generation response: ${e.message}`,
          {
            response:
              typeof codeResponse === "string"
                ? codeResponse.substring(0, 200) + "..."
                : "Non-string response",
          }
        );

        // Create a fallback structure to prevent complete failure
        codeGeneration = {
          files: [
            {
              path: "generated-content.txt",
              code:
                typeof codeResponse === "string"
                  ? codeResponse
                  : JSON.stringify(codeResponse),
              description: "Generated content from LLM (parsing failed)",
            },
          ],
          explanation: `Failed to parse as JSON: ${e.message}`,
        };
      }

      // Write files if file system is available
      if (this.fileSystem && codeGeneration.files) {
        for (const file of codeGeneration.files) {
          try {
            await this.fileSystem.writeFile(file.path, file.code);
            this.logger.info(`File written: ${file.path}`);
          } catch (e) {
            this.logger.warn(`Failed to write file: ${file.path}`, {
              error: e.message,
            });
          }
        }
      }

      return {
        status: "success",
        generatedCode: codeGeneration,
      };
    } catch (e) {
      throw new Error(`Code generation failed: ${e.message}`);
    }
  }

  /**
   * Handle architecture action
   * @private
   */
  async _handleArchitectureAction(action, context) {
    this.logger.info("Executing architecture action", {
      stepId: action.stepId,
    });

    if (!this.llm) {
      throw new Error("LLM service required for architecture design");
    }

    const architecturePrompt = `
        You are an expert frontend architect designing a robust application structure.
        
        ARCHITECTURE TASK:
        ${action.description}
        
        CONTEXT:
        ${JSON.stringify(action.architectureContext || {}, null, 2)}
        
        Design a comprehensive architecture for this frontend application.
        Consider component structure, state management, data flow, and API interactions.
        Follow modern frontend best practices and design patterns.
        
        Your architecture should include:
        1. High-level system diagram
        2. Component hierarchy
        3. State management approach
        4. Data flow patterns
        5. API integration strategy
        6. Folder structure and file organization
        
        Your response MUST be a valid JSON object with the following structure:
        {
          "overview": "High-level description of the architecture",
          "components": [
            {
              "name": "ComponentName",
              "purpose": "What this component does",
              "subcomponents": ["ChildComponent1", "ChildComponent2"]
            }
          ],
          "stateManagement": { ... },
          "dataFlow": [ ... ],
          "apiIntegration": { ... },
          "folderStructure": { ... }
        }
        
        DO NOT include any explanatory text outside the JSON structure.
        `;

    try {
      const architectureResponse = await this.llm.complete(architecturePrompt, {
        temperature: 0.3,
        responseFormat: { type: "json_object" },
        maxTokens: 3000,
      });

      let architecture;
      try {
        if (typeof architectureResponse === "string") {
          // Try to extract JSON from the string
          architecture = this._extractJsonFromString(architectureResponse);

          // If extraction failed, create a fallback
          if (!architecture) {
            architecture = {
              overview: architectureResponse.substring(0, 500),
              components: [],
              rawResponse: architectureResponse.substring(0, 1000),
            };
          }
        } else {
          // Already an object
          architecture = architectureResponse;
        }
      } catch (e) {
        throw new Error(`Failed to parse architecture response: ${e.message}`);
      }

      return {
        status: "success",
        architecture,
      };
    } catch (e) {
      throw new Error(`Architecture design failed: ${e.message}`);
    }
  }

  /**
   * Handle testing action
   * @private
   */
  async _handleTestingAction(action, context) {
    this.logger.info("Executing testing action", { stepId: action.stepId });

    if (!this.llm) {
      throw new Error("LLM service required for test generation");
    }

    const testingPrompt = `
        You are an expert frontend test engineer creating comprehensive tests.
        
        TESTING TASK:
        ${action.description}
        
        CONTEXT:
        ${JSON.stringify(action.testingContext || {}, null, 2)}
        
        COMPONENTS TO TEST:
        ${JSON.stringify(action.testingContext?.componentsToTest || [], null, 2)}
        
        Generate a comprehensive testing strategy and test code for these components.
        Include unit tests, integration tests, and UI tests as appropriate.
        Follow testing best practices for frontend applications.
        
        Your response MUST be a valid JSON object with the following structure:
        {
          "testingStrategy": "Overall approach to testing",
          "testFiles": [
            {
              "path": "path/to/test.js",
              "code": "// Test code here",
              "description": "What this test file does"
            }
          ],
          "testCoverage": { ... },
          "testingTools": [ ... ]
        }
        
        DO NOT include any explanatory text outside the JSON structure.
        `;

    try {
      const testResponse = await this.llm.complete(testingPrompt, {
        temperature: 0.2,
        responseFormat: { type: "json_object" },
        maxTokens: 3000,
      });

      let testing;
      try {
        if (typeof testResponse === "string") {
          // Try to extract JSON from the string
          testing = this._extractJsonFromString(testResponse);

          // If extraction failed, create a fallback with code blocks
          if (!testing) {
            // Try to extract code blocks from the response
            const testFiles = [];
            const regex = /```(?:[\w-]+)?\s*([\s\S]*?)```/g;
            let match;
            let index = 0;

            while ((match = regex.exec(testResponse)) !== null) {
              testFiles.push({
                path: `extracted-test-${index++}.js`,
                code: match[1],
                description: "Extracted test code from LLM response",
              });
            }

            if (testFiles.length === 0) {
              // No code blocks found, use the raw response
              testFiles.push({
                path: "generated-test.txt",
                code: testResponse,
                description: "Generated test content from LLM",
              });
            }

            testing = {
              testingStrategy: "Extracted from LLM response",
              testFiles: testFiles,
              rawResponse: testResponse.substring(0, 1000),
            };
          }
        } else {
          // Already an object
          testing = testResponse;
        }
      } catch (e) {
        throw new Error(`Failed to parse testing response: ${e.message}`);
      }

      // Write test files if file system is available
      if (this.fileSystem && testing.testFiles) {
        for (const file of testing.testFiles) {
          try {
            await this.fileSystem.writeFile(file.path, file.code);
            this.logger.info(`Test file written: ${file.path}`);
          } catch (e) {
            this.logger.warn(`Failed to write test file: ${file.path}`, {
              error: e.message,
            });
          }
        }
      }

      return {
        status: "success",
        testing,
      };
    } catch (e) {
      throw new Error(`Test generation failed: ${e.message}`);
    }
  }

  /**
   * Handle deployment action
   * @private
   */
  async _handleDeploymentAction(action, context) {
    this.logger.info("Executing deployment action", { stepId: action.stepId });

    if (!this.llm) {
      throw new Error("LLM service required for deployment planning");
    }

    const deploymentPrompt = `
        You are an expert DevOps engineer creating a deployment plan.
        
        DEPLOYMENT TASK:
        ${action.description}
        
        CONTEXT:
        ${JSON.stringify(action.deploymentContext || {}, null, 2)}
        
        Create a comprehensive deployment plan for this frontend application.
        Consider build process, environment configuration, and deployment targets.
        Follow DevOps best practices for frontend applications.
        
        Your response MUST be a valid JSON object with the following structure:
        {
          "deploymentStrategy": "Overall approach to deployment",
          "buildProcess": { ... },
          "environmentConfig": { ... },
          "deploymentSteps": [ ... ],
          "monitoringStrategy": { ... }
        }
        
        DO NOT include any explanatory text outside the JSON structure.
        `;

    try {
      const deploymentResponse = await this.llm.complete(deploymentPrompt, {
        temperature: 0.3,
        responseFormat: { type: "json_object" },
        maxTokens: 2000,
      });

      let deployment;
      try {
        if (typeof deploymentResponse === "string") {
          // Try to extract JSON from the string
          deployment = this._extractJsonFromString(deploymentResponse);

          // If extraction failed, create a fallback
          if (!deployment) {
            deployment = {
              deploymentStrategy: deploymentResponse.substring(0, 500),
              rawResponse: deploymentResponse.substring(0, 1000),
            };
          }
        } else {
          // Already an object
          deployment = deploymentResponse;
        }
      } catch (e) {
        throw new Error(`Failed to parse deployment response: ${e.message}`);
      }

      return {
        status: "success",
        deployment,
      };
    } catch (e) {
      throw new Error(`Deployment planning failed: ${e.message}`);
    }
  }

  /**
   * Handle unblock plan action
   * @private
   */
  async _handleUnblockPlanAction(action, context) {
    this.logger.info("Executing unblock plan action", {
      planId: action.planId,
    });

    if (!this.llm) {
      throw new Error("LLM service required for plan unblocking");
    }

    const unblockPrompt = `
        You are an expert project manager resolving plan dependencies.
        
        BLOCKED PLAN:
        ${JSON.stringify(action, null, 2)}
        
        CONTEXT:
        ${JSON.stringify(action.planContext || {}, null, 2)}
        
        Analyze the blocked steps and their dependencies.
        Determine the root cause of the dependency issues.
        Provide a solution to unblock the plan.
        
        Your response MUST be a valid JSON object with the following structure:
        {
          "analysis": "Detailed analysis of the dependency issues",
          "rootCause": "The fundamental reason for the blockage",
          "solution": "Proposed solution to unblock the plan",
          "stepChanges": [
            {
              "stepId": "step-id",
              "recommendedAction": "skip|modify|split|reorder",
              "details": "Specific changes to make to this step"
            }
          ]
        }
        
        DO NOT include any explanatory text outside the JSON structure.
        `;

    try {
      const unblockResponse = await this.llm.complete(unblockPrompt, {
        temperature: 0.4,
        responseFormat: { type: "json_object" },
        maxTokens: 2000,
      });

      let unblockPlan;
      try {
        if (typeof unblockResponse === "string") {
          // Try to extract JSON from the string
          unblockPlan = this._extractJsonFromString(unblockResponse);

          // If extraction failed, create a fallback
          if (!unblockPlan) {
            unblockPlan = {
              analysis: "Failed to parse LLM response as JSON",
              solution: "Try a different approach to the plan",
              rawResponse: unblockResponse.substring(0, 1000),
            };
          }
        } else {
          // Already an object
          unblockPlan = unblockResponse;
        }
      } catch (e) {
        throw new Error(`Failed to parse unblock plan response: ${e.message}`);
      }

      return {
        status: "success",
        unblockPlan,
      };
    } catch (e) {
      throw new Error(`Unblock plan action failed: ${e.message}`);
    }
  }

  /**
   * Handle browse web action
   * @private
   */
  async _handleBrowseWebAction(action, context) {
    this.logger.info("Executing browse web action", { url: action.url });

    if (!this.browserInterface) {
      throw new Error("Browser interface required for web browsing");
    }

    try {
      let result;

      if (action.url) {
        // Visit a specific URL
        result = await this.browserInterface.visitUrl(action.url);
      } else if (action.searchQuery) {
        // Perform a web search
        result = await this.browserInterface.search(action.searchQuery);
      } else if (action.interaction) {
        // Perform a web interaction (click, type, etc.)
        result = await this.browserInterface.interact(action.interaction);
      } else {
        throw new Error(
          "Browse web action missing required parameters: url, searchQuery, or interaction"
        );
      }

      // Extract and analyze content if needed
      let analysis = null;
      if (action.shouldAnalyzeContent && this.llm) {
        const analysisPrompt = `
            You are an expert web content analyzer.
            
            WEB CONTENT:
            ${result.content || result.searchResults || JSON.stringify(result)}
            
            ANALYSIS GOAL:
            ${action.analysisGoal || "Extract key information and insights from this web content."}
            
            Analyze this web content and extract the most relevant information.
            
            Your response MUST be a valid JSON object with the following structure:
            {
              "keyInformation": [ ... ],
              "insights": [ ... ],
              "relevance": "How relevant this content is to the goal",
              "nextSteps": [ ... ]
            }
            
            DO NOT include any explanatory text outside the JSON structure.
            `;

        try {
          const analysisResponse = await this.llm.complete(analysisPrompt, {
            temperature: 0.3,
            responseFormat: { type: "json_object" },
            maxTokens: 2000,
          });

          if (typeof analysisResponse === "string") {
            analysis = this._extractJsonFromString(analysisResponse);
            if (!analysis) {
              analysis = {
                keyInformation: [analysisResponse.substring(0, 500)],
                rawResponse: analysisResponse.substring(0, 1000),
              };
            }
          } else {
            analysis = analysisResponse;
          }
        } catch (e) {
          this.logger.warn("Failed to analyze web content", {
            error: e.message,
          });
        }
      }

      return {
        status: "success",
        webResult: result,
        analysis,
      };
    } catch (e) {
      throw new Error(`Browse web action failed: ${e.message}`);
    }
  }

  /**
   * Handle file operation action
   * @private
   */
  async _handleFileOperationAction(action, context) {
    this.logger.info("Executing file operation action", {
      operation: action.operation,
    });

    if (!this.fileSystem) {
      throw new Error("File system interface required for file operations");
    }

    try {
      let result;

      switch (action.operation) {
        case "read":
          if (!action.path) {
            throw new Error("File path is required for read operation");
          }
          result = await this.fileSystem.readFile(action.path);
          break;

        case "write":
          if (!action.path || action.content === undefined) {
            throw new Error(
              "File path and content are required for write operation"
            );
          }
          result = await this.fileSystem.writeFile(action.path, action.content);
          break;

        case "delete":
          if (!action.path) {
            throw new Error("File path is required for delete operation");
          }
          result = await this.fileSystem.deleteFile(action.path);
          break;

        case "list":
          result = await this.fileSystem.listFiles(action.path || ".");
          break;

        case "mkdir":
          if (!action.path) {
            throw new Error("Directory path is required for mkdir operation");
          }
          result = await this.fileSystem.createDirectory(action.path);
          break;

        default:
          throw new Error(`Unsupported file operation: ${action.operation}`);
      }

      return {
        status: "success",
        fileResult: result,
      };
    } catch (e) {
      throw new Error(`File operation failed: ${e.message}`);
    }
  }

  /**
   * Handle computer control action
   * @private
   */
  async _handleComputerControlAction(action, context) {
    this.logger.info("Executing computer control action", {
      controlType: action.controlType,
    });

    if (!this.computerControl) {
      throw new Error(
        "Computer control interface required for OS-level interactions"
      );
    }

    try {
      let result;

      switch (action.controlType) {
        case "execute":
          if (!action.command) {
            throw new Error("Command is required for execute operation");
          }
          result = await this.computerControl.executeCommand(
            action.command,
            action.options
          );
          break;

        case "screenshot":
          result = await this.computerControl.takeScreenshot(action.region);
          break;

        case "input":
          if (!action.inputType || !action.inputValue) {
            throw new Error(
              "Input type and value are required for input operation"
            );
          }
          result = await this.computerControl.sendInput(
            action.inputType,
            action.inputValue,
            action.options
          );
          break;

        case "app":
          if (!action.appAction || !action.appName) {
            throw new Error(
              "App action and name are required for app operation"
            );
          }
          result = await this.computerControl.controlApp(
            action.appAction,
            action.appName,
            action.options
          );
          break;

        default:
          throw new Error(
            `Unsupported computer control type: ${action.controlType}`
          );
      }

      return {
        status: "success",
        controlResult: result,
      };
    } catch (e) {
      throw new Error(`Computer control action failed: ${e.message}`);
    }
  }
}

module.exports = ExecutionModule;
