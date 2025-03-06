/**
 * ResearchModule.js
 * Enables autonomous web research to gather information for decision-making.
 * Can search the web, visit pages, extract structured information, and synthesize findings.
 */

class ResearchModule {
  constructor(llmService, config = {}) {
    this.llm = llmService;
    this.browserInterface = config.browserInterface || null;
    this.logger = config.logger || console;
    this.searchEngines = config.searchEngines || ["google"];
    this.maxResultsPerQuery = config.maxResultsPerQuery || 5;
    this.maxPagesToVisit = config.maxPagesToVisit || 3;
    this.researchTimeout = config.researchTimeout || 300000; // 5 minutes
    this.useCache = config.useCache !== undefined ? config.useCache : true;
    this.cache = new Map();
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
   * Conduct research on a set of queries
   * @param {Array<string>} queries - Research queries
   * @param {Object} context - Research context
   * @returns {Object} - Research results
   */
  async research(queries, context = {}) {
    this.logger.info("Starting research", { queries });

    if (!Array.isArray(queries)) {
      queries = [queries];
    }

    // Start a timeout to ensure research doesn't run too long
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error("Research timed out")),
        this.researchTimeout
      );
    });

    // Main research promise
    const researchPromise = this._conductResearch(queries, context);

    try {
      // Race the research against the timeout
      const results = await Promise.race([researchPromise, timeoutPromise]);
      return results;
    } catch (error) {
      this.logger.error("Research failed", { error: error.message });
      throw new Error(`Research failed: ${error.message}`);
    }
  }

  /**
   * Main research method
   * @private
   */
  async _conductResearch(queries, context) {
    const results = {
      id: `research-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      queries,
      context,
      searchResults: [],
      extractedInformation: [],
      synthesis: null,
    };

    // Browser-based research
    if (this.browserInterface) {
      await this._conductBrowserResearch(queries, context, results);
    } else if (this.llm) {
      // LLM-based research (fallback)
      await this._conductLLMResearch(queries, context, results);
    } else {
      throw new Error(
        "No research capabilities available (needs browserInterface or LLM)"
      );
    }

    // Synthesize research findings
    if (this.llm) {
      results.synthesis = await this._synthesizeResearch(results);
    }

    return results;
  }

  /**
   * Conduct browser-based research
   * @private
   */
  async _conductBrowserResearch(queries, context, results) {
    for (const query of queries) {
      this.logger.info(`Researching query: ${query}`);

      // Check cache first if enabled
      const cacheKey = this._generateCacheKey(query);
      if (this.useCache && this.cache.has(cacheKey)) {
        this.logger.info(`Using cached results for query: ${query}`);
        const cachedResults = this.cache.get(cacheKey);
        results.searchResults.push({
          query,
          results: cachedResults.results,
          fromCache: true,
        });

        // Add extracted information from cache
        cachedResults.extractedInfo.forEach((info) => {
          results.extractedInformation.push({
            ...info,
            query,
            fromCache: true,
          });
        });

        continue;
      }

      try {
        // Perform search using browser interface
        const searchResults = await this.browserInterface.search(query, {
          engine: this.searchEngines[0],
          numResults: this.maxResultsPerQuery,
        });

        const queryResults = {
          query,
          results: searchResults,
          timestamp: new Date().toISOString(),
        };

        results.searchResults.push(queryResults);

        // Visit top pages and extract information
        const extractedInfoForQuery = [];
        for (const result of searchResults.slice(0, this.maxPagesToVisit)) {
          try {
            // Visit the page
            const pageContent = await this.browserInterface.visitUrl(
              result.url
            );

            // Extract information from page
            const extractedInfo = await this._extractInformation(
              pageContent,
              query,
              context,
              result.url
            );

            extractedInfoForQuery.push(extractedInfo);
            results.extractedInformation.push({
              query,
              url: result.url,
              title: result.title,
              extractedInfo,
            });
          } catch (e) {
            this.logger.warn(
              `Failed to extract information from ${result.url}`,
              { error: e.message }
            );
          }
        }

        // Cache the results
        if (this.useCache) {
          this.cache.set(cacheKey, {
            results: searchResults,
            extractedInfo: extractedInfoForQuery,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (e) {
        this.logger.error(`Search failed for query: ${query}`, {
          error: e.message,
        });
        results.searchResults.push({
          query,
          error: e.message,
          results: [],
        });
      }
    }
  }

  /**
   * Conduct LLM-based research (fallback without browser)
   * @private
   */
  async _conductLLMResearch(queries, context, results) {
    for (const query of queries) {
      this.logger.info(`LLM research on query: ${query}`);

      // Check cache first if enabled
      const cacheKey = this._generateCacheKey(query);
      if (this.useCache && this.cache.has(cacheKey)) {
        this.logger.info(`Using cached results for query: ${query}`);
        const cachedResults = this.cache.get(cacheKey);
        results.extractedInformation.push({
          query,
          extractedInfo: cachedResults.llmResearch,
          fromCache: true,
        });
        continue;
      }

      const researchPrompt = `
        You are an expert researcher with knowledge of frontend development.
        
        RESEARCH QUERY:
        ${query}
        
        RESEARCH CONTEXT:
        ${JSON.stringify(context, null, 2)}
        
        Provide a detailed, accurate, and up-to-date response to this query.
        Focus on providing factual information relevant to frontend development.
        Include code examples, best practices, and technical details where appropriate.
        
        Format your response as a comprehensive research report with sections and bullet points.
        `;

      try {
        const researchResponse = await this.llm.complete(researchPrompt, {
          temperature: 0.3,
          maxTokens: 2000,
        });

        results.extractedInformation.push({
          query,
          extractedInfo: researchResponse,
          source: "llm",
        });

        // Cache the results
        if (this.useCache) {
          this.cache.set(cacheKey, {
            llmResearch: researchResponse,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (e) {
        this.logger.error(`LLM research failed for query: ${query}`, {
          error: e.message,
        });
        results.extractedInformation.push({
          query,
          error: e.message,
          extractedInfo: null,
        });
      }
    }
  }

  /**
   * Extract information from page content
   * @private
   */
  async _extractInformation(pageContent, query, context, url) {
    if (!this.llm) {
      return this._basicExtraction(pageContent);
    }

    const extractionPrompt = `
      You are an expert information extractor.
      
      WEBPAGE CONTENT:
      ${this._truncateContent(pageContent, 6000)}
      
      WEBPAGE URL:
      ${url}
      
      RESEARCH QUERY:
      ${query}
      
      RESEARCH CONTEXT:
      ${JSON.stringify(context, null, 2)}
      
      Extract the most relevant information from this webpage content that specifically addresses the research query.
      Focus only on extracting factual, accurate information related to frontend development.
      Ignore advertisements, navigation elements, footers, and other irrelevant content.
      Provide code examples if they are present in the original content.
      
      Format your response as a JSON object with the following structure:
      {
        "relevance": "high|medium|low",
        "keyInformation": [
          "Key point 1",
          "Key point 2",
          ...
        ],
        "codeExamples": [
          {
            "language": "language name",
            "code": "code snippet",
            "explanation": "explanation of what the code does"
          }
        ],
        "summary": "Concise summary of the extracted information"
      }
      `;

    try {
      const extractionResponse = await this.llm.complete(extractionPrompt, {
        temperature: 0.1,
        responseFormat: { type: "json_object" },
        maxTokens: 1500,
      });

      let extraction;
      try {
        extraction =
          typeof extractionResponse === "string"
            ? JSON.parse(extractionResponse)
            : extractionResponse;
      } catch (e) {
        extraction = {
          relevance: "medium",
          keyInformation: [extractionResponse],
          codeExamples: [],
          summary: extractionResponse.substring(0, 200) + "...",
        };
      }

      return extraction;
    } catch (e) {
      this.logger.warn(`Information extraction failed for ${url}`, {
        error: e.message,
      });
      return this._basicExtraction(pageContent);
    }
  }

  /**
   * Basic extraction without LLM
   * @private
   */
  _basicExtraction(pageContent) {
    const truncated = this._truncateContent(pageContent, 2000);

    return {
      relevance: "unknown",
      keyInformation: [truncated],
      codeExamples: [],
      summary: truncated.substring(0, 200) + "...",
    };
  }

  /**
   * Synthesize research findings
   * @private
   */
  async _synthesizeResearch(results) {
    if (!this.llm) {
      return {
        summary: "Research completed, but no LLM available for synthesis.",
      };
    }

    // Prepare extracted information for synthesis
    const extractedInfo = results.extractedInformation.map((info) => ({
      query: info.query,
      url: info.url,
      title: info.title,
      extractedInfo: info.extractedInfo,
      source: info.source || "web",
    }));

    const synthesisPrompt = `
      You are an expert frontend development researcher synthesizing research findings.
      
      RESEARCH QUERIES:
      ${JSON.stringify(results.queries, null, 2)}
      
      RESEARCH CONTEXT:
      ${JSON.stringify(results.context, null, 2)}
      
      EXTRACTED INFORMATION:
      ${JSON.stringify(extractedInfo, null, 2)}
      
      Synthesize these research findings into a coherent and comprehensive report.
      Focus on information that is most relevant to frontend development.
      Identify common themes, best practices, and actionable insights.
      Resolve any contradictions in the research and provide a definitive perspective.
      If there are code examples, include the most useful ones.
      
      Your synthesis should include:
      1. A high-level summary
      2. Key findings addressing the original queries
      3. Technical details and specifications
      4. Implementation guidelines or code patterns
      5. Potential challenges and solutions
      
      Format your response as a JSON object with the following structure:
      {
        "summary": "Overall summary of research findings",
        "keyFindings": ["Finding 1", "Finding 2", ...],
        "technicalDetails": { ... },
        "implementationGuidelines": [ ... ],
        "codeExamples": [ ... ],
        "challenges": [ ... ],
        "recommendations": [ ... ]
      }
      `;

    try {
      const synthesisResponse = await this.llm.complete(synthesisPrompt, {
        temperature: 0.3,
        responseFormat: { type: "json_object" },
        maxTokens: 2500,
      });

      let synthesis;
      try {
        synthesis =
          typeof synthesisResponse === "string"
            ? JSON.parse(synthesisResponse)
            : synthesisResponse;
      } catch (e) {
        synthesis = {
          summary: synthesisResponse,
          keyFindings: [
            "Research synthesis completed, but response format was unexpected.",
          ],
        };
      }

      return synthesis;
    } catch (e) {
      this.logger.warn("Research synthesis failed", { error: e.message });
      return {
        summary: "Research synthesis failed due to an error.",
        error: e.message,
        keyFindings: results.queries.map((q) => `Query: ${q}`),
      };
    }
  }

  /**
   * Generate cache key for a query
   * @private
   */
  _generateCacheKey(query) {
    return `research-${query.toLowerCase().trim().replace(/\s+/g, "-")}`;
  }

  /**
   * Truncate content to avoid token limits
   * @private
   */
  _truncateContent(content, maxLength = 6000) {
    if (!content) return "";

    // If content is already shorter than max length, return as is
    if (content.length <= maxLength) return content;

    // Get the first part
    const firstPart = content.substring(0, maxLength / 2);

    // Get the last part
    const lastPart = content.substring(content.length - maxLength / 2);

    // Combine with an ellipsis in the middle
    return `${firstPart}\n\n[...Content truncated...]\n\n${lastPart}`;
  }

  /**
   * Clear the research cache
   */
  clearCache() {
    this.cache.clear();
    this.logger.info("Research cache cleared");
  }

  /**
   * Set cache settings
   * @param {Object} cacheSettings - Cache settings
   */
  setCacheSettings(cacheSettings = {}) {
    if (cacheSettings.useCache !== undefined) {
      this.useCache = cacheSettings.useCache;
    }

    if (cacheSettings.clearCache) {
      this.clearCache();
    }
  }

  /**
   * Configure search settings
   * @param {Object} searchSettings - Search settings
   */
  configureSearch(searchSettings = {}) {
    if (
      searchSettings.searchEngines &&
      Array.isArray(searchSettings.searchEngines)
    ) {
      this.searchEngines = searchSettings.searchEngines;
    }

    if (searchSettings.maxResultsPerQuery) {
      this.maxResultsPerQuery = searchSettings.maxResultsPerQuery;
    }

    if (searchSettings.maxPagesToVisit) {
      this.maxPagesToVisit = searchSettings.maxPagesToVisit;
    }

    if (searchSettings.researchTimeout) {
      this.researchTimeout = searchSettings.researchTimeout;
    }
  }
}

module.exports = ResearchModule;
