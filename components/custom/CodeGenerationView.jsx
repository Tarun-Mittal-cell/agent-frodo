// components/custom/CodeGenerationView.jsx
import { useState, useEffect, useRef } from "react";
import CodePreview from "./CodePreview";

export default function CodeGenerationView({ initialPrompt = "" }) {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [filesByDirectory, setFilesByDirectory] = useState({});
  const [directories, setDirectories] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState(initialPrompt);
  const [streamingData, setStreamingData] = useState({});
  const promptRef = useRef(null);

  // Group files by directory on files change
  useEffect(() => {
    const grouped = groupFilesByDirectory(files);
    setFilesByDirectory(grouped);

    // Get sorted directory names
    const sortedDirs = Object.keys(grouped).sort((a, b) => {
      // Always put 'root' first
      if (a === "root") return -1;
      if (b === "root") return 1;
      return a.localeCompare(b);
    });

    setDirectories(sortedDirs);

    // Auto-select first file if nothing is selected
    if (!selectedFile && files.length > 0) {
      setSelectedFile(files[0]);
    }
  }, [files, selectedFile]);

  // Generate code with streaming
  const generateCode = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setFiles([]);
    setStreamingData({});

    // Create a main file to show initial streaming
    const initialFile = {
      path: "App.jsx",
      content: "",
      type: "file",
    };

    setFiles([initialFile]);
    setSelectedFile(initialFile);

    // Initialize streaming data for the initial file
    setStreamingData({
      "App.jsx": {
        type: "file_generation",
        filePath: "App.jsx",
        status: "processing",
        currentData: {
          content: "",
        },
      },
    });

    try {
      const response = await fetch("/api/gen-ai-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate code: ${response.status}`);
      }

      // Process the stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let accumulatedData = "";
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        if (value) {
          const text = decoder.decode(value);
          accumulatedData += text;

          // Update the streaming content for the initial file
          setStreamingData((prev) => ({
            ...prev,
            "App.jsx": {
              ...prev["App.jsx"],
              currentData: {
                content: accumulatedData,
              },
            },
          }));

          // Try to parse the accumulated data as we receive it
          try {
            // Look for any complete code sections
            const codeBlocksRegex =
              /```(jsx|javascript|js|html|css|typescript|ts)([\s\S]*?)```/g;
            const matches = [...accumulatedData.matchAll(codeBlocksRegex)];

            if (matches.length > 0) {
              // Create files from code blocks
              const newFiles = matches.map((match, index) => {
                const language = match[1];
                const content = match[2].trim();
                const extension = getExtensionFromLanguage(language);
                const fileName =
                  getFileName(content) || `Generated${index + 1}.${extension}`;

                return {
                  path: fileName,
                  content: content,
                  type: "file",
                };
              });

              // Add App.jsx if it doesn't exist in the parsed files
              if (!newFiles.some((file) => file.path === "App.jsx")) {
                newFiles.push(initialFile);
              }

              setFiles(newFiles);

              // Update streaming data for all files
              const newStreamingData = {};
              newFiles.forEach((file) => {
                newStreamingData[file.path] = {
                  type: "file_generation",
                  filePath: file.path,
                  status: "processing",
                  currentData: {
                    content: file.content,
                  },
                };
              });

              setStreamingData(newStreamingData);
            }
          } catch (parseError) {
            // Continue collecting data if parsing fails
            console.log("Still collecting data...");
          }
        }
      }

      // Update status to completed when done
      setStreamingData((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((key) => {
          updated[key].status = "completed";
        });
        return updated;
      });
    } catch (error) {
      console.error("Error generating code:", error);

      // Add error file
      const errorFile = {
        path: "error.txt",
        content: `Error: ${error.message}`,
        type: "file",
      };

      setFiles([errorFile]);
      setSelectedFile(errorFile);
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle expanded/collapsed state
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Handle file selection
  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  // Extract streaming data for file generation
  const fileStream = selectedFile ? streamingData[selectedFile.path] : null;

  // Get file content with any streaming updates
  const getFileContent = () => {
    if (!selectedFile) return "";

    // If we have streaming content for this file, use it
    if (fileStream?.currentData?.content) {
      return fileStream.currentData.content;
    }

    // Otherwise use the file content
    return selectedFile.content || "";
  };

  // Determine if the file is currently being streamed
  const isStreaming =
    isGenerating || (fileStream && fileStream.status === "processing");

  return (
    <div className="code-generation-container bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
      <div className="flex flex-col gap-4 mb-6">
        <h2 className="text-xl font-semibold">Code Generation</h2>

        <textarea
          ref={promptRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="E.g., Create a responsive navbar with dark mode toggle using Tailwind CSS"
          className="min-h-[100px] p-4 rounded-md border border-gray-200 bg-white text-sm resize-y"
          disabled={isGenerating}
        />

        <button
          onClick={generateCode}
          disabled={isGenerating || !prompt.trim()}
          className={`px-4 py-2 rounded-md text-white font-medium ${
            isGenerating || !prompt.trim()
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isGenerating ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Generating...
            </span>
          ) : (
            "Generate Code"
          )}
        </button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold">Generated Code</h3>

          {files.length > 0 && (
            <span className="ml-3 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
              {files.length} files
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {isStreaming && (
            <span className="text-xs flex items-center text-blue-600">
              <span className="relative h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Generating...
            </span>
          )}

          <button
            onClick={toggleExpand}
            className="text-gray-500 hover:text-gray-700 focus:outline-none text-sm"
          >
            {isExpanded ? "Collapse" : "Expand"}
          </button>
        </div>
      </div>

      {isExpanded && files.length > 0 && (
        <div className="code-explorer flex border border-gray-200 rounded-md overflow-hidden">
          {/* File browser sidebar */}
          <div className="file-browser w-64 shrink-0 border-r border-gray-200 bg-gray-50 p-4 overflow-y-auto max-h-[600px]">
            {directories.map((dir) => (
              <div key={dir} className="directory mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <FolderIcon className="w-4 h-4 mr-1" />
                  {dir === "root" ? "/" : dir}
                </h3>

                <ul className="space-y-1 pl-3">
                  {filesByDirectory[dir].map((file) => (
                    <li
                      key={file.path}
                      onClick={() => handleFileSelect(file)}
                      className={`
                        text-sm py-1 px-2 rounded cursor-pointer flex items-center
                        ${
                          selectedFile?.path === file.path
                            ? "bg-blue-100 text-blue-700"
                            : "hover:bg-gray-100 text-gray-700"
                        }
                      `}
                    >
                      <FileIcon
                        className="w-4 h-4 mr-1"
                        extension={getFileExtension(file.path)}
                      />
                      {getFileName(file.path)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Code content area */}
          <div className="code-content flex-1 overflow-hidden max-h-[600px]">
            {selectedFile ? (
              <div className="h-full flex flex-col">
                <div className="p-2 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                  <div className="text-sm font-medium text-gray-700">
                    {selectedFile.path}
                  </div>

                  {isStreaming && (
                    <span className="text-xs flex items-center text-blue-600">
                      <span className="relative h-2 w-2 mr-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                      </span>
                      Generating...
                    </span>
                  )}
                </div>

                <div className="flex-1 overflow-auto">
                  <CodePreview
                    code={getFileContent()}
                    language={getLanguageFromPath(selectedFile.path)}
                    isStreaming={isStreaming}
                  />
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                Select a file to view its content
              </div>
            )}
          </div>
        </div>
      )}

      {isExpanded && files.length === 0 && !isGenerating && (
        <div className="text-center py-8 text-gray-500">
          Enter a prompt and click "Generate Code" to start.
        </div>
      )}

      {isExpanded && files.length === 0 && isGenerating && (
        <div className="text-center py-8 text-gray-500">
          Generating code... Please wait.
        </div>
      )}
    </div>
  );
}

// Helper function to group files by directory
function groupFilesByDirectory(files) {
  return files.reduce((acc, file) => {
    const dirPath = file.path.includes("/")
      ? file.path.split("/").slice(0, -1).join("/")
      : "root";

    if (!acc[dirPath]) {
      acc[dirPath] = [];
    }

    acc[dirPath].push(file);
    return acc;
  }, {});
}

// Helper function to get file name from path
function getFileName(path) {
  if (typeof path !== "string") return "untitled";
  return path.split("/").pop();
}

// Helper function to extract filename from content
function getFileName(content) {
  // Try to find a React component name
  const componentMatch = content.match(/function\s+(\w+)\s*\(/);
  if (componentMatch) {
    return `${componentMatch[1]}.jsx`;
  }

  // Try to find a class name
  const classMatch = content.match(/class\s+(\w+)\s+/);
  if (classMatch) {
    return `${classMatch[1]}.jsx`;
  }

  return null;
}

// Helper function to get file extension
function getFileExtension(path) {
  if (typeof path !== "string") return "";
  return path.split(".").pop();
}

// Helper function to determine language from file path
function getLanguageFromPath(path) {
  if (typeof path !== "string") return "plaintext";
  const ext = path.split(".").pop().toLowerCase();

  const languageMap = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    css: "css",
    scss: "scss",
    html: "html",
    json: "json",
    md: "markdown",
    txt: "plaintext",
  };

  return languageMap[ext] || "plaintext";
}

// Helper function to get file extension from language
function getExtensionFromLanguage(language) {
  const extensionMap = {
    javascript: "js",
    js: "js",
    jsx: "jsx",
    typescript: "ts",
    ts: "ts",
    tsx: "tsx",
    css: "css",
    scss: "scss",
    html: "html",
    json: "json",
    markdown: "md",
  };

  return extensionMap[language] || "js";
}

// Simple icon components
function FolderIcon({ className }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
    </svg>
  );
}

function FileIcon({ className, extension }) {
  // Customize icon color based on extension
  let color = "currentColor";

  switch (extension) {
    case "js":
    case "jsx":
      color = "#f7df1e"; // JavaScript yellow
      break;
    case "ts":
    case "tsx":
      color = "#3178c6"; // TypeScript blue
      break;
    case "css":
    case "scss":
      color = "#264de4"; // CSS blue
      break;
    case "html":
      color = "#e34c26"; // HTML orange
      break;
    case "json":
      color = "#8bc34a"; // Green
      break;
  }

  return (
    <svg
      className={className}
      style={{ color }}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <text x="8" y="19" fontSize="6" fontWeight="bold" fill="currentColor">
        {extension}
      </text>
    </svg>
  );
}
