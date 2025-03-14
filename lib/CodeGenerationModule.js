// lib/CodeGenerationModule.js
import { EventEmitter } from "./EventEmitter";
import axios from "axios";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { promisify } from "util";
import { exec } from "child_process";

// Promisify functions
const execAsync = promisify(exec);

/**
 * CodeGenerationModule - Generates production-ready code with streaming feedback.
 * Handles file creation, dependency management, and app previews automatically.
 */
class CodeGenerationModule extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      apiKey: process.env.ANTHROPIC_API_KEY || "",
      model: "claude-3-5-sonnet-20240620",
      maxTokens: 4096,
      temperature: 0.2,
      projectRoot: process.cwd(),
      outputDir: "./output/generated-code",
      installDependencies: true,
      previewEnabled: true,
      previewPort: 3000,
      previewHost: "localhost",
      streamingEnabled: true,
      ...config,
    };

    // State management
    this.codebase = {
      files: new Map(),
      dependencies: new Set(),
      devDependencies: new Set(),
      framework: config.framework || "next",
      structure: {},
      entryPoints: [],
      generatedAt: null,
    };
    this.activeStreams = new Map();
    this.metadata = {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "initialized",
      fileCount: 0,
    };

    this.log("CodeGenerationModule initialized", "info");
  }

  /** Log messages with timestamp and level */
  log(message, level = "info") {
    const timestamp = new Date().toISOString();
    console[level === "error" ? "error" : "log"](
      `[${timestamp}] [${level.toUpperCase()}] ${message}`
    );
    this.emit("log", { timestamp, level, message });
  }

  /** Generate project structure with streaming */
  async generateProjectStructure(requirements, design, options = {}) {
    const streamId = crypto.randomUUID();
    this.log("Generating project structure", "info");
    this.emit("structure:start", { streamId });

    try {
      this.activeStreams.set(streamId, {
        status: "processing",
        type: "project_structure",
        progress: 0,
        startTime: Date.now(),
      });
      const prompt = `Generate a JSON project structure for a ${this.config.framework} app based on:\nRequirements: ${JSON.stringify(requirements)}\nDesign: ${JSON.stringify(design || {})}`;
      const structure = await this.streamClaudeRequest(
        prompt,
        streamId,
        "project_structure"
      );

      this.codebase.structure = structure;
      this.codebase.dependencies = new Set(structure.dependencies || []);
      this.codebase.devDependencies = new Set(structure.devDependencies || []);
      this.codebase.entryPoints = structure.entryPoints || [];
      this.metadata.status = "structure_generated";

      this.activeStreams.set(streamId, {
        status: "completed",
        progress: 100,
        endTime: Date.now(),
      });
      this.emit("structure:complete", { structure, streamId });
      this.log("Project structure generated", "info");
      return structure;
    } catch (error) {
      this.handleError("project_structure", error, streamId);
      throw error;
    }
  }

  /** Generate a file with line-by-line streaming */
  async generateFile(filePath, fileInfo, requirements, options = {}) {
    const streamId = crypto.randomUUID();
    this.log(`Generating file: ${filePath}`, "info");
    this.emit("file:start", { filePath, streamId });

    try {
      this.activeStreams.set(streamId, {
        status: "processing",
        type: "file_generation",
        filePath,
        progress: 0,
        startTime: Date.now(),
      });
      const prompt = `Generate production-ready code for ${filePath}\nPurpose: ${fileInfo.purpose}\nRequirements: ${JSON.stringify(requirements)}`;
      const content = await this.streamClaudeFileGeneration(
        prompt,
        filePath,
        streamId
      );

      this.codebase.files.set(filePath, content);
      this.metadata.fileCount = this.codebase.files.size;
      this.metadata.updatedAt = new Date().toISOString();

      this.activeStreams.set(streamId, {
        status: "completed",
        progress: 100,
        endTime: Date.now(),
      });
      this.emit("file:complete", { filePath, content, streamId });
      this.log(`File generated: ${filePath}`, "info");
      return { filePath, content };
    } catch (error) {
      this.handleError("file_generation", error, streamId, filePath);
      throw error;
    }
  }

  /** Stream file content line-by-line */
  async streamClaudeFileGeneration(promptContent, filePath, streamId) {
    return new Promise((resolve, reject) => {
      let inCodeBlock = false;
      let codeLines = [];
      let partialLine = "";

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 180000);

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
            const text = chunk.toString();
            if (!inCodeBlock && text.includes("```")) {
              inCodeBlock = true;
              const start = text.indexOf("```") + 3;
              const newline = text.indexOf("\n", start);
              partialLine =
                newline !== -1
                  ? text.substring(newline + 1)
                  : text.substring(start);
            } else if (inCodeBlock) {
              partialLine += text;
              const lines = partialLine.split("\n");
              if (lines.length > 1) {
                codeLines.push(...lines.slice(0, -1));
                partialLine = lines[lines.length - 1];
                const currentContent = codeLines.join("\n");
                const progress = Math.min(90, (codeLines.length / 50) * 100); // Estimate based on 50 lines
                this.updateStreamContent(streamId, "file_generation", {
                  filePath,
                  content: currentContent,
                  progress,
                });
              }
              if (partialLine.includes("```")) {
                inCodeBlock = false;
                const end = partialLine.indexOf("```");
                if (end > 0) codeLines.push(partialLine.substring(0, end));
                const finalContent = codeLines.join("\n");
                this.updateStreamContent(streamId, "file_generation", {
                  filePath,
                  content: finalContent,
                  progress: 100,
                });
                resolve(finalContent);
              }
            }
          });

          response.data.on("end", () => {
            clearTimeout(timeout);
            if (partialLine.trim()) codeLines.push(partialLine);
            const finalContent = codeLines.join("\n");
            resolve(finalContent);
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

  /** Generate the entire project */
  async generateProject(requirements, options = {}) {
    const streamId = crypto.randomUUID();
    this.log("Starting project generation", "info");
    this.emit("project:start", { streamId });

    try {
      this.activeStreams.set(streamId, {
        status: "processing",
        type: "project_generation",
        progress: 0,
        startTime: Date.now(),
      });

      // Generate structure if not present
      if (!this.codebase.structure) {
        await this.generateProjectStructure(requirements, options.design);
      }

      const files = this.codebase.structure.files || [];
      let filesGenerated = 0;

      for (const fileInfo of files) {
        const result = await this.generateFile(
          fileInfo.path,
          fileInfo,
          requirements
        );
        filesGenerated++;
        const progress = Math.round((filesGenerated / files.length) * 100);
        this.updateStreamContent(streamId, "project_generation", {
          filesGenerated,
          totalFiles: files.length,
          currentFile: result.filePath,
          progress,
        });

        // Save file to filesystem as it's created
        await this.saveFileToDisk(result.filePath, result.content);

        // Periodic preview every 5 files
        if (this.config.previewEnabled && filesGenerated % 5 === 0) {
          await this.startPreviewServer();
        }
      }

      // Finalize project
      await this.installDependencies();
      if (this.config.previewEnabled) await this.startPreviewServer();

      this.codebase.generatedAt = new Date().toISOString();
      this.metadata.status = "project_generated";

      this.activeStreams.set(streamId, {
        status: "completed",
        progress: 100,
        endTime: Date.now(),
      });
      this.emit("project:complete", { fileCount: filesGenerated, streamId });
      this.log("Project generation completed", "info");

      return { filesGenerated, manifest: this.createManifest() };
    } catch (error) {
      this.handleError("project_generation", error, streamId);
      throw error;
    }
  }

  /** Save a single file to disk with streaming feedback */
  async saveFileToDisk(filePath, content) {
    const fullPath = path.join(this.config.outputDir, filePath);
    try {
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, content, "utf8");
      this.emit("file:saved", { filePath, fullPath });
      this.log(`File saved: ${fullPath}`, "info");
    } catch (error) {
      this.log(`Failed to save ${filePath}: ${error.message}`, "error");
      throw new Error(`File save failed: ${error.message}`);
    }
  }

  /** Install dependencies automatically */
  async installDependencies() {
    this.log("Installing dependencies", "info");
    this.emit("dependencies:start");

    try {
      const projectDir = this.config.outputDir;
      await fs.mkdir(projectDir, { recursive: true });

      const packageJson = {
        name: path.basename(projectDir),
        version: "1.0.0",
        dependencies: Object.fromEntries(
          [...this.codebase.dependencies].map((dep) => [dep, "*"])
        ),
        devDependencies: Object.fromEntries(
          [...this.codebase.devDependencies].map((dep) => [dep, "*"])
        ),
        scripts: { start: "node index.js" }, // Adjust based on framework
      };
      await fs.writeFile(
        path.join(projectDir, "package.json"),
        JSON.stringify(packageJson, null, 2)
      );

      await execAsync("npm install", { cwd: projectDir });
      this.emit("dependencies:complete");
      this.log("Dependencies installed", "info");
    } catch (error) {
      this.log(`Dependency installation failed: ${error.message}`, "error");
      throw error;
    }
  }

  /** Start preview server */
  async startPreviewServer() {
    const { previewPort, previewHost, outputDir } = this.config;
    this.log(`Starting preview at ${previewHost}:${previewPort}`, "info");
    this.emit("preview:start");

    try {
      const cmd = `npx serve -s ${outputDir} -l ${previewPort}`;
      await execAsync(cmd, { cwd: outputDir, detached: true, stdio: "ignore" });
      const url = `http://${previewHost}:${previewPort}`;
      this.emit("preview:ready", { url });
      this.log(`Preview ready at ${url}`, "info");
      return url;
    } catch (error) {
      this.log(`Preview failed: ${error.message}`, "error");
      throw error;
    }
  }

  /** Update streaming content */
  updateStreamContent(streamId, type, content) {
    const streamData = this.activeStreams.get(streamId) || {};
    streamData.currentData = content;
    streamData.progress = content.progress || streamData.progress + 5;
    this.activeStreams.set(streamId, streamData);
    this.emit("stream:update", {
      streamId,
      type,
      content,
      progress: streamData.progress,
    });
  }

  /** Handle errors gracefully */
  handleError(phase, error, streamId, filePath) {
    this.metadata.lastError = {
      phase,
      message: error.message,
      timestamp: new Date().toISOString(),
    };
    this.log(`${phase} failed: ${error.message}`, "error");
    this.activeStreams.set(streamId, {
      status: "error",
      error: error.message,
      endTime: Date.now(),
    });
    this.emit("stream:error", {
      streamId,
      type: phase,
      error: error.message,
      filePath,
    });
  }

  /** Create project manifest */
  createManifest() {
    return {
      framework: this.config.framework,
      files: Array.from(this.codebase.files.keys()),
      dependencies: Array.from(this.codebase.dependencies),
      devDependencies: Array.from(this.codebase.devDependencies),
      generatedAt: this.codebase.generatedAt,
    };
  }

  /** Generic streaming request handler (for structure generation) */
  async streamClaudeRequest(prompt, streamId, type) {
    return new Promise((resolve, reject) => {
      let accumulatedText = "";
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 180000);

      axios
        .post(
          "https://api.anthropic.com/v1/messages",
          {
            model: this.config.model,
            max_tokens: this.config.maxTokens,
            messages: [{ role: "user", content: prompt }],
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
            accumulatedText += chunk.toString();
            const json = this.extractJSONFromText(accumulatedText);
            if (json) {
              this.updateStreamContent(streamId, type, {
                structure: json,
                progress: 50,
              });
              resolve(json);
            }
          });

          response.data.on("end", () => {
            clearTimeout(timeout);
            const json = this.extractJSONFromText(accumulatedText);
            resolve(json || {});
          });

          response.data.on("error", (err) => reject(err));
        })
        .catch((error) => {
          clearTimeout(timeout);
          reject(error);
        });
    });
  }

  /** Extract JSON from text */
  extractJSONFromText(text) {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  }
}

export default CodeGenerationModule;
