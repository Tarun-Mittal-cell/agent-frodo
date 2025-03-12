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
import { useParams } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import { countToken } from "./ChatView";
import { UserDetailContext } from "@/context/UserDetailContext";
import SandpackPreviewClient from "./SandpackPreviewClient";
import { ActionContext } from "@/context/ActionContext";
import { toast } from "sonner";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useUser } from "@/hooks/use-users";

function CodeView() {
  const { id } = useParams();
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const [activeTab, setActiveTab] = useState("code");
  const [files, setFiles] = useState(Lookup?.DEFAULT_FILE);
  const { messages, setMessages } = useContext(MessagesContext);
  const [loading, setLoading] = useState(false);
  const { action, setAction } = useContext(ActionContext);

  // MongoDB hooks
  const { getWorkspace, updateFiles } = useWorkspaces(userDetail?._id);
  const { updateToken } = useUser();

  // Fetch files when the workspace ID changes
  useEffect(() => {
    if (id) {
      getFiles();
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
        generateAiCode();
      }
    }
  }, [messages]);

  const getFiles = async () => {
    setLoading(true);
    try {
      const result = await getWorkspace(id);
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

  const generateAiCode = async () => {
    setLoading(true);
    try {
      const PROMPT = JSON.stringify(messages) + " " + Prompt.CODE_GEN_PROMPT;
      const response = await axios.post("/api/gen-ai-code", {
        prompt: PROMPT,
      });
      const aiResp = response.data;

      if (aiResp?.files) {
        const mergedFiles = { ...Lookup.DEFAULT_FILE, ...aiResp.files };
        setFiles(mergedFiles);

        // Update files in the database
        await updateFiles(id, aiResp.files);

        // Update user tokens
        if (userDetail?._id) {
          const token =
            Number(userDetail?.token) -
            Number(countToken(JSON.stringify(aiResp)));

          await updateToken(userDetail._id, token);

          setUserDetail((prev) => ({
            ...prev,
            token: token,
          }));
        }
      }
    } catch (error) {
      console.error("Error generating AI code:", error);
      toast.error("Server-side error! Please try again.");
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
        <div className="flex items-center flex-wrap bg-black p-1 justify-center rounded-full w-full max-w-[200px] mx-auto gap-3">
          <button
            onClick={() => setActiveTab("code")}
            className={`text-sm cursor-pointer transition-all duration-200 ${
              activeTab === "code"
                ? "text-blue-500 bg-blue-500 bg-opacity-25 p-1 px-2 rounded-full"
                : "text-gray-300 hover:text-blue-400"
            }`}
          >
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
            Preview
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full" style={{ height: "calc(100% - 52px)" }}>
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
