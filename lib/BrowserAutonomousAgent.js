// lib/BrowserAutonomousAgent.js
import { EventEmitter } from "./EventEmitter";

class BrowserAutonomousAgent {
  constructor(options = {}) {
    this.options = options;
    this.eventEmitter = new EventEmitter();
    this.isRunning = false;
    this.tasks = [];
    this.currentTask = null;
  }

  on(event, callback) {
    this.eventEmitter.on(event, callback);
    return this;
  }

  off(event, callback) {
    this.eventEmitter.off(event, callback);
    return this;
  }

  async start() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.eventEmitter.emit("start");

    try {
      // Instead of running locally, we'll call the API
      const response = await fetch("/api/agent/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.options),
      });

      if (!response.ok) {
        throw new Error(`Failed to start agent: ${response.statusText}`);
      }

      // Start listening for updates
      this.startEventSource();
    } catch (error) {
      this.eventEmitter.emit("error", error);
      this.stop();
    }
  }

  startEventSource() {
    // Use Server-Sent Events to get updates from the server
    const eventSource = new EventSource("/api/agent/events");

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.eventEmitter.emit(data.type, data.payload);

      if (data.type === "complete") {
        eventSource.close();
        this.stop();
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      this.eventEmitter.emit(
        "error",
        new Error("EventSource connection failed")
      );
      this.stop();
    };

    this.eventSource = eventSource;
  }

  async stop() {
    if (!this.isRunning) return;

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    this.isRunning = false;

    try {
      await fetch("/api/agent/stop", {
        method: "POST",
      });
    } catch (error) {
      console.error("Error stopping agent:", error);
    }

    this.eventEmitter.emit("stop");
  }

  async addTask(task) {
    this.tasks.push(task);
    this.eventEmitter.emit("taskAdded", task);

    try {
      await fetch("/api/agent/task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(task),
      });
    } catch (error) {
      console.error("Error adding task:", error);
    }

    return this;
  }
}

export default BrowserAutonomousAgent;
