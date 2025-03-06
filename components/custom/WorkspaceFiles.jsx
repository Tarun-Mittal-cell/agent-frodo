"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Download,
  Trash2,
  ImageIcon,
  Mic,
  FileIcon,
  FileTextIcon,
  Eye,
  Loader2,
  BrainCircuit,
  Code,
  X,
} from "lucide-react";
import Colors from "@/data/Colors";

const WorkspaceFiles = ({ workspaceId }) => {
  const workspace = useQuery(api.workspace.GetWorkspace, { workspaceId });
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingPrompt, setProcessingPrompt] = useState("");
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Handle both old and new fileData formats
  let files = [];
  if (workspace && workspace.fileData) {
    // Check if fileData is an array (new format)
    if (Array.isArray(workspace.fileData)) {
      files = workspace.fileData;
    }
    // Check if fileData is an object with file paths (old format)
    else if (typeof workspace.fileData === "object") {
      // Convert old format to display format
      files = Object.entries(workspace.fileData).map(([path, data]) => ({
        fileName: path.startsWith("/") ? path.substring(1) : path,
        fileType: path.endsWith(".js")
          ? "application/javascript"
          : "text/plain",
        fileSize: data.code ? data.code.length : 0,
        uploadedAt: Date.now(),
        isLegacyCode: true,
        code: data.code,
      }));
    }
  }

  // Get file type icon
  const getFileIcon = (fileType, isLegacyCode) => {
    if (isLegacyCode) {
      return (
        <Code className="h-5 w-5" style={{ color: Colors.SECOND_BUTTON }} />
      );
    } else if (fileType.startsWith("image/")) {
      return (
        <ImageIcon
          className="h-5 w-5"
          style={{ color: Colors.SECOND_BUTTON }}
        />
      );
    } else if (fileType.startsWith("audio/")) {
      return (
        <Mic className="h-5 w-5" style={{ color: Colors.SECOND_BUTTON }} />
      );
    } else if (
      fileType.startsWith("text/") ||
      fileType.includes("javascript") ||
      fileType.includes("document")
    ) {
      return (
        <FileTextIcon
          className="h-5 w-5"
          style={{ color: Colors.SECOND_BUTTON }}
        />
      );
    } else {
      return (
        <FileIcon className="h-5 w-5" style={{ color: Colors.SECOND_BUTTON }} />
      );
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  // Format timestamp
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  // Preview file
  const previewFile = async (file) => {
    setSelectedFile(file);

    if (file.isLegacyCode) {
      // For legacy code files, we already have the content
      setFileUrl(null); // No URL for legacy files
    } else if (file.storageId) {
      try {
        const urlData = await api.workspace.getFileUrl({
          storageId: file.storageId,
        });
        setFileUrl(urlData.url);
      } catch (error) {
        console.error("Error getting file URL:", error);
        alert("Failed to preview file");
      }
    }

    setShowPreviewModal(true);
  };

  // Render file preview based on type
  const renderFilePreview = () => {
    if (!selectedFile) return null;

    if (selectedFile.isLegacyCode) {
      // Render code preview for legacy files
      return (
        <div className="w-full overflow-auto bg-gray-100 p-4 rounded-md">
          <pre className="text-sm text-gray-800">
            <code>{selectedFile.code}</code>
          </pre>
        </div>
      );
    } else if (fileUrl) {
      if (selectedFile.fileType.startsWith("image/")) {
        return (
          <div className="flex justify-center">
            <img
              src={fileUrl}
              alt={selectedFile.fileName}
              className="max-w-full max-h-[70vh] object-contain"
            />
          </div>
        );
      } else if (selectedFile.fileType.startsWith("audio/")) {
        return (
          <div className="flex justify-center">
            <audio controls className="w-full max-w-md">
              <source src={fileUrl} type={selectedFile.fileType} />
              Your browser does not support the audio element.
            </audio>
          </div>
        );
      } else if (selectedFile.fileType.startsWith("video/")) {
        return (
          <div className="flex justify-center">
            <video controls className="max-w-full max-h-[70vh]">
              <source src={fileUrl} type={selectedFile.fileType} />
              Your browser does not support the video element.
            </video>
          </div>
        );
      } else {
        return (
          <div className="flex justify-center flex-col items-center">
            <div className="p-8 bg-gray-100 rounded-lg">
              <FileIcon
                className="h-16 w-16"
                style={{ color: Colors.SECOND_BUTTON }}
              />
            </div>
            <p className="mt-4">
              Preview not available.{" "}
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Open file
              </a>{" "}
              instead.
            </p>
          </div>
        );
      }
    } else {
      return (
        <div className="flex justify-center flex-col items-center">
          <div className="p-8 bg-gray-100 rounded-lg">
            <FileIcon
              className="h-16 w-16"
              style={{ color: Colors.SECOND_BUTTON }}
            />
          </div>
          <p className="mt-4">No preview available</p>
        </div>
      );
    }
  };

  // Render processing results if available
  const renderProcessingResults = (file) => {
    if (!file.isProcessed || !file.processingResults) return null;

    return (
      <div className="mt-2 text-sm">
        <p className="font-medium">AI Analysis:</p>
        <p>{file.processingResults.summary}</p>
        {file.processingResults.keywords && (
          <div className="flex flex-wrap gap-1 mt-1">
            {file.processingResults.keywords.map((keyword, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-gray-100 rounded-full text-xs"
              >
                {keyword}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full">
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg flex flex-col items-center">
            <Loader2
              className="h-8 w-8 animate-spin"
              style={{ color: Colors.MAIN_BUTTON }}
            />
            <p className="mt-4">Processing file with AI...</p>
          </div>
        </div>
      )}

      {files.length === 0 ? (
        <div className="text-center py-10 border rounded-md">
          <FileIcon className="mx-auto h-10 w-10 text-gray-400" />
          <p className="mt-4 text-gray-500">No files uploaded yet</p>
          <p className="text-sm text-gray-400">
            Upload files to analyze with AI
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file, index) => (
            <div key={index} className="border rounded-lg overflow-hidden p-4">
              <div className="flex items-center gap-3">
                {getFileIcon(file.fileType, file.isLegacyCode)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate" title={file.fileName}>
                    {file.fileName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.fileSize)} •{" "}
                    {file.uploadedAt ? formatDate(file.uploadedAt) : "N/A"}
                  </p>
                </div>
              </div>

              {renderProcessingResults(file)}

              <div className="flex justify-between mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => previewFile(file)}
                  title="Preview"
                  className="w-full"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* File Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">{selectedFile?.fileName}</h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {renderFilePreview()}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceFiles;
