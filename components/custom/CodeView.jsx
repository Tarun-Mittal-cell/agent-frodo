"use client";
import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackFileExplorer,
} from "@codesandbox/sandpack-react";
import Lookup from "@/data/Lookup";
import axios from "axios";
import { MessagesContext } from "@/context/MessagesContext";
import Prompt from "@/data/Prompt";
import { useConvex, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Loader2Icon, Code, FileText, Columns, Box } from "lucide-react";
import { countToken } from "./ChatView";
import { UserDetailContext } from "@/context/UserDetailContext";
import SandpackPreviewClient from "./SandpackPreviewClient";
import DiagramsView from "./DiagramsView";
import { ActionContext } from "@/context/ActionContext";
import { toast } from "sonner";

function CodeView() {
  const { id } = useParams();
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const [activeTab, setActiveTab] = useState("code");
  const [files, setFiles] = useState(Lookup?.DEFAULT_FILE);
  const { messages, setMessages } = useContext(MessagesContext);
  const UpdateFiles = useMutation(api.workspace.UpdateFiles);
  const convex = useConvex();
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Generating code...");
  const [streamingContent, setStreamingContent] = useState("");
  const [streamingProgress, setStreamingProgress] = useState(0);
  const [requirements, setRequirements] = useState([]);
  const [diagrams, setDiagrams] = useState({});
  const [isStreaming, setIsStreaming] = useState(false);
  const UpdateTokens = useMutation(api.users.UpdateToken);
  const { action, setAction } = useContext(ActionContext);

  // Refs for tracking state without triggering renders
  const streamTimeoutRef = useRef(null);
  const abortControllerRef = useRef(new AbortController());

  // Fetch files when the workspace ID changes
  useEffect(() => {
    if (id) {
      GetFiles();
    }
  }, [id]);

  // Switch to preview tab when an action is triggered
  useEffect(() => {
    if (action) {
      setActiveTab("preview");
    }
  }, [action]);

  // Generate AI code when a new user message is added
  useEffect(() => {
    if (messages?.length > 0) {
      const role = messages[messages.length - 1].role;
      if (role === "user") {
        GenerateAiCodeWithSimulatedStream();
      }
    }
  }, [messages]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (streamTimeoutRef.current) {
        clearTimeout(streamTimeoutRef.current);
      }
      abortControllerRef.current.abort();
    };
  }, []);

  // Helper function to extract filename from code content
  const getFileNameFromContent = useCallback((code, language, index) => {
    // Try to detect component/function name for JavaScript/React files
    if (language === "jsx" || language === "js" || language === "javascript") {
      const componentMatch = code.match(/function\s+(\w+)/);
      const constComponentMatch = code.match(/const\s+(\w+)\s*=\s*\(?.*=>/);
      const classMatch = code.match(/class\s+(\w+)/);

      if (componentMatch) {
        return `/${componentMatch[1]}.jsx`;
      } else if (constComponentMatch) {
        return `/${constComponentMatch[1]}.jsx`;
      } else if (classMatch) {
        return `/${classMatch[1]}.jsx`;
      } else {
        return index === 0 ? "/App.jsx" : `/Component${index}.jsx`;
      }
    }

    // For CSS files
    if (language === "css") {
      return "/styles.css";
    }

    // For HTML files
    if (language === "html") {
      return "/index.html";
    }

    // Default case with language extension
    return `/file${index}.${language}`;
  }, []);

  // Process markdown content to extract code blocks
  const extractFilesFromContent = useCallback(
    (content) => {
      if (!content || typeof content !== "string") return {};

      const codeBlockRegex = /```([\w-]+)?\n([\s\S]+?)```/g;
      let extractedFiles = {};
      let fileCount = 0;

      // Extract all code blocks
      let match;
      while ((match = codeBlockRegex.exec(content)) !== null) {
        const language = match[1] || "jsx";

        // Skip mermaid diagrams - they'll be handled separately
        if (language === "mermaid") continue;

        const code = match[2];

        // Generate filename
        let fileName = getFileNameFromContent(code, language, fileCount);

        // Store the code
        extractedFiles[fileName] = {
          code: code.trim(),
          active: true,
        };

        fileCount++;
      }

      // If no code blocks found but we have content
      if (fileCount === 0 && content.trim() && !content.includes("```")) {
        extractedFiles["/App.jsx"] = {
          code: content.trim(),
          active: true,
        };
      }

      return extractedFiles;
    },
    [getFileNameFromContent]
  );

  // Extract requirements from the streamed content
  const extractRequirements = useCallback((content) => {
    if (!content || typeof content !== "string") return [];

    // Look for requirement patterns like "- Requirement: X" or "1. Requirement"
    const reqPatterns = [
      /Requirements?:\s*\n((?:\s*[-*]\s*[^\n]+\n)+)/gi,
      /Requirements?:\s*\n((?:\s*\d+\.\s*[^\n]+\n)+)/gi,
      /User\s*Requirements?:\s*\n((?:\s*[-*]\s*[^\n]+\n)+)/gi,
      /Functional\s*Requirements?:\s*\n((?:\s*[-*]\s*[^\n]+\n)+)/gi,
    ];

    let requirements = [];

    // Try each pattern
    for (const pattern of reqPatterns) {
      const matches = [...content.matchAll(pattern)];
      for (const match of matches) {
        if (match[1]) {
          // Extract individual bullet points
          const bulletPattern = /\s*([-*]|\d+\.)\s*([^\n]+)/g;
          const bullets = [...match[1].matchAll(bulletPattern)];

          for (const bullet of bullets) {
            if (bullet[2] && !requirements.includes(bullet[2].trim())) {
              requirements.push(bullet[2].trim());
            }
          }
        }
      }
    }

    // If no structured requirements were found, try to identify any lists
    if (requirements.length === 0) {
      const listPattern = /\s*([-*]|\d+\.)\s*([^\n]+)/g;
      const listItems = [...content.matchAll(listPattern)];

      for (const item of listItems) {
        if (item[2] && !requirements.includes(item[2].trim())) {
          requirements.push(item[2].trim());
        }
      }

      // Limit to the first 8 items if we found a lot
      if (requirements.length > 8) {
        requirements = requirements.slice(0, 8);
      }
    }

    return requirements;
  }, []);

  // Extract diagram descriptions from the streamed content
  const extractDiagrams = useCallback((content) => {
    if (!content || typeof content !== "string") return {};

    const diagramMap = {};

    // Extract class diagram
    const classMatch = content.match(
      /```mermaid\s*\n([\s\S]*?classDiagram[\s\S]*?)```/i
    );
    if (classMatch && classMatch[1]) {
      diagramMap.classDiagram = classMatch[1].trim();
    }

    // Extract sequence diagram
    const sequenceMatch = content.match(
      /```mermaid\s*\n([\s\S]*?sequenceDiagram[\s\S]*?)```/i
    );
    if (sequenceMatch && sequenceMatch[1]) {
      diagramMap.sequenceDiagram = sequenceMatch[1].trim();
    }

    // Extract flowchart diagram
    const flowchartMatch = content.match(
      /```mermaid\s*\n([\s\S]*?flowchart[\s\S]*?)```/i
    );
    if (flowchartMatch && flowchartMatch[1]) {
      diagramMap.flowchartDiagram = flowchartMatch[1].trim();
    }

    // Extract entity relationship diagram
    const erMatch = content.match(
      /```mermaid\s*\n([\s\S]*?erDiagram[\s\S]*?)```/i
    );
    if (erMatch && erMatch[1]) {
      diagramMap.entityRelationshipDiagram = erMatch[1].trim();
    }

    return diagramMap;
  }, []);

  const GetFiles = async () => {
    setLoading(true);
    setLoadingText("Loading workspace files...");
    try {
      const result = await convex.query(api.workspace.GetWorkspace, {
        workspaceId: id,
      });
      if (result?.fileData) {
        const mergedFiles = { ...Lookup.DEFAULT_FILE, ...result.fileData };
        setFiles(mergedFiles);
      }
    } catch (error) {
      console.error("Error fetching workspace files:", error);
      toast.error("Failed to fetch workspace files. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Real-time streaming simulation using chunked content
  const GenerateAiCodeWithSimulatedStream = async () => {
    // Reset states
    setLoading(true);
    setIsStreaming(true);
    setLoadingText("Analyzing requirements...");
    setStreamingProgress(0);
    setStreamingContent("");
    setRequirements([]);
    setDiagrams({});

    // Clear previous abort controller and create a new one
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // Start progress animation
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 2;
      if (progress > 95) {
        clearInterval(progressInterval);
      }
      setStreamingProgress(progress);

      // Update loading text based on progress
      if (progress > 10 && progress <= 30) {
        setLoadingText("Designing system architecture...");
      } else if (progress > 30 && progress <= 50) {
        setLoadingText("Writing code components...");
      } else if (progress > 50 && progress <= 70) {
        setLoadingText("Implementing features...");
      } else if (progress > 70 && progress <= 90) {
        setLoadingText("Optimizing and refactoring...");
      } else if (progress > 90) {
        setLoadingText("Finalizing implementation...");
      }
    }, 400);

    try {
      const PROMPT = JSON.stringify(messages) + " " + Prompt.CODE_GEN_PROMPT;

      const response = await axios.post("/api/gen-ai-code", {
        prompt: PROMPT,
        signal: abortControllerRef.current.signal,
      });

      const aiResp = response.data;

      // Process the response as if it's streaming
      if (aiResp?.files) {
        // First extract any requirements or diagrams from text if present
        const allTextContent = Object.values(aiResp.files)
          .map((file) => (typeof file === "object" ? file.code : file))
          .join("\n");

        // Update streaming content for real-time updates
        setStreamingContent(allTextContent);

        const foundRequirements = extractRequirements(allTextContent);
        if (foundRequirements.length > 0) {
          setRequirements(foundRequirements);
        }

        const foundDiagrams = extractDiagrams(allTextContent);
        if (Object.keys(foundDiagrams).length > 0) {
          setDiagrams((prev) => ({ ...prev, ...foundDiagrams }));
        }

        // Before setting all files at once, stream them one by one with a slight delay
        const filesArray = Object.entries(aiResp.files);
        let currentFiles = { ...Lookup.DEFAULT_FILE };

        for (let i = 0; i < filesArray.length; i++) {
          if (abortControllerRef.current.signal.aborted) break;

          const [fileName, fileContent] = filesArray[i];
          currentFiles[fileName] = fileContent;

          // Update files state incrementally
          setFiles({ ...currentFiles });

          // Small delay to simulate streaming
          if (filesArray.length > 1 && i < filesArray.length - 1) {
            await new Promise((resolve) => {
              streamTimeoutRef.current = setTimeout(resolve, 500);
            });
          }
        }

        // Update files in the database
        try {
          await UpdateFiles({
            workspaceId: id,
            files: aiResp.files,
          });
        } catch (dbError) {
          console.error("Error updating files in database:", dbError);
        }

        // Update user tokens
        if (userDetail?._id) {
          try {
            const token =
              Number(userDetail?.token) -
              Number(countToken(JSON.stringify(aiResp)));

            await UpdateTokens({
              userId: userDetail._id,
              token: token,
            });

            setUserDetail((prev) => ({
              ...prev,
              token: token,
            }));
          } catch (tokenError) {
            console.error("Error updating user tokens:", tokenError);
          }
        }
      } else {
        // Process string or other format response
        const contentToProcess =
          typeof aiResp === "string"
            ? aiResp
            : aiResp?.text
              ? aiResp.text
              : aiResp?.content
                ? aiResp.content
                : JSON.stringify(aiResp);

        // Set streaming content for display
        setStreamingContent(contentToProcess);

        // Extract requirements
        const foundRequirements = extractRequirements(contentToProcess);
        if (foundRequirements.length > 0) {
          setRequirements(foundRequirements);
        }

        // Extract diagrams
        const foundDiagrams = extractDiagrams(contentToProcess);
        if (Object.keys(foundDiagrams).length > 0) {
          setDiagrams(foundDiagrams);
        }

        // Extract code files
        const extractedFiles = extractFilesFromContent(contentToProcess);

        if (Object.keys(extractedFiles).length > 0) {
          // Stream files one by one with a slight delay
          let currentFiles = { ...Lookup.DEFAULT_FILE };
          const filesArray = Object.entries(extractedFiles);

          for (let i = 0; i < filesArray.length; i++) {
            if (abortControllerRef.current.signal.aborted) break;

            const [fileName, fileContent] = filesArray[i];
            currentFiles[fileName] = fileContent;

            // Update files state incrementally
            setFiles({ ...currentFiles });

            // Small delay to simulate streaming
            if (filesArray.length > 1 && i < filesArray.length - 1) {
              await new Promise((resolve) => {
                streamTimeoutRef.current = setTimeout(resolve, 500);
              });
            }
          }

          // Update files in the database
          try {
            await UpdateFiles({
              workspaceId: id,
              files: extractedFiles,
            });
          } catch (dbError) {
            console.error("Error updating files in database:", dbError);
          }

          // Update user tokens
          if (userDetail?._id) {
            try {
              const token =
                Number(userDetail?.token) -
                Number(countToken(contentToProcess));

              await UpdateTokens({
                userId: userDetail._id,
                token: token,
              });

              setUserDetail((prev) => ({
                ...prev,
                token: token,
              }));
            } catch (tokenError) {
              console.error("Error updating user tokens:", tokenError);
            }
          }
        } else {
          // If no files could be extracted, create a single file
          const singleFile = {
            "/App.jsx": {
              code: contentToProcess.trim(),
              active: true,
            },
          };

          setFiles({ ...Lookup.DEFAULT_FILE, ...singleFile });

          // Update files in the database
          try {
            await UpdateFiles({
              workspaceId: id,
              files: singleFile,
            });
          } catch (dbError) {
            console.error("Error updating files in database:", dbError);
          }
        }
      }
    } catch (error) {
      console.error("Error generating AI code:", error);
      if (!abortControllerRef.current.signal.aborted) {
        toast.error("Server-side error! Please try again.");
      }
    } finally {
      // Clean up and finish
      clearInterval(progressInterval);
      setStreamingProgress(100);

      // Add a small delay before removing the loading indicator
      await new Promise((resolve) => {
        streamTimeoutRef.current = setTimeout(() => {
          setLoading(false);
          setIsStreaming(false);
          setStreamingProgress(0);
          resolve();
        }, 500);
      });
    }
  };

  // Cancel generation request
  const cancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      toast.info("Code generation cancelled");

      // Clean up UI
      setLoading(false);
      setIsStreaming(false);
      setStreamingProgress(0);
    }
  };

  return (
    <div
      className="relative w-full h-full flex flex-col"
      style={{ height: "calc(100vh - 120px)" }}
    >
      {/* Tabs Section */}
      <div className="bg-[#181818] w-full p-2 border-b border-[#333]">
        <div className="flex items-center flex-wrap bg-black p-1 justify-center rounded-full w-full max-w-[300px] mx-auto gap-2">
          <button
            onClick={() => setActiveTab("code")}
            className={`text-sm cursor-pointer transition-all duration-200 ${
              activeTab === "code"
                ? "text-blue-500 bg-blue-500 bg-opacity-25 p-1 px-2 rounded-full"
                : "text-gray-300 hover:text-blue-400"
            }`}
          >
            <Code className="w-3 h-3 inline-block mr-1" />
            Code
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`text-sm cursor-pointer transition-all duration-200 ${
              activeTab === "preview"
                ? "text-blue-500 bg-blue-500 bg-opacity-25 p-1 px-2 rounded-full"
                : "text-gray-300 hover:text-blue-400"
            }`}
          >
            <Columns className="w-3 h-3 inline-block mr-1" />
            Preview
          </button>
          <button
            onClick={() => setActiveTab("diagrams")}
            className={`text-sm cursor-pointer transition-all duration-200 ${
              activeTab === "diagrams"
                ? "text-blue-500 bg-blue-500 bg-opacity-25 p-1 px-2 rounded-full"
                : "text-gray-300 hover:text-blue-400"
            }`}
          >
            <Box className="w-3 h-3 inline-block mr-1" />
            Diagrams
          </button>
          <button
            onClick={() => setActiveTab("requirements")}
            className={`text-sm cursor-pointer transition-all duration-200 ${
              activeTab === "requirements"
                ? "text-blue-500 bg-blue-500 bg-opacity-25 p-1 px-2 rounded-full"
                : "text-gray-300 hover:text-blue-400"
            }`}
          >
            <FileText className="w-3 h-3 inline-block mr-1" />
            Requirements
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full" style={{ height: "calc(100% - 52px)" }}>
        {activeTab === "requirements" ? (
          <div className="h-full p-4 bg-[#1e1e1e] overflow-y-auto">
            {requirements.length > 0 ? (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Requirements
                </h3>
                <ul className="list-disc pl-5 space-y-2">
                  {requirements.map((req, index) => (
                    <li key={index} className="text-gray-300">
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-gray-400 mb-6">
                No specific requirements extracted.
              </div>
            )}

            {streamingContent && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Implementation Details
                </h3>
                <pre className="bg-gray-800 p-4 rounded text-xs text-gray-300 whitespace-pre-wrap overflow-x-auto">
                  {streamingContent}
                </pre>
              </div>
            )}
          </div>
        ) : activeTab === "diagrams" ? (
          <div className="h-full overflow-y-auto bg-[#1e1e1e]">
            <DiagramsView
              diagrams={diagrams}
              streamingContent={streamingContent}
              isStreaming={isStreaming}
            />
          </div>
        ) : (
          <SandpackProvider
            files={files}
            template="react"
            theme="dark"
            customSetup={{
              dependencies: Lookup.DEPENDANCY || {},
            }}
            options={{
              externalResources: ["https://cdn.tailwindcss.com"],
              visibleFiles: Object.keys(files),
              recompileMode: "immediate",
              recompileDelay: 300,
            }}
          >
            {activeTab === "code" ? (
              <div className="h-full flex" style={{ minHeight: "600px" }}>
                <div className="w-52 h-full border-r border-[#333] overflow-y-auto">
                  <SandpackFileExplorer />
                </div>
                <div className="flex-1 h-full">
                  <SandpackCodeEditor
                    showTabs
                    showLineNumbers
                    showInlineErrors
                    wrapContent
                    closableTabs
                    style={{ height: "100%" }}
                  />
                </div>
              </div>
            ) : (
              <SandpackLayout>
                <SandpackPreviewClient />
              </SandpackLayout>
            )}
          </SandpackProvider>
        )}
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="bg-gray-800 p-6 rounded-lg flex flex-col items-center max-w-md">
            <Loader2Icon className="animate-spin h-10 w-10 text-blue-500 mb-3" />
            <div className="w-64 bg-gray-700 rounded-full h-2 mb-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${streamingProgress}%` }}
              ></div>
            </div>
            <p className="text-white font-medium mb-2">{loadingText}</p>
            <p className="text-xs text-gray-400 mb-4">
              {streamingProgress}% complete
            </p>

            <button
              onClick={cancelGeneration}
              className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CodeView;
