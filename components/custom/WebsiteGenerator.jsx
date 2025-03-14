// components/custom/WebsiteGenerator.jsx
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import RequirementsView from "./RequirementsView";
import DiagramsView from "./DiagramsView";
import CodeGenerationView from "./CodeGenerationView";
import PreviewSection from "./PreviewSection";
import GenerationForm from "./GenerationForm";
import ProgressIndicator from "./ProgressIndicator";

export default function WebsiteGenerator() {
  // State
  const [sessionId, setSessionId] = useState(null);
  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);

  // Data states
  const [requirements, setRequirements] = useState(null);
  const [diagrams, setDiagrams] = useState(null);
  const [generatedFiles, setGeneratedFiles] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [streamingData, setStreamingData] = useState({});

  // Initialize socket connection
  useEffect(() => {
    const socketInstance = io();
    setSocket(socketInstance);

    // Clean up on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Join session when sessionId changes
  useEffect(() => {
    if (!socket || !sessionId) return;

    // Join the session room
    socket.emit("join-session", sessionId);

    // Poll once for initial state
    fetchSessionStatus();
  }, [socket, sessionId]);

  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Status updates
    socket.on("status-update", (data) => {
      setStatus(data.phase);
      setProgress(data.progress);
      setMessage(data.message);
    });

    // Requirements updates
    socket.on("requirements-update", (data) => {
      setRequirements(data);
    });

    // Diagrams updates
    socket.on("diagrams-update", (data) => {
      setDiagrams(data);
    });

    // File updates
    socket.on("file-update", (file) => {
      setGeneratedFiles((prev) => {
        // Only add if not already present
        if (prev.some((f) => f.path === file.path)) {
          return prev.map((f) => (f.path === file.path ? file : f));
        }
        return [...prev, file];
      });
    });

    // Error handling
    socket.on("error", (errorData) => {
      setError(errorData.message);
      setStatus("error");
    });

    // Stream updates (raw content streaming)
    socket.on("stream-update", (data) => {
      setStreamingData((prev) => ({ ...prev, [data.streamId]: data }));
    });

    // Generation complete
    socket.on("generation-complete", (data) => {
      setStatus("completed");
      setProgress(100);
      setPreviewUrl(data.previewUrl);
    });

    // Clean up event listeners on unmount
    return () => {
      socket.off("status-update");
      socket.off("requirements-update");
      socket.off("diagrams-update");
      socket.off("file-update");
      socket.off("error");
      socket.off("stream-update");
      socket.off("generation-complete");
    };
  }, [socket]);

  // Fetch session status
  const fetchSessionStatus = useCallback(async () => {
    if (!sessionId) return;

    try {
      const response = await axios.get(`/api/ai-website/${sessionId}/status`);
      const data = response.data;

      if (data.success) {
        setStatus(data.status);
        setProgress(data.progress);
        setMessage(data.message);

        if (data.previewUrl) {
          setPreviewUrl(data.previewUrl);
        }

        if (data.error) {
          setError(data.error);
        }

        // Fetch requirements if available
        if (data.hasRequirements && !requirements) {
          fetchRequirements();
        }
      }
    } catch (err) {
      console.error("Error fetching session status:", err);
    }
  }, [sessionId, requirements]);

  // Fetch requirements
  const fetchRequirements = useCallback(async () => {
    if (!sessionId) return;

    try {
      const response = await axios.get(
        `/api/ai-website/${sessionId}/requirements`
      );
      if (response.data.success) {
        setRequirements(response.data.requirements);
      }
    } catch (err) {
      console.error("Error fetching requirements:", err);
    }
  }, [sessionId]);

  // Handle form submission
  const handleGenerate = async (prompt) => {
    try {
      // Reset all state
      setStatus("initializing");
      setProgress(0);
      setMessage("Initializing generation process...");
      setRequirements(null);
      setDiagrams(null);
      setGeneratedFiles([]);
      setPreviewUrl(null);
      setError(null);
      setStreamingData({});

      // Start generation
      const response = await axios.post("/api/ai-website", { prompt });

      if (response.data.success) {
        setSessionId(response.data.sessionId);
      } else {
        throw new Error(response.data.error || "Failed to start generation");
      }
    } catch (err) {
      setError(err.message || "An unknown error occurred");
      setStatus("error");
      console.error("Error starting generation:", err);
    }
  };

  // Render the component
  return (
    <div className="website-generator">
      <h1 className="text-3xl font-bold mb-6">AI Website Generator</h1>

      {/* Progress indicator */}
      <ProgressIndicator
        status={status}
        progress={progress}
        message={message}
      />

      {/* Error display */}
      {error && (
        <div className="error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Generation form */}
      {status === "idle" && <GenerationForm onSubmit={handleGenerate} />}

      {/* Requirements view */}
      {requirements && (
        <RequirementsView
          requirements={requirements}
          streamingData={streamingData}
        />
      )}

      {/* Diagrams view */}
      {diagrams && <DiagramsView diagrams={diagrams} />}

      {/* Code generation view */}
      {generatedFiles.length > 0 && (
        <CodeGenerationView
          files={generatedFiles}
          streamingData={streamingData}
        />
      )}

      {/* Preview section */}
      {previewUrl && <PreviewSection url={previewUrl} />}
    </div>
  );
}
