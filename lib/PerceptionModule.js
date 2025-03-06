/**
 * PerceptionModule.js
 * Responsible for gathering and processing information about the current state.
 * Acts as the agent's "senses" to understand the project, code, and environment.
 */

class PerceptionModule {
  constructor(config = {}) {
    this.fileSystem = config.fileSystem || null;
    this.computerControl = config.computerControl || null;
    this.browserInterface = config.browserInterface || null;
    this.logger = config.logger || console;
    this.maxFileSize = config.maxFileSize || 1024 * 1024; // 1MB default
    this.relevantFileExtensions = config.relevantFileExtensions || [
      ".js",
      ".jsx",
      ".ts",
      ".tsx",
      ".css",
      ".scss",
      ".less",
      ".html",
      ".vue",
      ".svelte",
      ".json",
      ".md",
    ];
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
   * Set browser interface for web interactions
   * @param {Object} browserInterface - Browser interface
   */
  setBrowserInterface(browserInterface) {
    this.browserInterface = browserInterface;
  }

  /**
   * Perceive the current state of the system
   * @param {Object} memory - Agent memory
   * @param {Object} currentPlan - Current plan
   * @returns {Object} - Current state
   */
  async perceive(memory, currentPlan) {
    this.logger.info("Perceiving current state");

    // Initialize the state object
    const state = {
      timestamp: new Date().toISOString(),
      projectStructure: null,
      relevantCode: [],
      currentPlan: {
        id: currentPlan.id,
        progress: currentPlan.getProgressPercentage(),
        completedSteps: currentPlan.getCompletedSteps().length,
        pendingSteps: currentPlan.getPendingSteps().length,
        currentStep: null,
      },
      systemInfo: {},
      screenshot: null,
    };

    // Find current step in plan
    const inProgressSteps = currentPlan.getInProgressSteps();
    if (inProgressSteps.length > 0) {
      state.currentPlan.currentStep = inProgressSteps[0];
    } else {
      const executableSteps = currentPlan.getExecutableSteps();
      if (executableSteps.length > 0) {
        state.currentPlan.currentStep = executableSteps[0];
      }
    }

    // Get project structure
    if (this.fileSystem) {
      try {
        state.projectStructure = await this._perceiveProjectStructure();
      } catch (e) {
        this.logger.warn("Failed to perceive project structure", {
          error: e.message,
        });
      }
    }

    // Get relevant code for the current step
    if (this.fileSystem && state.currentPlan.currentStep) {
      try {
        state.relevantCode = await this._perceiveRelevantCode(
          state.currentPlan.currentStep,
          state.projectStructure
        );
      } catch (e) {
        this.logger.warn("Failed to perceive relevant code", {
          error: e.message,
        });
      }
    }

    // Get system information
    if (this.computerControl) {
      try {
        state.systemInfo = await this._perceiveSystemInfo();
      } catch (e) {
        this.logger.warn("Failed to perceive system info", {
          error: e.message,
        });
      }
    }

    // Take screenshot if available
    if (this.computerControl) {
      try {
        state.screenshot = await this._takeScreenshot();
      } catch (e) {
        this.logger.warn("Failed to take screenshot", { error: e.message });
      }
    }

    return state;
  }

  /**
   * Get the project structure
   * @private
   */
  async _perceiveProjectStructure() {
    if (!this.fileSystem) {
      throw new Error(
        "File system interface required for project structure perception"
      );
    }

    try {
      // List files in the project directory
      const files = await this.fileSystem.listFiles(".", { recursive: true });

      // Get package.json if it exists
      let packageJson = null;
      if (files.includes("package.json")) {
        try {
          const packageJsonContent =
            await this.fileSystem.readFile("package.json");
          packageJson = JSON.parse(packageJsonContent);
        } catch (e) {
          this.logger.warn("Failed to parse package.json", {
            error: e.message,
          });
        }
      }

      // Get tsconfig.json if it exists
      let tsConfig = null;
      if (files.includes("tsconfig.json")) {
        try {
          const tsConfigContent =
            await this.fileSystem.readFile("tsconfig.json");
          tsConfig = JSON.parse(tsConfigContent);
        } catch (e) {
          this.logger.warn("Failed to parse tsconfig.json", {
            error: e.message,
          });
        }
      }

      // Build directory structure tree
      const directoryStructure = this._buildDirectoryTree(files);

      return {
        files,
        packageJson,
        tsConfig,
        directoryStructure,
      };
    } catch (e) {
      throw new Error(`Failed to perceive project structure: ${e.message}`);
    }
  }

  /**
   * Build directory tree from file list
   * @private
   */
  _buildDirectoryTree(files) {
    const root = { name: "root", type: "directory", children: {} };

    for (const file of files) {
      const pathParts = file.split("/");
      let currentLevel = root.children;

      // Process all parts except the last one (which is the filename or last directory)
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        if (!part) continue;

        if (!currentLevel[part]) {
          currentLevel[part] = { name: part, type: "directory", children: {} };
        }

        currentLevel = currentLevel[part].children;
      }

      // Process the last part (file or directory)
      const lastPart = pathParts[pathParts.length - 1];
      if (!lastPart) continue;

      // Determine if it's a file or directory
      const isDirectory = file.endsWith("/");

      if (isDirectory) {
        currentLevel[lastPart] = {
          name: lastPart,
          type: "directory",
          children: {},
        };
      } else {
        currentLevel[lastPart] = { name: lastPart, type: "file" };
      }
    }

    return root;
  }

  /**
   * Get relevant code for the current step
   * @private
   */
  async _perceiveRelevantCode(currentStep, projectStructure) {
    if (!this.fileSystem || !projectStructure) {
      return [];
    }

    const relevantCode = [];

    // Start by checking any dependencies from the step
    if (currentStep.dependencies && currentStep.dependencies.length > 0) {
      // This would require access to completed steps and their generated files
      // For simplicity, we'll just focus on potential related files
    }

    // Look for files that might be relevant based on keywords in the step
    const keywords = this._extractKeywords(currentStep.description);

    // Filter files by extension and relevance
    const potentiallyRelevantFiles = projectStructure.files.filter((file) => {
      // Check file extension
      const hasRelevantExtension = this.relevantFileExtensions.some((ext) =>
        file.endsWith(ext)
      );

      if (!hasRelevantExtension) return false;

      // Check for keyword matches in the file path
      return keywords.some((keyword) =>
        file.toLowerCase().includes(keyword.toLowerCase())
      );
    });

    // Read and include the most relevant files (limit to avoid too much content)
    for (const file of potentiallyRelevantFiles.slice(0, 10)) {
      try {
        // Check file size first
        const stats = await this.fileSystem.stat(file);

        if (stats.size > this.maxFileSize) {
          this.logger.info(
            `Skipping large file: ${file} (${stats.size} bytes)`
          );
          continue;
        }

        const content = await this.fileSystem.readFile(file);

        // Determine the language from file extension
        const language = this._getLanguageFromFileName(file);

        relevantCode.push({
          path: file,
          language,
          code: content,
        });
      } catch (e) {
        this.logger.warn(`Failed to read file: ${file}`, { error: e.message });
      }
    }

    return relevantCode;
  }

  /**
   * Extract keywords from step description
   * @private
   */
  _extractKeywords(description) {
    if (!description) return [];

    // Simple keyword extraction (could be improved with NLP)
    const words = description
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 3); // Filter out short words

    // Count word frequency
    const wordCount = {};
    words.forEach((word) => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    // Sort by frequency
    const sortedWords = Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .map(([word]) => word);

    // Return top keywords (avoid common words)
    const commonWords = [
      "with",
      "that",
      "this",
      "from",
      "have",
      "when",
      "will",
      "what",
      "which",
      "make",
      "like",
      "time",
      "just",
      "know",
      "take",
      "into",
    ];

    return sortedWords
      .filter((word) => !commonWords.includes(word))
      .slice(0, 10);
  }

  /**
   * Determine language from file name
   * @private
   */
  _getLanguageFromFileName(fileName) {
    if (fileName.endsWith(".js")) return "javascript";
    if (fileName.endsWith(".jsx")) return "jsx";
    if (fileName.endsWith(".ts")) return "typescript";
    if (fileName.endsWith(".tsx")) return "tsx";
    if (fileName.endsWith(".html")) return "html";
    if (fileName.endsWith(".css")) return "css";
    if (fileName.endsWith(".scss")) return "scss";
    if (fileName.endsWith(".less")) return "less";
    if (fileName.endsWith(".json")) return "json";
    if (fileName.endsWith(".md")) return "markdown";
    if (fileName.endsWith(".vue")) return "vue";
    if (fileName.endsWith(".svelte")) return "svelte";

    // Default
    return "text";
  }

  /**
   * Get system information
   * @private
   */
  async _perceiveSystemInfo() {
    if (!this.computerControl) {
      return {};
    }

    try {
      // Get basic system info
      const osInfo = await this.computerControl.executeCommand("uname -a");
      const memoryInfo = await this.computerControl.executeCommand("free -m");
      const diskInfo = await this.computerControl.executeCommand("df -h");

      return {
        os: osInfo,
        memory: memoryInfo,
        disk: diskInfo,
      };
    } catch (e) {
      this.logger.warn("Failed to get system info", { error: e.message });
      return {};
    }
  }

  /**
   * Take a screenshot
   * @private
   */
  async _takeScreenshot() {
    if (!this.computerControl) {
      return null;
    }

    try {
      return await this.computerControl.takeScreenshot();
    } catch (e) {
      this.logger.warn("Failed to take screenshot", { error: e.message });
      return null;
    }
  }
}

module.exports = PerceptionModule;
