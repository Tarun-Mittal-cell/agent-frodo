// components/custom/AutonomousControls.js
// UI component for controlling the autonomous agent

import React, { useState, useEffect } from "react";
import {
  Play,
  Pause,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Terminal,
} from "lucide-react";
import AutonomousAgent from "../../lib/AutonomousAgent";

/**
 * AutonomousControls component provides a UI for controlling the autonomous agent
 * and visualizing its progress.
 */
const AutonomousControls = ({ apiKey, onResult }) => {
  const [agent, setAgent] = useState(null);
  const [task, setTask] = useState("");
  const [status, setStatus] = useState("idle"); // idle, connecting, running, completed, error
  const [isInitialized, setIsInitialized] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);

  // Initialize the agent when the component mounts or apiKey changes
  useEffect(() => {
    const initializeAgent = async () => {
      if (!apiKey) return;

      setStatus("connecting");
      setMessage("Connecting to Claude API...");

      try {
        const newAgent = new AutonomousAgent();

        const connectionResult = await newAgent.initialize(apiKey, {
          onProgress: handleProgress,
          onComplete: handleComplete,
          onError: handleError,
        });

        if (connectionResult.success) {
          setAgent(newAgent);
          setIsInitialized(true);
          setStatus("idle");
          setMessage("Connected to Claude API. Ready to start tasks.");
        } else {
          setStatus("error");
          setMessage(`Connection failed: ${connectionResult.message}`);
        }
      } catch (error) {
        setStatus("error");
        setMessage(`Initialization error: ${error.message}`);
      }
    };

    initializeAgent();
  }, [apiKey]);

  // Handle progress updates from the agent
  const handleProgress = (progressData) => {
    setStatus(progressData.status);
    setMessage(progressData.message);
    setProgress(progressData.progress || 0);
  };

  // Handle task completion
  const handleComplete = (completionData) => {
    setStatus("completed");
    setMessage("Task completed successfully");
    setProgress(100);
    setResult(completionData);
    setHistory(completionData.history || []);

    if (onResult) {
      onResult(completionData);
    }
  };

  // Handle errors
  const handleError = (error) => {
    setStatus("error");
    setMessage(`Error: ${error.message}`);
    setProgress(0);
  };

  // Start a new task
  const startTask = async () => {
    if (!isInitialized || !task) return;

    setStatus("running");
    setMessage("Starting task...");
    setProgress(0);
    setResult(null);

    try {
      await agent.startTask(task);
    } catch (error) {
      setStatus("error");
      setMessage(`Failed to start task: ${error.message}`);
    }
  };

  // Stop the current task
  const stopTask = () => {
    if (!isInitialized || status !== "running") return;

    try {
      agent.stopTask();
      setStatus("idle");
      setMessage("Task stopped by user");
    } catch (error) {
      setStatus("error");
      setMessage(`Failed to stop task: ${error.message}`);
    }
  };

  // Get status badge color based on current status
  const getStatusBadgeColor = () => {
    switch (status) {
      case "idle":
        return "bg-slate-500";
      case "connecting":
        return "bg-amber-500";
      case "running":
      case "processing":
      case "started":
        return "bg-blue-500";
      case "completed":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-slate-500";
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Autonomous Agent Controls
          </h2>
          <div
            className={`px-3 py-1 text-xs font-medium rounded-full text-white ${getStatusBadgeColor()}`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        </div>

        <div className="mb-6">
          <label
            htmlFor="task"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
          >
            Task Description
          </label>
          <textarea
            id="task"
            rows="4"
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
            placeholder="Describe the website you want the agent to build autonomously..."
            value={task}
            onChange={(e) => setTask(e.target.value)}
            disabled={status === "running"}
          />
        </div>

        <div className="flex flex-col space-y-4">
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-4">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            {message}
          </p>

          <div className="flex space-x-4">
            {status !== "running" ? (
              <button
                onClick={startTask}
                disabled={!isInitialized || !task || status === "connecting"}
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Task
              </button>
            ) : (
              <button
                onClick={stopTask}
                className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Pause className="w-5 h-5 mr-2" />
                Stop Task
              </button>
            )}

            <button
              onClick={() => setIsConsoleOpen(!isConsoleOpen)}
              className="flex items-center justify-center px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              <Terminal className="w-5 h-5 mr-2" />
              {isConsoleOpen ? "Hide Console" : "Show Console"}
            </button>
          </div>
        </div>
      </div>

      {isConsoleOpen && (
        <div className="border-t border-slate-200 dark:border-slate-700">
          <div className="p-4 bg-slate-900 text-slate-300 rounded-b-xl h-64 overflow-y-auto font-mono text-sm">
            <div className="flex justify-between items-center mb-2 sticky top-0 bg-slate-900 py-2">
              <h3 className="text-white font-semibold">Agent Console</h3>
              <div className="text-xs text-slate-400">
                {history.length} messages
              </div>
            </div>

            {history.length === 0 ? (
              <div className="text-slate-500 italic">
                No activity yet. Start a task to see the agent's progress.
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((entry, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded ${
                      entry.role === "user"
                        ? "bg-slate-800 text-white"
                        : entry.role === "assistant"
                          ? "bg-blue-900 text-white"
                          : "bg-red-900 text-white"
                    }`}
                  >
                    <div className="text-xs font-bold mb-1">
                      {entry.role.toUpperCase()}
                    </div>
                    <div className="whitespace-pre-wrap break-words">
                      {entry.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {result && (
        <div className="p-6 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center mb-4">
            {status === "completed" ? (
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-500 mr-2" />
            )}
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Task Result
            </h3>
          </div>

          <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4 text-slate-800 dark:text-slate-200">
            <p>
              <strong>Status:</strong> {result.success ? "Success" : "Failed"}
            </p>
            <p>
              <strong>Iterations:</strong> {result.iterations}
            </p>
            <p>
              <strong>Message:</strong> {result.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutonomousControls;
