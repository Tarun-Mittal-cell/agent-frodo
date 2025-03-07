"use client";
import React, { useContext, useEffect, useState } from "react";
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
import { Loader2Icon } from "lucide-react";
import { countToken } from "./ChatView";
import { UserDetailContext } from "@/context/UserDetailContext";
import SandpackPreviewClient from "./SandpackPreviewClient";
import { ActionContext } from "@/context/ActionContext";
import { toast } from "sonner";

// ErrorBoundary class component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error in CodeView:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-500 bg-red-100 rounded-lg">
          Something went wrong in the code editor. Please refresh the page.
        </div>
      );
    }
    return this.props.children;
  }
}

function CodeView() {
  const { id } = useParams();
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const [activeTab, setActiveTab] = useState("code");
  const [files, setFiles] = useState(Lookup?.DEFAULT_FILE || {});
  const { messages, setMessages } = useContext(MessagesContext);
  const updateFiles = useMutation(api.workspace.UpdateFiles);
  const convex = useConvex();
  const [loading, setLoading] = useState(false);
  const updateTokens = useMutation(api.users.UpdateToken);
  const { action, setAction } = useContext(ActionContext);

  // Fetch files when workspace ID changes
  useEffect(() => {
    if (!id) return;

    const fetchFiles = async () => {
      setLoading(true);
      try {
        const result = await convex.query(api.workspace.GetWorkspace, {
          workspaceId: id,
        });
        if (result?.fileData) {
          setFiles((prev) => ({
            ...Lookup.DEFAULT_FILE,
            ...result.fileData,
          }));
        }
      } catch (error) {
        console.error("Error fetching workspace files:", error);
        toast.error("Failed to load workspace files.");
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [id, convex]);

  // Switch to preview tab when action is triggered
  useEffect(() => {
    if (action) {
      setActiveTab("preview");
    }
  }, [action]);

  // Generate AI code when a new user message is added
  useEffect(() => {
    if (!messages?.length) return;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === "user") {
      generateAiCode();
    }
  }, [messages]);

  const generateAiCode = async () => {
    setLoading(true);
    try {
      const prompt = `${JSON.stringify(messages)} ${Prompt.CODE_GEN_PROMPT}`;
      const response = await axios.post("/api/gen-ai-code", { prompt });
      const aiResp = response.data;

      if (aiResp?.files) {
        const mergedFiles = { ...Lookup.DEFAULT_FILE, ...aiResp.files };
        setFiles(mergedFiles);

        await updateFiles({
          workspaceId: id,
          files: aiResp.files,
        });

        if (userDetail?._id) {
          const tokenCount = countToken(JSON.stringify(aiResp));
          const newToken = Number(userDetail.token) - tokenCount;

          await updateTokens({
            userId: userDetail._id,
            token: newToken,
          });

          setUserDetail((prev) => ({ ...prev, token: newToken }));
        }
      }
    } catch (error) {
      console.error("Error generating AI code:", error);
      toast.error("Failed to generate code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative w-full h-full flex flex-col"
      style={{ height: "calc(100vh - 120px)" }}
    >
      {/* Tabs Section */}
      <div className="bg-[#181818] w-full p-2 border-b border-[#333]">
        <div className="flex items-center justify-center gap-3 bg-black p-1 rounded-full w-full max-w-[200px] mx-auto">
          <button
            onClick={() => setActiveTab("code")}
            className={`text-sm transition-all duration-200 ${
              activeTab === "code"
                ? "text-blue-500 bg-blue-500 bg-opacity-25 p-1 px-2 rounded-full"
                : "text-gray-300 hover:text-blue-400"
            }`}
            aria-label="View Code"
          >
            Code
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`text-sm transition-all duration-200 ${
              activeTab === "preview"
                ? "text-blue-500 bg-blue-500 bg-opacity-25 p-1 px-2 rounded-full"
                : "text-gray-300 hover:text-blue-400"
            }`}
            aria-label="View Preview"
          >
            Preview
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full" style={{ height: "calc(100% - 52px)" }}>
        <ErrorBoundary>
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
        </ErrorBoundary>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="bg-gray-800 p-6 rounded-lg flex flex-col items-center">
            <Loader2Icon className="animate-spin h-10 w-10 text-blue-500 mb-3" />
            <p className="text-white font-medium">Generating your code...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CodeView;
