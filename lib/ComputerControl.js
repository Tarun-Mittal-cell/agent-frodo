/**
 * ComputerControl.js
 * Provides interface for OS-level operations and computer control.
 * Allows interaction with the operating system, desktop environment, and applications.
 */

const { exec, spawn } = require("child_process");
const { promisify } = require("util");
const fs = require("fs");
const path = require("path");
const os = require("os");

// Optional dependencies (installed separately)
let robotjs = null;
let screenshot = null;

// Try to load optional dependencies
try {
  robotjs = require("robotjs");
} catch (e) {
  // RobotJS not available
}

try {
  screenshot = require("screenshot-desktop");
} catch (e) {
  // screenshot-desktop not available
}

class ComputerControl {
  constructor(config = {}) {
    this.logger = config.logger || console;
    this.safeMode = config.safeMode !== false;
    this.allowedCommands = config.allowedCommands || [];
    this.disallowedCommands = config.disallowedCommands || [
      "rm",
      "del",
      "format",
      "mkfs",
      "dd",
      "sudo",
      "su",
      "shutdown",
      "reboot",
      "halt",
      "poweroff",
      "init",
      "taskkill",
      "rd",
    ];
    this.timeout = config.timeout || 30000; // 30 seconds
    this.maxBuffer = config.maxBuffer || 1024 * 1024; // 1MB
    this.screenshotDir = config.screenshotDir || os.tmpdir();

    // Check capabilities
    this.hasRobot = !!robotjs;
    this.hasScreenshot = !!screenshot;

    this.execAsync = promisify(exec);
  }

  /**
   * Execute a shell command
   * @param {string} command - Command to execute
   * @param {Object} options - Options
   * @returns {Object} - Command result
   */
  async executeCommand(command, options = {}) {
    if (this.safeMode) {
      // Validate command in safe mode
      this._validateCommand(command);
    }

    this.logger.info(`Executing command: ${command}`);

    const execOptions = {
      timeout: options.timeout || this.timeout,
      maxBuffer: options.maxBuffer || this.maxBuffer,
      windowsHide: true,
      ...options,
    };

    try {
      const { stdout, stderr } = await this.execAsync(command, execOptions);

      return {
        success: true,
        stdout: stdout.toString(),
        stderr: stderr.toString(),
        command,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Command execution failed: ${command}`, error.message);

      return {
        success: false,
        error: error.message,
        stdout: error.stdout ? error.stdout.toString() : "",
        stderr: error.stderr ? error.stderr.toString() : "",
        code: error.code,
        signal: error.signal,
        command,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Execute a long-running command with streaming output
   * @param {string} command - Command to execute
   * @param {Object} options - Options
   * @returns {Object} - Process object with output streams
   */
  executeStreamingCommand(command, options = {}) {
    if (this.safeMode) {
      // Validate command in safe mode
      this._validateCommand(command);
    }

    this.logger.info(`Executing streaming command: ${command}`);

    // Split command into parts
    const parts = command.split(/\s+/);
    const cmd = parts[0];
    const args = parts.slice(1);

    // Set default options
    const spawnOptions = {
      shell: true,
      windowsHide: true,
      ...options,
    };

    // Spawn process
    const process = spawn(cmd, args, spawnOptions);
    const output = { stdout: "", stderr: "" };

    // Collect output
    process.stdout.on("data", (data) => {
      const chunk = data.toString();
      output.stdout += chunk;

      if (options.onStdout) {
        options.onStdout(chunk);
      }
    });

    process.stderr.on("data", (data) => {
      const chunk = data.toString();
      output.stderr += chunk;

      if (options.onStderr) {
        options.onStderr(chunk);
      }
    });

    // Handle process completion
    process.on("close", (code, signal) => {
      output.code = code;
      output.signal = signal;
      output.completed = true;

      if (options.onComplete) {
        options.onComplete(output);
      }
    });

    // Handle process error
    process.on("error", (error) => {
      output.error = error.message;

      if (options.onError) {
        options.onError(error);
      }
    });

    return {
      process,
      output,
      kill: () => process.kill(),
    };
  }

  /**
   * Take a screenshot
   * @param {Object} options - Screenshot options
   * @returns {Buffer|string} - Screenshot data or path
   */
  async takeScreenshot(options = {}) {
    this.logger.info("Taking screenshot");

    // Check if we have screenshot capability
    if (!this.hasScreenshot && !this.hasRobot) {
      throw new Error(
        'Screenshot capability is not available. Please install "screenshot-desktop" or "robotjs" package.'
      );
    }

    try {
      let screenshotData;

      if (this.hasScreenshot) {
        // Use screenshot-desktop
        screenshotData = await screenshot({
          format: options.format || "png",
          ...(options.screen !== undefined ? { screen: options.screen } : {}),
        });
      } else if (this.hasRobot) {
        // Use RobotJS
        const { width, height } = robotjs.getScreenSize();
        const x = options.region?.x || 0;
        const y = options.region?.y || 0;
        const w = options.region?.width || width;
        const h = options.region?.height || height;

        // Capture screenshot
        const bitmap = robotjs.screen.capture(x, y, w, h);

        // Convert to PNG
        // Note: This is a simplified implementation and might not work perfectly
        const PNG = require("pngjs").PNG;
        const png = new PNG({ width: bitmap.width, height: bitmap.height });

        for (let y = 0; y < bitmap.height; y++) {
          for (let x = 0; x < bitmap.width; x++) {
            const idx = (y * bitmap.width + x) * 4;
            const bitmapIdx = y * bitmap.byteWidth + x * bitmap.bytesPerPixel;

            png.data[idx] = bitmap.image[bitmapIdx + 2]; // R
            png.data[idx + 1] = bitmap.image[bitmapIdx + 1]; // G
            png.data[idx + 2] = bitmap.image[bitmapIdx]; // B
            png.data[idx + 3] = 255; // Alpha
          }
        }

        screenshotData = PNG.sync.write(png);
      }

      // Save to file if requested
      if (options.saveToFile) {
        const filename = options.filename || `screenshot-${Date.now()}.png`;
        const filepath = path.join(this.screenshotDir, filename);

        await fs.promises.writeFile(filepath, screenshotData);

        if (options.returnPath) {
          return filepath;
        }
      }

      return screenshotData;
    } catch (error) {
      this.logger.error("Screenshot failed:", error.message);
      throw new Error(`Failed to take screenshot: ${error.message}`);
    }
  }

  /**
   * Send keyboard or mouse input
   * @param {string} inputType - Type of input (keyboard, mouse)
   * @param {string|Object} inputValue - Input value
   * @param {Object} options - Input options
   * @returns {boolean} - True if successful
   */
  async sendInput(inputType, inputValue, options = {}) {
    if (!this.hasRobot) {
      throw new Error('Input simulation requires the "robotjs" package.');
    }

    this.logger.info(
      `Sending ${inputType} input: ${JSON.stringify(inputValue)}`
    );

    try {
      switch (inputType.toLowerCase()) {
        case "keyboard":
        case "key":
          await this._sendKeyboardInput(inputValue, options);
          break;

        case "mouse":
          await this._sendMouseInput(inputValue, options);
          break;

        case "text":
        case "type":
          await this._typeText(inputValue, options);
          break;

        default:
          throw new Error(`Unsupported input type: ${inputType}`);
      }

      return true;
    } catch (error) {
      this.logger.error(`Input simulation failed: ${error.message}`);
      throw new Error(`Input simulation failed: ${error.message}`);
    }
  }

  /**
   * Control applications (launch, close, focus)
   * @param {string} action - Action to perform
   * @param {string} appName - Application name
   * @param {Object} options - Options
   * @returns {Object} - Action result
   */
  async controlApp(action, appName, options = {}) {
    this.logger.info(`Controlling app ${appName} with action: ${action}`);

    let command = "";
    let platform = os.platform();

    try {
      switch (action.toLowerCase()) {
        case "launch":
        case "start":
          command = this._getAppLaunchCommand(appName, platform, options);
          break;

        case "close":
        case "kill":
          command = this._getAppKillCommand(appName, platform, options);
          break;

        case "focus":
          return await this._focusApp(appName, options);

        default:
          throw new Error(`Unsupported app action: ${action}`);
      }

      // Execute the command
      return await this.executeCommand(command, options);
    } catch (error) {
      this.logger.error(`App control failed: ${error.message}`);
      throw new Error(`App control failed: ${error.message}`);
    }
  }

  /**
   * Get system information
   * @returns {Object} - System information
   */
  async getSystemInfo() {
    this.logger.info("Getting system information");

    try {
      const platform = os.platform();
      const arch = os.arch();
      const hostname = os.hostname();
      const userInfo = os.userInfo();
      const cpus = os.cpus();
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const uptime = os.uptime();
      const loadAvg = os.loadavg();

      // Get additional system info using commands
      let diskSpace = null;
      let processes = null;

      if (platform === "win32") {
        const diskResult = await this.executeCommand(
          "wmic logicaldisk get deviceid, freespace, size"
        );
        const processResult = await this.executeCommand("tasklist /fo csv");

        diskSpace = diskResult.stdout;
        processes = processResult.stdout;
      } else {
        const diskResult = await this.executeCommand("df -h");
        const processResult = await this.executeCommand("ps aux");

        diskSpace = diskResult.stdout;
        processes = processResult.stdout;
      }

      return {
        platform,
        arch,
        hostname,
        user: userInfo.username,
        cpus: cpus.length,
        cpuModel: cpus[0].model,
        totalMemory: totalMem,
        freeMemory: freeMem,
        uptime,
        loadAverage: loadAvg,
        diskSpace,
        processes,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error("Failed to get system info:", error.message);
      throw new Error(`Failed to get system info: ${error.message}`);
    }
  }

  /**
   * Validate a command for safety
   * @param {string} command - Command to validate
   * @private
   */
  _validateCommand(command) {
    // Split command to get the base command
    const parts = command.split(/\s+/);
    const baseCommand = parts[0].toLowerCase();

    // Check allowed commands
    if (
      this.allowedCommands.length > 0 &&
      !this.allowedCommands.includes(baseCommand)
    ) {
      throw new Error(`Command "${baseCommand}" is not in the allowed list`);
    }

    // Check disallowed commands
    if (this.disallowedCommands.includes(baseCommand)) {
      throw new Error(
        `Command "${baseCommand}" is disallowed for security reasons`
      );
    }

    // Check for potentially dangerous patterns
    const dangerousPatterns = [
      /rm\s+(-rf?|--recursive)/i, // rm -rf
      /del\s+\/[aqsf]/i, // del /q
      /format\s+[a-z]:/i, // format c:
      /:(){:|\|:};/, // Fork bomb
      /dd\s+if/i, // dd if=
      />\s*\/dev\/(null|zero|random)/i, // > /dev/null
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(command)) {
        throw new Error("Command contains potentially dangerous patterns");
      }
    }

    return true;
  }

  /**
   * Send keyboard input
   * @param {string|Array} keys - Keys to press
   * @param {Object} options - Options
   * @private
   */
  async _sendKeyboardInput(keys, options = {}) {
    // Convert string to array if needed
    const keySequence = Array.isArray(keys) ? keys : [keys];

    for (const key of keySequence) {
      // Check if it's a combination (e.g., "control+c")
      if (key.includes("+")) {
        const keyParts = key.split("+");
        const modifiers = keyParts.slice(0, -1);
        const mainKey = keyParts[keyParts.length - 1];

        // Press modifiers
        for (const modifier of modifiers) {
          robotjs.keyToggle(modifier, "down");
        }

        // Press and release main key
        robotjs.keyTap(mainKey);

        // Release modifiers
        for (const modifier of modifiers) {
          robotjs.keyToggle(modifier, "up");
        }
      } else {
        // Simple key press
        robotjs.keyTap(key);
      }

      // Add delay if specified
      if (options.delay) {
        await new Promise((resolve) => setTimeout(resolve, options.delay));
      }
    }
  }

  /**
   * Send mouse input
   * @param {Object} mouseAction - Mouse action
   * @param {Object} options - Options
   * @private
   */
  async _sendMouseInput(mouseAction, options = {}) {
    const { action, x, y, button, double, scroll } = mouseAction;

    switch (action) {
      case "move":
        robotjs.moveMouse(x, y);
        break;

      case "click":
        if (x !== undefined && y !== undefined) {
          robotjs.moveMouse(x, y);
        }

        const mouseButton = button || "left";

        if (double) {
          robotjs.mouseClick(mouseButton, true);
        } else {
          robotjs.mouseClick(mouseButton, false);
        }
        break;

      case "rightClick":
        if (x !== undefined && y !== undefined) {
          robotjs.moveMouse(x, y);
        }
        robotjs.mouseClick("right");
        break;

      case "drag":
        const { toX, toY } = mouseAction;
        robotjs.moveMouse(x, y);
        robotjs.mouseToggle("down", button || "left");

        // Gradual dragging for smoother operation
        const steps = options.dragSteps || 10;
        const dx = (toX - x) / steps;
        const dy = (toY - y) / steps;

        for (let i = 1; i <= steps; i++) {
          const nextX = Math.round(x + dx * i);
          const nextY = Math.round(y + dy * i);
          robotjs.moveMouse(nextX, nextY);
          await new Promise((resolve) => setTimeout(resolve, 10));
        }

        robotjs.mouseToggle("up", button || "left");
        break;

      case "scroll":
        const scrollAmount = scroll || 1;
        robotjs.scrollMouse(0, scrollAmount);
        break;

      default:
        throw new Error(`Unsupported mouse action: ${action}`);
    }

    // Add delay if specified
    if (options.delay) {
      await new Promise((resolve) => setTimeout(resolve, options.delay));
    }
  }

  /**
   * Type text
   * @param {string} text - Text to type
   * @param {Object} options - Options
   * @private
   */
  async _typeText(text, options = {}) {
    // Type each character with delay
    const delay = options.delay || 50;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      robotjs.typeString(char);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  /**
   * Get command to launch an application
   * @param {string} appName - Application name
   * @param {string} platform - OS platform
   * @param {Object} options - Options
   * @returns {string} - Launch command
   * @private
   */
  _getAppLaunchCommand(appName, platform, options = {}) {
    switch (platform) {
      case "win32":
        return `start "${appName}"`;

      case "darwin":
        return `open -a "${appName}"`;

      default: // Linux and others
        return `${appName} ${options.args || ""} ${options.background ? "&" : ""}`;
    }
  }

  /**
   * Get command to kill an application
   * @param {string} appName - Application name
   * @param {string} platform - OS platform
   * @param {Object} options - Options
   * @returns {string} - Kill command
   * @private
   */
  _getAppKillCommand(appName, platform, options = {}) {
    switch (platform) {
      case "win32":
        return `taskkill /F ${options.im ? "/IM" : '/FI "WINDOWTITLE eq'} "${appName}${options.im ? ".exe" : ""}${options.im ? "" : '"'}"`;

      case "darwin":
        return `osascript -e 'tell application "${appName}" to quit'`;

      default: // Linux and others
        return `pkill ${options.exact ? "-x" : ""} "${appName}"`;
    }
  }

  /**
   * Focus an application
   * @param {string} appName - Application name
   * @param {Object} options - Options
   * @returns {boolean} - True if successful
   * @private
   */
  async _focusApp(appName, options = {}) {
    const platform = os.platform();

    switch (platform) {
      case "win32":
        // For Windows, use powershell to activate window
        return await this.executeCommand(
          `powershell -command "(New-Object -ComObject WScript.Shell).AppActivate('${appName}')"`,
          options
        );

      case "darwin":
        // For macOS, use AppleScript
        return await this.executeCommand(
          `osascript -e 'tell application "${appName}" to activate'`,
          options
        );

      default:
        // For Linux, this is more complex and depends on window manager
        // This is a basic example using xdotool
        return await this.executeCommand(
          `xdotool search --name "${appName}" windowactivate`,
          options
        );
    }
  }
}

module.exports = ComputerControl;
