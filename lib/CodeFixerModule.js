// lib/CodeFixerModule.js
import { EventEmitter } from "./EventEmitter";
import axios from "axios";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { exec } from "child_process";
import { promisify } from "util";

// Promisify exec
const execAsync = promisify(exec);

/**
 * CodeFixerModule - Analyzes and fixes issues in generated code
 * Ensures production quality by checking for bugs, missing dependencies,
 * formatting issues, and other common problems. Provides detailed feedback
 * on all changes made to improve code quality.
 */
class CodeFixerModule extends EventEmitter {
  /**
   * Create a new CodeFixerModule instance
   * @param {Object} config - Configuration options
   */
  constructor(config = {}) {
    super();

    // Configuration with defaults
    this.config = {
      apiKey: process.env.ANTHROPIC_API_KEY || "",
      model: "claude-3-5-sonnet-20240620",
      maxTokens: 4096,
      temperature: 0.2,
      projectRoot: process.cwd(),
      // Fix configuration
      fixes: {
        analyzeSyntax: true,
        fixDependencies: true,
        fixFormatting: true,
        fixCommonBugs: true,
        fixImports: true,
      },
      // Tool configuration
      tools: {
        useEslint: true,
        usePrettier: true,
      },
      // Streaming configuration
      streaming: {
        enabled: true,
      },
      ...config,
    };

    // Tracking state
    this.state = {
      files: new Map(), // Map of file paths to file content
      issues: new Map(), // Map of file paths to detected issues
      fixes: new Map(), // Map of file paths to applied fixes
      dependencies: {
        missing: new Set(),
        added: new Set(),
      },
      progress: 0,
    };

    // Active streaming operations
    this.activeStreams = new Map();

    // Build prompts for code analysis
    this.prompts = this.buildPrompts();

    // Initialize logging
    this.debug = config.debug || false;
    this.log("CodeFixerModule initialized", "info");
  }

  /**
   * Build prompts for code analysis and fixes
   * @returns {Object} A collection of prompts for different code fixing tasks
   * @private
   */
  buildPrompts() {
    return {
      analyzeCode: `
You are an expert code reviewer and debugger. Analyze the following code for potential issues:

File Path: {{filePath}}
Framework: {{framework}}

CODE:
{{code}}

Consider the following types of issues:
1. Syntax errors and typos
2. Logical bugs or edge cases
3. Missing or incorrect imports
4. Framework-specific anti-patterns
5. Dependency issues
6. Formatting and style issues

For each issue found, provide:
- The issue location (line number or code snippet)
- The issue description
- A recommended fix

Return your analysis as a JSON object with this structure:
{
  "issues": [
    {
      "type": "syntax|logic|import|pattern|dependency|formatting",
      "location": "line number or description",
      "description": "Detailed description of the issue",
      "severity": "critical|high|medium|low",
      "fix": "Proposed fix code or description"
    }
  ],
  "missingDependencies": ["package-name"],
  "overallAssessment": "Brief summary of code quality"
}

If no issues are found, return: { "issues": [], "missingDependencies": [], "overallAssessment": "Code looks good" }
      `,

      fixCode: `
You are an expert code fixer. Fix the following issues in the code:

File Path: {{filePath}}
Framework: {{framework}}

ORIGINAL CODE:
{{code}}

DETECTED ISSUES:
{{issues}}

Fix the code according to the detected issues. Make only the necessary changes to address the identified problems.
Return ONLY the complete fixed code with no explanations or markdown formatting.
      `,
    };
  }

  /**
   * Load all files from a project directory
   * @param {string} projectDir - Directory containing the project files
   * @returns {Promise<Map>} Map of file paths to contents
   */
  async loadProject(projectDir) {
    const projectPath = projectDir || this.config.projectRoot;

    this.log(`Loading project files from ${projectPath}`, "info");

    try {
      // Clear previous state
      this.state.files.clear();
      this.state.issues.clear();
      this.state.fixes.clear();
      this.state.dependencies.missing.clear();
      this.state.dependencies.added.clear();

      // Read project files
      const files = await this.readFilesRecursively(projectPath);

      this.log(`Loaded ${files.size} files from project`, "info");

      // Emit project loaded event
      this.emit("project:loaded", {
        projectDir: projectPath,
        fileCount: files.size,
      });

      return files;
    } catch (error) {
      this.log(`Failed to load project: ${error.message}`, "error");
      throw new Error(`Failed to load project: ${error.message}`);
    }
  }

  /**
   * Read all files recursively from a directory
   * @param {string} dir - Directory to read
   * @param {string} [baseDir] - Base directory for relative paths
   * @returns {Promise<Map>} Map of file paths to contents
   * @private
   */
  async readFilesRecursively(dir, baseDir = null) {
    const base = baseDir || dir;
    const files = new Map();

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(base, fullPath);

        // Skip node_modules, .git, and other common excluded directories
        if (entry.isDirectory()) {
          if (
            ["node_modules", ".git", ".next", "dist", "build"].includes(
              entry.name
            )
          ) {
            continue;
          }

          // Recursively read subdirectories
          const subFiles = await this.readFilesRecursively(fullPath, base);
          for (const [subPath, content] of subFiles.entries()) {
            files.set(subPath, content);
          }
        } else if (this.shouldProcessFile(entry.name)) {
          // Read file content
          const content = await fs.readFile(fullPath, "utf8");
          files.set(relativePath, content);
          this.state.files.set(relativePath, content);
        }
      }

      return files;
    } catch (error) {
      this.log(`Error reading files: ${error.message}`, "error");
      throw error;
    }
  }

  /**
   * Determine if a file should be processed based on its name
   * @param {string} filename - Name of the file
   * @returns {boolean} True if the file should be processed
   * @private
   */
  shouldProcessFile(filename) {
    const ext = path.extname(filename).toLowerCase();
    const processableExtensions = [
      ".js",
      ".jsx",
      ".ts",
      ".tsx",
      ".vue",
      ".css",
      ".scss",
      ".html",
      ".json",
      ".md",
    ];

    // Skip hidden files, except important config files
    if (
      filename.startsWith(".") &&
      !filename.endsWith(".eslintrc.js") &&
      !filename.endsWith(".babelrc")
    ) {
      return false;
    }

    return processableExtensions.includes(ext);
  }

  /**
   * Analyze a single file for issues
   * @param {string} filePath - Path to the file
   * @param {string} content - Content of the file
   * @param {string} framework - Framework being used
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} Analysis results
   */
  async analyzeFile(filePath, content, framework, options = {}) {
    const streamingEnabled =
      options.streaming !== false && this.config.streaming.enabled;
    const streamId = streamingEnabled ? crypto.randomUUID() : null;

    this.log(`Analyzing file: ${filePath}`, "info");

    try {
      // Initialize streaming if enabled
      if (streamingEnabled) {
        this.activeStreams.set(streamId, {
          status: "processing",
          type: "file_analysis",
          filePath,
          progress: 0,
          startTime: Date.now(),
          currentData: null,
        });

        // Emit analysis start event
        this.emit("analysis:start", {
          filePath,
          streamId,
        });
      }

      // First check for syntax errors using a lightweight approach
      let syntaxIssues = [];
      if (this.config.fixes.analyzeSyntax) {
        syntaxIssues = await this.checkSyntaxErrors(filePath, content);
      }

      // If there are critical syntax errors, don't proceed with deeper analysis
      if (syntaxIssues.some((issue) => issue.severity === "critical")) {
        const issues = {
          issues: syntaxIssues,
          missingDependencies: [],
          overallAssessment: "Critical syntax errors found",
        };

        this.state.issues.set(filePath, issues);

        // Update streaming status if enabled
        if (streamingEnabled) {
          this.updateStreamStatus(streamId, "completed", 100, issues);
        }

        return issues;
      }

      // Prepare the prompt for code analysis
      let prompt = this.prompts.analyzeCode
        .replace("{{filePath}}", filePath)
        .replace("{{framework}}", framework || "unknown")
        .replace("{{code}}", content);

      // Call Claude API for analysis
      const response = await axios.post(
        "https://api.anthropic.com/v1/messages",
        {
          model: this.config.model,
          max_tokens: this.config.maxTokens,
          temperature: 0.2, // Lower temperature for more precise analysis
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

      // Parse the JSON from the response
      const analysisResults = this.extractJSONFromText(responseContent);

      if (!analysisResults) {
        throw new Error("Failed to parse analysis results from API response");
      }

      // Combine with any syntax issues found earlier
      if (syntaxIssues.length > 0) {
        analysisResults.issues = [
          ...syntaxIssues,
          ...(analysisResults.issues || []),
        ];
      }

      // Store the issues
      this.state.issues.set(filePath, analysisResults);

      // Add any missing dependencies to the global set
      if (
        analysisResults.missingDependencies &&
        Array.isArray(analysisResults.missingDependencies)
      ) {
        analysisResults.missingDependencies.forEach((dep) =>
          this.state.dependencies.missing.add(dep)
        );
      }

      // Update streaming status if enabled
      if (streamingEnabled) {
        this.updateStreamStatus(streamId, "completed", 100, analysisResults);
      }

      // Emit analysis complete event
      this.emit("analysis:complete", {
        filePath,
        issueCount: analysisResults.issues.length,
        hasCriticalIssues: analysisResults.issues.some(
          (issue) => issue.severity === "critical"
        ),
        streamId,
      });

      return analysisResults;
    } catch (error) {
      this.log(`Analysis failed for ${filePath}: ${error.message}`, "error");

      // Update streaming status if enabled
      if (streamingEnabled) {
        this.updateStreamStatus(streamId, "error", 0, { error: error.message });
      }

      // Emit error event
      this.emit("analysis:error", {
        filePath,
        error: error.message,
        streamId,
      });

      throw error;
    }
  }

  /**
   * Fix issues in a file based on analysis
   * @param {string} filePath - Path to the file
   * @param {string} content - Original content of the file
   * @param {Object} issues - Issues found in the file
   * @param {Object} options - Fix options
   * @returns {Promise<Object>} Fix results
   */
  async fixFile(filePath, content, issues, options = {}) {
    const streamingEnabled =
      options.streaming !== false && this.config.streaming.enabled;
    const streamId = streamingEnabled ? crypto.randomUUID() : null;

    this.log(`Fixing issues in file: ${filePath}`, "info");

    try {
      // Initialize streaming if enabled
      if (streamingEnabled) {
        this.activeStreams.set(streamId, {
          status: "processing",
          type: "file_fix",
          filePath,
          progress: 0,
          startTime: Date.now(),
          currentData: null,
        });

        // Emit fix start event
        this.emit("fix:start", {
          filePath,
          issueCount: issues.issues.length,
          streamId,
        });
      }

      // If no issues, just return the original content
      if (!issues.issues || issues.issues.length === 0) {
        // Update streaming status if enabled
        if (streamingEnabled) {
          this.updateStreamStatus(streamId, "completed", 100, {
            fixed: false,
            message: "No issues to fix",
          });
        }

        // Emit fix complete event
        this.emit("fix:complete", {
          filePath,
          fixed: false,
          message: "No issues to fix",
          streamId,
        });

        return {
          fixed: false,
          content: content,
          message: "No issues to fix",
        };
      }

      // Prepare the prompt for code fixing
      let prompt = this.prompts.fixCode
        .replace("{{filePath}}", filePath)
        .replace("{{framework}}", options.framework || "unknown")
        .replace("{{code}}", content)
        .replace("{{issues}}", JSON.stringify(issues.issues, null, 2));

      // Call Claude API for fixing
      const response = await axios.post(
        "https://api.anthropic.com/v1/messages",
        {
          model: this.config.model,
          max_tokens: this.config.maxTokens,
          temperature: 0.2, // Lower temperature for more precise fixes
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
      const fixedContent = response.data.content[0].text;

      // Clean up any code block markers
      const cleanedContent = this.cleanCodeBlockMarkers(fixedContent);

      // Format the code if configured
      const formattedContent = await this.formatCode(cleanedContent, filePath);

      // Compare with original to see if changes were made
      const hasChanges = content !== formattedContent;

      // Store the fixed content
      if (hasChanges) {
        this.state.fixes.set(filePath, {
          original: content,
          fixed: formattedContent,
          issues: issues.issues,
        });
      }

      // Update streaming status if enabled
      if (streamingEnabled) {
        this.updateStreamStatus(streamId, "completed", 100, {
          fixed: hasChanges,
          changes: hasChanges
            ? this.generateDiff(content, formattedContent)
            : [],
          content: formattedContent,
        });
      }

      // Emit fix complete event
      this.emit("fix:complete", {
        filePath,
        fixed: hasChanges,
        issueCount: issues.issues.length,
        streamId,
      });

      return {
        fixed: hasChanges,
        content: formattedContent,
        changes: hasChanges ? this.generateDiff(content, formattedContent) : [],
      };
    } catch (error) {
      this.log(`Fix failed for ${filePath}: ${error.message}`, "error");

      // Update streaming status if enabled
      if (streamingEnabled) {
        this.updateStreamStatus(streamId, "error", 0, { error: error.message });
      }

      // Emit error event
      this.emit("fix:error", {
        filePath,
        error: error.message,
        streamId,
      });

      throw error;
    }
  }

  /**
   * Check for syntax errors using a lightweight approach
   * @param {string} filePath - Path to the file
   * @param {string} content - Content of the file
   * @returns {Promise<Array>} Array of syntax issues
   * @private
   */
  async checkSyntaxErrors(filePath, content) {
    const issues = [];
    const ext = path.extname(filePath).toLowerCase();

    // Only check JavaScript/TypeScript files
    if (![".js", ".jsx", ".ts", ".tsx"].includes(ext)) {
      return issues;
    }

    try {
      // We could use a lightweight parser here, but for simplicity
      // we'll use a simple approach to catch obvious syntax issues

      // Check for mismatched brackets/parentheses
      const openBrackets = (content.match(/\{/g) || []).length;
      const closeBrackets = (content.match(/\}/g) || []).length;
      if (openBrackets !== closeBrackets) {
        issues.push({
          type: "syntax",
          location: "general",
          description: `Mismatched curly braces: ${openBrackets} opening vs ${closeBrackets} closing`,
          severity: "critical",
          fix: "Check and fix mismatched curly braces in the file",
        });
      }

      const openParens = (content.match(/\(/g) || []).length;
      const closeParens = (content.match(/\)/g) || []).length;
      if (openParens !== closeParens) {
        issues.push({
          type: "syntax",
          location: "general",
          description: `Mismatched parentheses: ${openParens} opening vs ${closeParens} closing`,
          severity: "critical",
          fix: "Check and fix mismatched parentheses in the file",
        });
      }

      // Check for obvious unclosed string literals
      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Count single quotes
        const singleQuotes = (line.match(/'/g) || []).length;
        if (singleQuotes % 2 !== 0 && !line.includes("\\'")) {
          issues.push({
            type: "syntax",
            location: `line ${i + 1}`,
            description: `Odd number of single quotes (${singleQuotes}) suggests unclosed string`,
            severity: "high",
            fix: `Check line ${i + 1} for unclosed string literals`,
          });
        }

        // Count double quotes
        const doubleQuotes = (line.match(/"/g) || []).length;
        if (doubleQuotes % 2 !== 0 && !line.includes('\\\"')) {
          issues.push({
            type: "syntax",
            location: `line ${i + 1}`,
            description: `Odd number of double quotes (${doubleQuotes}) suggests unclosed string`,
            severity: "high",
            fix: `Check line ${i + 1} for unclosed string literals`,
          });
        }
      }

      return issues;
    } catch (error) {
      this.log(`Syntax check error: ${error.message}`, "error");
      return issues;
    }
  }

  /**
   * Format code using a simple formatter
   * @param {string} content - Code content to format
   * @param {string} filePath - Path of the file
   * @returns {Promise<string>} Formatted code
   * @private
   */
  async formatCode(content, filePath) {
    // If formatting is disabled, return the original content
    if (!this.config.fixes.fixFormatting) {
      return content;
    }

    try {
      const ext = path.extname(filePath).toLowerCase();

      // JavaScript/TypeScript/JSX/TSX files
      if ([".js", ".jsx", ".ts", ".tsx"].includes(ext)) {
        // Basic formatting: consistent indentation and spacing
        let formatted = content
          // Fix indentation
          .replace(/^\s+/gm, (match) =>
            " ".repeat(match.length % 2 === 0 ? match.length : match.length + 1)
          )
          // Remove trailing whitespace
          .replace(/\s+$/gm, "")
          // Ensure consistent spacing around operators
          .replace(/([=!<>]+)([^\s=])/g, "$1 $2")
          .replace(/([^\s=])([=!<>]+)/g, "$1 $2")
          // Ensure spacing after commas
          .replace(/,([^\s])/g, ", $1")
          // Ensure newline after imports
          .replace(/(import .+?;)\n(?![\n\r]|import)/g, "$1\n\n");

        return formatted;
      }

      // CSS/SCSS files
      if ([".css", ".scss", ".sass"].includes(ext)) {
        // Basic formatting for CSS
        let formatted = content
          // Fix indentation
          .replace(/^\s+/gm, (match) =>
            " ".repeat(match.length % 2 === 0 ? match.length : match.length + 1)
          )
          // Fix spacing after colons in properties
          .replace(/:\s*/g, ": ")
          // Remove trailing whitespace
          .replace(/\s+$/gm, "")
          // Ensure newline after closing braces
          .replace(/}(?![\n\r])/g, "}\n");

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
      this.log(`Code formatting failed: ${error.message}`, "warn");
      // Return the original content if formatting fails
      return content;
    }
  }

  /**
   * Clean up code block markers from generated code
   * @param {string} content - Content to clean up
   * @returns {string} Cleaned content
   * @private
   */
  cleanCodeBlockMarkers(content) {
    // If content starts with a code block marker, remove it and any language identifier
    if (content.startsWith("```")) {
      const firstLineBreak = content.indexOf("\n");
      if (firstLineBreak !== -1) {
        content = content.substring(firstLineBreak + 1);
      }
    }

    // If content ends with a code block marker, remove it
    if (content.endsWith("```")) {
      content = content.substring(0, content.lastIndexOf("```"));
    }

    return content.trim();
  }

  /**
   * Generate a simple diff between original and fixed content
   * @param {string} original - Original content
   * @param {string} fixed - Fixed content
   * @returns {Array} Array of changes
   * @private
   */
  generateDiff(original, fixed) {
    const changes = [];
    const originalLines = original.split("\n");
    const fixedLines = fixed.split("\n");

    // Find changed lines (very simplistic diff)
    for (
      let i = 0;
      i < Math.max(originalLines.length, fixedLines.length);
      i++
    ) {
      const originalLine = i < originalLines.length ? originalLines[i] : null;
      const fixedLine = i < fixedLines.length ? fixedLines[i] : null;

      if (originalLine !== fixedLine) {
        changes.push({
          line: i + 1,
          original: originalLine,
          fixed: fixedLine,
        });
      }
    }

    return changes;
  }

  /**
   * Check and install missing dependencies
   * @param {string} projectDir - Project directory
   * @returns {Promise<Object>} Results of dependency installation
   */
  async fixDependencies(projectDir) {
    if (
      !this.config.fixes.fixDependencies ||
      this.state.dependencies.missing.size === 0
    ) {
      return {
        fixed: false,
        message: "No missing dependencies to install",
      };
    }

    this.log(
      `Installing ${this.state.dependencies.missing.size} missing dependencies`,
      "info"
    );

    try {
      // Read package.json
      const packageJsonPath = path.join(projectDir, "package.json");
      const packageJson = JSON.parse(
        await fs.readFile(packageJsonPath, "utf8")
      );

      // Get current dependencies
      const currentDeps = {
        ...(packageJson.dependencies || {}),
        ...(packageJson.devDependencies || {}),
      };

      // Filter out already installed dependencies
      const missingDeps = Array.from(this.state.dependencies.missing).filter(
        (dep) => !currentDeps[dep]
      );

      if (missingDeps.length === 0) {
        return {
          fixed: false,
          message: "All dependencies already installed",
        };
      }

      // Emit dependency installation start event
      this.emit("dependencies:start", {
        dependencies: missingDeps,
      });

      // Check if yarn is available
      const useYarn = await this.checkYarnAvailable();

      // Create install command
      const installCmd = useYarn
        ? `yarn add ${missingDeps.join(" ")}`
        : `npm install ${missingDeps.join(" ")}`;

      // Execute the install command
      const { stdout, stderr } = await execAsync(installCmd, {
        cwd: projectDir,
      });

      // Update state
      missingDeps.forEach((dep) => {
        this.state.dependencies.added.add(dep);
        this.state.dependencies.missing.delete(dep);
      });

      // Emit dependency installation complete event
      this.emit("dependencies:complete", {
        added: missingDeps,
        output: stdout,
      });

      return {
        fixed: true,
        added: missingDeps,
        command: installCmd,
        output: stdout,
      };
    } catch (error) {
      this.log(`Dependency installation failed: ${error.message}`, "error");

      // Emit dependency installation error event
      this.emit("dependencies:error", {
        error: error.message,
      });

      throw error;
    }
  }

  /**
   * Run the entire fix process on a project
   * @param {string} projectDir - Project directory
   * @param {Object} options - Fix options
   * @returns {Promise<Object>} Results of the fix process
   */
  async fixProject(projectDir, options = {}) {
    const streamingEnabled =
      options.streaming !== false && this.config.streaming.enabled;
    const streamId = streamingEnabled ? crypto.randomUUID() : null;

    this.log(`Starting complete project fix for ${projectDir}`, "info");

    try {
      // Initialize streaming if enabled
      if (streamingEnabled) {
        this.activeStreams.set(streamId, {
          status: "processing",
          type: "project_fix",
          progress: 0,
          startTime: Date.now(),
          currentData: null,
        });

        // Emit project fix start event
        this.emit("project:fix:start", {
          projectDir,
          streamId,
        });
      }

      // Load all files from the project
      await this.loadProject(projectDir);

      // Update progress
      this.updateProgress(10, streamId);

      // Determine the framework from package.json
      const framework = await this.detectFramework(projectDir);

      // Track results
      const results = {
        analyzed: 0,
        issuesFound: 0,
        filesFixed: 0,
        dependenciesAdded: 0,
        details: [],
      };

      // Analyze all files
      this.log("Starting analysis of all files", "info");
      for (const [filePath, content] of this.state.files.entries()) {
        try {
          // Skip files that don't need analysis
          if (!this.shouldAnalyzeFile(filePath)) continue;

          // Analyze the file
          const analysis = await this.analyzeFile(
            filePath,
            content,
            framework,
            {
              streaming: false, // We're already streaming at the project level
            }
          );

          results.analyzed++;
          results.issuesFound += analysis.issues.length;

          results.details.push({
            file: filePath,
            issueCount: analysis.issues.length,
            issues: analysis.issues,
          });

          // Update progress
          this.updateProgress(
            10 + (results.analyzed / this.state.files.size) * 40,
            streamId
          );
        } catch (error) {
          this.log(`Error analyzing ${filePath}: ${error.message}`, "error");

          results.details.push({
            file: filePath,
            error: error.message,
          });
        }
      }

      // Fix files with issues
      this.log("Starting fixes for files with issues", "info");
      for (const [filePath, issues] of this.state.issues.entries()) {
        try {
          // Skip if no issues found
          if (!issues.issues || issues.issues.length === 0) continue;

          const originalContent = this.state.files.get(filePath);

          // Fix the file
          const fixResult = await this.fixFile(
            filePath,
            originalContent,
            issues,
            {
              framework,
              streaming: false, // We're already streaming at the project level
            }
          );

          if (fixResult.fixed) {
            results.filesFixed++;

            // Save the fixed file
            await fs.writeFile(
              path.join(projectDir, filePath),
              fixResult.content,
              "utf8"
            );

            // Update the file in state
            this.state.files.set(filePath, fixResult.content);
          }

          // Update progress
          this.updateProgress(
            50 + (results.filesFixed / results.issuesFound) * 40,
            streamId
          );
        } catch (error) {
          this.log(`Error fixing ${filePath}: ${error.message}`, "error");
        }
      }

      // Fix dependencies
      try {
        const depResults = await this.fixDependencies(projectDir);
        results.dependenciesAdded = depResults.added
          ? depResults.added.length
          : 0;
      } catch (error) {
        this.log(`Error fixing dependencies: ${error.message}`, "error");
      }

      // Generate the final report
      const report = {
        summary: {
          filesAnalyzed: results.analyzed,
          issuesFound: results.issuesFound,
          filesFixed: results.filesFixed,
          dependenciesAdded: results.dependenciesAdded,
          totalTime: Date.now() - this.activeStreams.get(streamId)?.startTime,
        },
        fixes: Array.from(this.state.fixes.entries()).map(([file, fix]) => ({
          file,
          issuesFixed: fix.issues.length,
        })),
        dependencies: {
          added: Array.from(this.state.dependencies.added),
          stillMissing: Array.from(this.state.dependencies.missing),
        },
      };

      // Update streaming status if enabled
      if (streamingEnabled) {
        this.updateStreamStatus(streamId, "completed", 100, report);
      }

      // Emit project fix complete event
      this.emit("project:fix:complete", {
        projectDir,
        summary: report.summary,
        streamId,
      });

      this.log(
        `Project fix completed: ${results.filesFixed} files fixed`,
        "info"
      );

      return report;
    } catch (error) {
      this.log(`Project fix failed: ${error.message}`, "error");

      // Update streaming status if enabled
      if (streamingEnabled) {
        this.updateStreamStatus(streamId, "error", 0, { error: error.message });
      }

      // Emit error event
      this.emit("project:fix:error", {
        projectDir,
        error: error.message,
        streamId,
      });

      throw error;
    }
  }

  /**
   * Detect the framework used in a project
   * @param {string} projectDir - Project directory
   * @returns {Promise<string>} Detected framework
   * @private
   */
  async detectFramework(projectDir) {
    try {
      // Try to read package.json
      const packageJsonPath = path.join(projectDir, "package.json");
      const packageJson = JSON.parse(
        await fs.readFile(packageJsonPath, "utf8")
      );

      const deps = {
        ...(packageJson.dependencies || {}),
        ...(packageJson.devDependencies || {}),
      };

      // Detect framework from dependencies
      if (deps.next) return "next";
      if (deps.react && !deps.next) return "react";
      if (deps.vue) return "vue";
      if (deps["@angular/core"]) return "angular";
      if (deps.express) return "express";

      // Check for framework-specific files if dependencies don't provide a clear answer
      if (await this.fileExists(path.join(projectDir, "next.config.js")))
        return "next";
      if (await this.fileExists(path.join(projectDir, "angular.json")))
        return "angular";
      if (await this.fileExists(path.join(projectDir, "vue.config.js")))
        return "vue";

      // Default to unknown
      return "unknown";
    } catch (error) {
      this.log(`Framework detection failed: ${error.message}`, "warn");
      return "unknown";
    }
  }

  /**
   * Check if a file exists
   * @param {string} filePath - Path to check
   * @returns {Promise<boolean>} True if file exists
   * @private
   */
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if yarn is available
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
   * Determine if a file should be analyzed
   * @param {string} filePath - Path of the file
   * @returns {boolean} True if the file should be analyzed
   * @private
   */
  shouldAnalyzeFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();

    // Skip common asset files, etc.
    if (
      [".png", ".jpg", ".svg", ".ico", ".woff", ".ttf", ".eot"].includes(ext)
    ) {
      return false;
    }

    // Skip lockfiles
    if (
      filePath.includes("package-lock.json") ||
      filePath.includes("yarn.lock")
    ) {
      return false;
    }

    // Skip build directory contents
    if (filePath.startsWith("build/") || filePath.startsWith("dist/")) {
      return false;
    }

    return true;
  }

  /**
   * Update the progress of a streaming operation
   * @param {number} progress - Progress percentage (0-100)
   * @param {string} streamId - ID of the stream to update
   * @private
   */
  updateProgress(progress, streamId) {
    if (!streamId || !this.activeStreams.has(streamId)) return;

    this.state.progress = progress;

    const streamData = this.activeStreams.get(streamId);
    streamData.progress = progress;
    streamData.lastUpdate = Date.now();

    this.activeStreams.set(streamId, streamData);

    // Emit progress event
    this.emit("progress", {
      progress,
      streamId,
      timeSinceStart: Date.now() - streamData.startTime,
    });
  }

  /**
   * Update the status of a streaming operation
   * @param {string} streamId - ID of the stream to update
   * @param {string} status - New status
   * @param {number} progress - Progress percentage
   * @param {Object} data - Data to include
   * @private
   */
  updateStreamStatus(streamId, status, progress, data) {
    if (!streamId || !this.activeStreams.has(streamId)) return;

    const streamData = this.activeStreams.get(streamId);
    streamData.status = status;
    streamData.progress = progress;
    streamData.currentData = data;

    if (status === "completed" || status === "error") {
      streamData.endTime = Date.now();
    }

    this.activeStreams.set(streamId, streamData);

    // Emit appropriate event
    if (status === "completed") {
      this.emit("stream:complete", {
        streamId,
        type: streamData.type,
        data,
      });
    } else if (status === "error") {
      this.emit("stream:error", {
        streamId,
        type: streamData.type,
        error: data.error,
      });
    } else {
      this.emit("stream:update", {
        streamId,
        type: streamData.type,
        progress,
        data,
      });
    }
  }

  /**
   * Extract JSON from text response
   * @param {string} text - Text to extract JSON from
   * @returns {Object|null} Extracted JSON or null
   * @private
   */
  extractJSONFromText(text) {
    try {
      // First try direct parsing
      try {
        return JSON.parse(text);
      } catch (e) {
        // Look for code blocks
        const jsonPattern = /```(?:json)?\s*([\s\S]*?)```|(\{[\s\S]*\})/g;
        const jsonMatches = [...text.matchAll(jsonPattern)];

        if (jsonMatches.length > 0) {
          const jsonText = (jsonMatches[0][1] || jsonMatches[0][2]).trim();
          return JSON.parse(jsonText);
        }

        // Try to find any JSON object
        const objectPattern = /(\{[\s\S]*\})/;
        const objectMatch = text.match(objectPattern);

        if (objectMatch) {
          return JSON.parse(objectMatch[1]);
        }
      }
    } catch (error) {
      this.log(`JSON extraction error: ${error.message}`, "error");
    }

    return null;
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
    const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] CodeFixerModule: ${message}`;

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
      module: "CodeFixerModule",
    });
  }
}

export default CodeFixerModule;
