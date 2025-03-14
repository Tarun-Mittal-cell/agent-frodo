// components/custom/PreviewSection.jsx
import { useState } from "react";
import { Button } from "../ui/button";

export default function PreviewSection({ url }) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Toggle expanded/collapsed state
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  if (!url) return null;

  return (
    <div className="preview-container bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Website Preview</h2>

        <div className="flex items-center gap-4">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Open in new tab
          </a>

          <button
            onClick={toggleExpand}
            className="text-gray-500 hover:text-gray-700 focus:outline-none text-sm"
          >
            {isExpanded ? "Collapse" : "Expand"}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="preview-frame-container">
          <div className="bg-gray-100 p-2 rounded-t-md border border-gray-300 border-b-0 flex items-center">
            <div className="flex space-x-2 mr-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>

            <div className="flex-1 bg-white rounded-md px-3 py-1 text-sm text-gray-800 truncate">
              {url}
            </div>
          </div>

          <div className="preview-frame border border-gray-300 rounded-b-md overflow-hidden">
            <iframe
              src={url}
              title="Website Preview"
              className="w-full h-[600px] border-none"
              sandbox="allow-same-origin allow-scripts allow-forms"
              loading="lazy"
            />
          </div>

          <div className="mt-4 flex justify-center">
            <Button
              onClick={() => window.open(url, "_blank")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Open Full Preview
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
