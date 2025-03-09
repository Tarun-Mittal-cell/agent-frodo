// lib/AgentWrapper.js - A wrapper that provides the right implementation based on environment

// This module provides a way to access the agent in both server and client contexts
import { EventEmitter } from "./EventEmitter";

class ClientAgentProxy extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = options;
    this.isRunning = false;
    this.sessionId = Math.random().toString(36).substring(2, 15);
  }

  async initialize(apiKey, callbacks = {}, options = {}) {
    this.apiKey = apiKey;
    this.callbacks = callbacks;
    this.extendedOptions = options;

    try {
      const response = await fetch("/api/agent/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey,
          options: {
            ...this.options,
            ...options,
          },
          sessionId: this.sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to initialize agent: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Agent initialization error:", error);
      throw error;
    }
  }

  async startTask(task, options = {}) {
    if (this.isRunning) {
      throw new Error("Agent is already running a task");
    }

    this.isRunning = true;
    this.emit("start", { task });

    try {
      // Start the event source for updates
      this._startEventSource();

      // Send the start request
      const response = await fetch("/api/agent/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          task,
          options,
          sessionId: this.sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to start task: ${response.statusText}`);
      }

      return { success: true, message: "Task started" };
    } catch (error) {
      this.isRunning = false;
      this.emit("error", { error });
      throw error;
    }
  }

  async stopTask(reason = "User requested stop") {
    if (!this.isRunning) {
      return { success: true, message: "No task is currently running" };
    }

    try {
      const response = await fetch("/api/agent/stop", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason,
          sessionId: this.sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to stop task: ${response.statusText}`);
      }

      this._closeEventSource();
      this.isRunning = false;
      this.emit("stop", { reason });

      return await response.json();
    } catch (error) {
      console.error("Error stopping task:", error);
      this.isRunning = false;
      return { success: false, error: error.message };
    }
  }

  async getStatus() {
    try {
      const response = await fetch(
        `/api/agent/status?sessionId=${this.sessionId}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get status: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting status:", error);
      return { error: error.message };
    }
  }

  async getTaskHistory() {
    try {
      const response = await fetch(
        `/api/agent/history?sessionId=${this.sessionId}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get history: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting history:", error);
      return { error: error.message };
    }
  }

  _startEventSource() {
    if (this._eventSource) {
      this._closeEventSource();
    }

    this._eventSource = new EventSource(
      `/api/agent/events?sessionId=${this.sessionId}`
    );

    this._eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.emit(data.type, data.payload);
      } catch (error) {
        console.error("Error processing event:", error);
      }
    };

    this._eventSource.onerror = (error) => {
      console.error("EventSource error:", error);
      this._closeEventSource();
      this.emit("error", { error: "Connection to server lost" });

      // Attempt to reconnect after a delay
      setTimeout(() => {
        if (this.isRunning) {
          this._startEventSource();
        }
      }, 3000);
    };
  }

  _closeEventSource() {
    if (this._eventSource) {
      this._eventSource.close();
      this._eventSource = null;
    }
  }
}

// Export the appropriate implementation based on environment
const AgentWrapper =
  typeof window === "undefined"
    ? require("./AutonomousAgent").default // Server-side: use the full implementation
    : ClientAgentProxy; // Client-side: use the proxy

export default AgentWrapper;
