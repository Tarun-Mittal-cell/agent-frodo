"use client";

import React from "react";
import FileUploadHandler from "./FileUploadHandler";
import WorkspaceFiles from "./WorkspaceFiles";

const FilesSection = ({ workspaceId }) => {
  return (
    <div className="w-full border rounded-lg overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">Files & Media</h2>
        <p className="text-sm text-gray-500">
          View your code files and upload images, audio, and documents
        </p>
      </div>
      <div className="p-4 space-y-6">
        <FileUploadHandler workspaceId={workspaceId} />
        <WorkspaceFiles workspaceId={workspaceId} />
      </div>
    </div>
  );
};

export default FilesSection;
