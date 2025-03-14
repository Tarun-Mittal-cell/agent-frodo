// components/custom/ProgressIndicator.jsx
import { Progress } from "../ui/progress";

export default function ProgressIndicator({ status, progress, message }) {
  // Map status to a more user-friendly display message
  const getStatusDisplay = () => {
    switch (status) {
      case "initializing":
        return "Initializing...";
      case "requirements":
        return "Analyzing Requirements";
      case "design":
        return "Creating Design";
      case "code":
        return "Generating Code";
      case "complete":
      case "completed":
        return "Generation Complete";
      case "error":
        return "Error Occurred";
      case "idle":
      default:
        return "Ready to Generate";
    }
  };

  // Get color based on status
  const getStatusColor = () => {
    switch (status) {
      case "error":
        return "text-red-600";
      case "complete":
      case "completed":
        return "text-green-600";
      case "idle":
        return "text-gray-600";
      default:
        return "text-blue-600";
    }
  };

  // Don't show progress for idle state
  if (status === "idle") {
    return null;
  }

  return (
    <div className="progress-container mb-8">
      <div className="flex items-center justify-between mb-2">
        <h2 className={`text-lg font-semibold ${getStatusColor()}`}>
          {getStatusDisplay()}
        </h2>
        <span className="text-sm font-medium">
          {progress > 0 ? `${Math.round(progress)}%` : ""}
        </span>
      </div>

      <Progress value={progress} className="w-full h-2" />

      {message && <p className="text-sm text-gray-600 mt-2">{message}</p>}
    </div>
  );
}
