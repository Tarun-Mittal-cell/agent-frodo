"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  UploadCloud,
  Loader2,
  ImageIcon,
  Mic,
  FileIcon,
  X,
} from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Colors from "@/data/Colors";

const FileUploadHandler = ({ workspaceId, onFileUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);

  // Convex mutations
  const getUploadUrl = useMutation(api.workspace.generateUploadUrl);
  const storeFileMetadata = useMutation(api.workspace.storeFileMetadata);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);

    // Determine file type and generate preview
    if (file.type.startsWith("image/")) {
      setFileType("image");
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith("audio/")) {
      setFileType("audio");
      setPreview(null); // Audio doesn't have a visual preview
    } else {
      setFileType("document");
      setPreview(null);
    }

    // Prepare for upload
    setUploading(true);
    setProgress(5); // Start progress at 5%

    try {
      // Get the upload URL from Convex
      const uploadUrlData = await getUploadUrl();
      setProgress(20); // Update progress

      // Upload the file with progress tracking
      await uploadFileWithProgress(
        file,
        uploadUrlData.uploadUrl,
        (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(20 + percentCompleted * 0.7); // Scale to 20-90% range
        }
      );

      setProgress(90); // Almost done

      // Store file metadata in Convex
      const fileData = await storeFileMetadata({
        workspaceId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        storageId: uploadUrlData.storageId,
      });

      setProgress(100); // Complete

      // Notify parent component of successful upload
      if (onFileUploaded) {
        onFileUploaded(fileData);
      }

      // Reset upload state after a brief delay to show completion
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 1000);
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploading(false);
      setProgress(0);
      alert("Failed to upload file. Please try again.");
    }
  };

  // Upload file with progress tracking
  const uploadFileWithProgress = (file, uploadUrl, onProgress) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", onProgress);

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Upload failed"));
      });

      xhr.open("POST", uploadUrl);

      // Create a FormData object for the file
      const formData = new FormData();
      formData.append("file", file);

      xhr.send(formData);
    });
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const resetFileUpload = () => {
    setPreview(null);
    setFileType(null);
    setFileName("");
    setProgress(0);
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt"
      />

      {/* Upload button or preview */}
      {!preview && !fileName ? (
        <Button
          onClick={triggerFileInput}
          variant="outline"
          className="w-full h-20 border-dashed border-2 flex flex-col items-center justify-center gap-2"
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <UploadCloud
              className="h-6 w-6"
              style={{ color: Colors.MAIN_BUTTON }}
            />
          )}
          <span className="text-center">
            Upload files (Images, Audio, Documents)
          </span>
          {uploading && (
            <div className="w-4/5 mt-2">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round(progress)}% uploaded
              </p>
            </div>
          )}
        </Button>
      ) : (
        <div className="relative border rounded-md p-4 mt-2">
          <div className="absolute top-2 right-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={resetFileUpload}
              className="h-6 w-6 rounded-full"
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            {fileType === "image" && preview ? (
              <div className="relative w-16 h-16 overflow-hidden rounded-md">
                <img
                  src={preview}
                  alt={fileName}
                  className="object-cover w-full h-full"
                />
              </div>
            ) : fileType === "audio" ? (
              <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-md">
                <Mic
                  className="h-8 w-8"
                  style={{ color: Colors.SECOND_BUTTON }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-md">
                <FileIcon
                  className="h-8 w-8"
                  style={{ color: Colors.SECOND_BUTTON }}
                />
              </div>
            )}

            <div className="flex-1">
              <p className="font-medium truncate" title={fileName}>
                {fileName}
              </p>
              <p className="text-sm text-gray-500">{fileType}</p>

              {uploading && (
                <div className="mt-2">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round(progress)}% uploaded
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadHandler;
