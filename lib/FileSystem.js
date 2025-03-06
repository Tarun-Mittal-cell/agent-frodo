/**
 * FileSystem.js
 * Provides a standardized interface for file system operations.
 * Abstracts away the differences between different environments.
 */

const fs = require("fs");
const path = require("path");
const util = require("util");

class FileSystem {
  constructor(config = {}) {
    this.logger = config.logger || console;
    
    // Normalize base directory path
    this.baseDir = path.resolve(config.baseDir || process.cwd());
    this.logger.info(`FileSystem initialized with base directory: ${this.baseDir}`);
    
    this.safeMode = config.safeMode !== false;
    this.allowedExtensions = config.allowedExtensions || null;
    this.disallowedExtensions = config.disallowedExtensions || [
      ".exe",
      ".bin",
      ".sh",
      ".bat",
      ".cmd",
      ".com",
      ".dll",
      ".so",
      ".dylib",
    ];
    this.maxFileSize = config.maxFileSize || 100 * 1024 * 1024; // 100MB
    
    // Create base directory if it doesn't exist
    if (!fs.existsSync(this.baseDir)) {
      try {
        fs.mkdirSync(this.baseDir, { recursive: true });
        this.logger.info(`Created base directory: ${this.baseDir}`);
      } catch (error) {
        this.logger.error(`Failed to create base directory: ${error.message}`);
        throw new Error(`Failed to create base directory: ${error.message}`);
      }
    }

    // Promisify fs functions
    this.readFileAsync = util.promisify(fs.readFile);
    this.writeFileAsync = util.promisify(fs.writeFile);
    this.appendFileAsync = util.promisify(fs.appendFile);
    this.mkdirAsync = util.promisify(fs.mkdir);
    this.statAsync = util.promisify(fs.stat);
    this.unlinkAsync = util.promisify(fs.unlink);
    this.readdirAsync = util.promisify(fs.readdir);
    this.rmdirAsync = util.promisify(fs.rmdir);
    this.copyFileAsync = util.promisify(fs.copyFile);
  }

  /**
   * Resolve a file path relative to the base directory
   * @param {string} filePath - File path
   * @returns {string} - Resolved path
   * @private
   */
  _resolvePath(filePath) {
    // Normalize the input path to handle any potential issues
    const normalizedPath = path.normalize(filePath);
    
    // Handle path edge cases
    if (!normalizedPath || normalizedPath === '.' || normalizedPath === './') {
      return this.baseDir;
    }
    
    // If path is absolute, check if it's allowed
    if (path.isAbsolute(normalizedPath)) {
      if (this.safeMode) {
        // In safe mode, only allow absolute paths that are within the base directory
        const absolutePath = path.resolve(normalizedPath);
        if (!absolutePath.startsWith(this.baseDir)) {
          throw new Error(`Absolute path outside base directory is not allowed: ${filePath}`);
        }
        return absolutePath;
      }
      return path.resolve(normalizedPath);
    }

    // Resolve path relative to base directory
    const resolvedPath = path.resolve(this.baseDir, normalizedPath);
    
    // Log path resolution for debugging
    this.logger.debug && this.logger.debug(`Path resolved: ${filePath} -> ${resolvedPath}`);
    
    return resolvedPath;
  }

  /**
   * Validate a file path for security
   * @param {string} filePath - File path
   * @param {string} operation - Operation type
   * @returns {boolean} - True if valid
   * @private
   */
  _validatePath(filePath, operation = "read") {
    const resolvedPath = this._resolvePath(filePath);

    // Check for directory traversal
    if (this.safeMode && !resolvedPath.startsWith(this.baseDir)) {
      throw new Error(
        "Path traversal outside of base directory is not allowed"
      );
    }

    // Check file extension for write operations
    if (operation === "write") {
      const extension = path.extname(resolvedPath).toLowerCase();

      // Check allowed extensions
      if (
        this.allowedExtensions &&
        !this.allowedExtensions.includes(extension)
      ) {
        throw new Error(
          `File extension ${extension} is not in the allowed list`
        );
      }

      // Check disallowed extensions
      if (
        this.disallowedExtensions &&
        this.disallowedExtensions.includes(extension)
      ) {
        throw new Error(
          `File extension ${extension} is disallowed for security reasons`
        );
      }
    }

    return true;
  }

  /**
   * Create directory if it doesn't exist
   * @param {string} dirPath - Directory path
   * @private
   */
  async _ensureDir(dirPath) {
    try {
      await this.statAsync(dirPath);
    } catch (error) {
      // Directory doesn't exist, create it
      if (error.code === "ENOENT") {
        // Recursively create parent directories
        await this.mkdirAsync(dirPath, { recursive: true });
      } else {
        throw error;
      }
    }
  }

  /**
   * Read a file
   * @param {string} filePath - File path
   * @param {Object} options - Options
   * @returns {Buffer|string} - File content
   */
  async readFile(filePath, options = {}) {
    this._validatePath(filePath, "read");
    const resolvedPath = this._resolvePath(filePath);

    try {
      // Check file size first if requested
      if (options.checkSize !== false) {
        const stats = await this.statAsync(resolvedPath);
        if (stats.size > this.maxFileSize) {
          throw new Error(
            `File size (${stats.size} bytes) exceeds maximum allowed size (${this.maxFileSize} bytes)`
          );
        }
      }

      // Read file
      return await this.readFileAsync(resolvedPath, options);
    } catch (error) {
      this.logger.error(`Error reading file ${filePath}:`, error.message);
      throw new Error(`Failed to read file ${filePath}: ${error.message}`);
    }
  }

  /**
   * Write a file
   * @param {string} filePath - File path
   * @param {string|Buffer} data - File content
   * @param {Object} options - Options
   * @returns {boolean} - True if successful
   */
  async writeFile(filePath, data, options = {}) {
    this._validatePath(filePath, "write");
    const resolvedPath = this._resolvePath(filePath);

    try {
      // Ensure directory exists
      await this._ensureDir(path.dirname(resolvedPath));

      // Write file
      await this.writeFileAsync(resolvedPath, data, options);
      this.logger.info(`File written: ${filePath}`);
      return true;
    } catch (error) {
      this.logger.error(`Error writing file ${filePath}:`, error.message);
      throw new Error(`Failed to write file ${filePath}: ${error.message}`);
    }
  }

  /**
   * Append to a file
   * @param {string} filePath - File path
   * @param {string|Buffer} data - Data to append
   * @param {Object} options - Options
   * @returns {boolean} - True if successful
   */
  async appendFile(filePath, data, options = {}) {
    this._validatePath(filePath, "write");
    const resolvedPath = this._resolvePath(filePath);

    try {
      // Ensure directory exists
      await this._ensureDir(path.dirname(resolvedPath));

      // Append to file
      await this.appendFileAsync(resolvedPath, data, options);
      this.logger.info(`Data appended to file: ${filePath}`);
      return true;
    } catch (error) {
      this.logger.error(`Error appending to file ${filePath}:`, error.message);
      throw new Error(`Failed to append to file ${filePath}: ${error.message}`);
    }
  }

  /**
   * Delete a file
   * @param {string} filePath - File path
   * @returns {boolean} - True if successful
   */
  async deleteFile(filePath) {
    this._validatePath(filePath, "delete");
    const resolvedPath = this._resolvePath(filePath);

    try {
      await this.unlinkAsync(resolvedPath);
      this.logger.info(`File deleted: ${filePath}`);
      return true;
    } catch (error) {
      this.logger.error(`Error deleting file ${filePath}:`, error.message);
      throw new Error(`Failed to delete file ${filePath}: ${error.message}`);
    }
  }

  /**
   * List files in a directory
   * @param {string} dirPath - Directory path
   * @param {Object} options - Options
   * @returns {Array} - Array of file paths
   */
  async listFiles(dirPath = ".", options = {}) {
    this._validatePath(dirPath, "read");
    const resolvedPath = this._resolvePath(dirPath);

    try {
      const entries = await this.readdirAsync(resolvedPath, {
        withFileTypes: true,
      });
      let results = [];

      // Process entries
      for (const entry of entries) {
        const entryPath = path.join(dirPath, entry.name);

        if (entry.isDirectory() && options.recursive) {
          // Recursively list files in subdirectory
          const subEntries = await this.listFiles(entryPath, options);
          results = results.concat(subEntries);
        } else {
          results.push(entryPath);
        }
      }

      return results;
    } catch (error) {
      this.logger.error(`Error listing files in ${dirPath}:`, error.message);
      throw new Error(`Failed to list files in ${dirPath}: ${error.message}`);
    }
  }

  /**
   * Create a directory
   * @param {string} dirPath - Directory path
   * @param {Object} options - Options
   * @returns {boolean} - True if successful
   */
  async createDirectory(dirPath, options = {}) {
    this._validatePath(dirPath, "write");
    const resolvedPath = this._resolvePath(dirPath);

    try {
      await this.mkdirAsync(resolvedPath, {
        recursive: options.recursive !== false,
      });
      this.logger.info(`Directory created: ${dirPath}`);
      return true;
    } catch (error) {
      this.logger.error(`Error creating directory ${dirPath}:`, error.message);
      throw new Error(
        `Failed to create directory ${dirPath}: ${error.message}`
      );
    }
  }

  /**
   * Delete a directory
   * @param {string} dirPath - Directory path
   * @param {Object} options - Options
   * @returns {boolean} - True if successful
   */
  async deleteDirectory(dirPath, options = {}) {
    this._validatePath(dirPath, "delete");
    const resolvedPath = this._resolvePath(dirPath);

    try {
      if (options.recursive) {
        // For Node.js versions that support recursive removal
        if (fs.rmdir && fs.rmdir.length >= 3) {
          await this.rmdirAsync(resolvedPath, { recursive: true });
        } else {
          // Manual recursive deletion
          await this._recursiveDelete(resolvedPath);
        }
      } else {
        await this.rmdirAsync(resolvedPath);
      }

      this.logger.info(`Directory deleted: ${dirPath}`);
      return true;
    } catch (error) {
      this.logger.error(`Error deleting directory ${dirPath}:`, error.message);
      throw new Error(
        `Failed to delete directory ${dirPath}: ${error.message}`
      );
    }
  }

  /**
   * Recursively delete a directory
   * @param {string} dirPath - Directory path
   * @private
   */
  async _recursiveDelete(dirPath) {
    const entries = await this.readdirAsync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        await this._recursiveDelete(fullPath);
      } else {
        await this.unlinkAsync(fullPath);
      }
    }

    await this.rmdirAsync(dirPath);
  }

  /**
   * Copy a file
   * @param {string} sourcePath - Source file path
   * @param {string} destPath - Destination file path
   * @param {Object} options - Options
   * @returns {boolean} - True if successful
   */
  async copyFile(sourcePath, destPath, options = {}) {
    this._validatePath(sourcePath, "read");
    this._validatePath(destPath, "write");

    const resolvedSourcePath = this._resolvePath(sourcePath);
    const resolvedDestPath = this._resolvePath(destPath);

    try {
      // Ensure destination directory exists
      await this._ensureDir(path.dirname(resolvedDestPath));

      // Copy file
      await this.copyFileAsync(resolvedSourcePath, resolvedDestPath);
      this.logger.info(`File copied from ${sourcePath} to ${destPath}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Error copying file from ${sourcePath} to ${destPath}:`,
        error.message
      );
      throw new Error(`Failed to copy file: ${error.message}`);
    }
  }

  /**
   * Rename a file or directory
   * @param {string} oldPath - Old path
   * @param {string} newPath - New path
   * @returns {boolean} - True if successful
   */
  async rename(oldPath, newPath) {
    this._validatePath(oldPath, "read");
    this._validatePath(newPath, "write");

    const resolvedOldPath = this._resolvePath(oldPath);
    const resolvedNewPath = this._resolvePath(newPath);

    try {
      // Ensure destination directory exists
      await this._ensureDir(path.dirname(resolvedNewPath));

      // Rename
      await util.promisify(fs.rename)(resolvedOldPath, resolvedNewPath);
      this.logger.info(`Renamed ${oldPath} to ${newPath}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Error renaming ${oldPath} to ${newPath}:`,
        error.message
      );
      throw new Error(`Failed to rename: ${error.message}`);
    }
  }

  /**
   * Get file or directory stats
   * @param {string} filePath - File path
   * @returns {Object} - File stats
   */
  async stat(filePath) {
    this._validatePath(filePath, "read");
    const resolvedPath = this._resolvePath(filePath);

    try {
      const stats = await this.statAsync(resolvedPath);
      return {
        size: stats.size,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
        created: stats.birthtime,
        modified: stats.mtime,
        accessed: stats.atime,
      };
    } catch (error) {
      this.logger.error(`Error getting stats for ${filePath}:`, error.message);
      throw new Error(`Failed to get stats for ${filePath}: ${error.message}`);
    }
  }

  /**
   * Check if a file or directory exists
   * @param {string} filePath - File path
   * @returns {boolean} - True if exists
   */
  async exists(filePath) {
    try {
      this._validatePath(filePath, "read");
      const resolvedPath = this._resolvePath(filePath);
      await this.statAsync(resolvedPath);
      return true;
    } catch (error) {
      if (error.code === "ENOENT") {
        return false;
      }
      throw error;
    }
  }

  /**
   * Read JSON file
   * @param {string} filePath - File path
   * @returns {Object} - Parsed JSON
   */
  async readJson(filePath) {
    const content = await this.readFile(filePath, { encoding: "utf8" });
    try {
      return JSON.parse(content);
    } catch (error) {
      this.logger.error(`Error parsing JSON from ${filePath}:`, error.message);
      throw new Error(
        `Failed to parse JSON from ${filePath}: ${error.message}`
      );
    }
  }

  /**
   * Write JSON file
   * @param {string} filePath - File path
   * @param {Object} data - Data to write
   * @param {Object} options - Options
   * @returns {boolean} - True if successful
   */
  async writeJson(filePath, data, options = {}) {
    const jsonString = JSON.stringify(data, null, options.space || 2);
    return await this.writeFile(filePath, jsonString, { encoding: "utf8" });
  }

  /**
   * Read a text file line by line
   * @param {string} filePath - File path
   * @returns {Array} - Array of lines
   */
  async readLines(filePath) {
    const content = await this.readFile(filePath, { encoding: "utf8" });
    return content.split(/\r?\n/);
  }

  /**
   * Write lines to a text file
   * @param {string} filePath - File path
   * @param {Array} lines - Array of lines
   * @returns {boolean} - True if successful
   */
  async writeLines(filePath, lines) {
    const content = lines.join(require("os").EOL);
    return await this.writeFile(filePath, content, { encoding: "utf8" });
  }
}

module.exports = FileSystem;
