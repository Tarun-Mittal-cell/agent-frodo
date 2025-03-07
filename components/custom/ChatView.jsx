"use client";
import React, { useContext, useEffect, useState } from "react";
import { MessagesContext } from "@/context/MessagesContext";
import { UserDetailContext } from "@/context/UserDetailContext";
import { api } from "@/convex/_generated/api";
import Colors from "@/data/Colors";
import Lookup from "@/data/Lookup";
import Prompt from "@/data/Prompt";
import axios from "axios";
import { ArrowRight, Link, Loader2Icon } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useConvex, useMutation } from "convex/react";
import ReactMarkdown from "react-markdown";
import { useSidebar } from "../ui/sidebar";
import { toast } from "sonner";

// ErrorBoundary class component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error in ChatView:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-500 bg-red-100 rounded-lg">
          Something went wrong in the chat. Please refresh the page.
        </div>
      );
    }
    return this.props.children;
  }
}

// Token counting utility
export const countToken = (inputText) => {
  if (!inputText || typeof inputText !== "string") return 0;
  return inputText
    .trim()
    .split(/\s+/)
    .filter((word) => word).length;
};

function ChatView() {
  const { id } = useParams();
  const convex = useConvex();
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const { messages, setMessages } = useContext(MessagesContext);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const updateMessages = useMutation(api.workspace.UpdateMessages);
  const { toggleSidebar } = useSidebar();
  const updateTokens = useMutation(api.users.UpdateToken);

  // Fetch workspace data when ID changes
  useEffect(() => {
    if (!id) return;

    const fetchWorkspaceData = async () => {
      try {
        const result = await convex.query(api.workspace.GetWorkspace, {
          workspaceId: id,
        });
        setMessages(result?.messages || []);
      } catch (error) {
        console.error("Error fetching workspace data:", error);
        toast.error("Failed to load chat history.");
      }
    };

    fetchWorkspaceData();
  }, [id, convex]);

  // Generate AI response when a new user message is added
  useEffect(() => {
    if (!messages?.length) return;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === "user") {
      getAiResponse();
    }
  }, [messages]);

  const getAiResponse = async () => {
    setLoading(true);
    try {
      const prompt = `${JSON.stringify(messages)} ${Prompt.CHAT_PROMPT}`;
      const result = await axios.post("/api/ai-chat", { prompt });
      const aiResp = {
        role: "ai",
        content: result.data.result || "Sorry, I couldn’t generate a response.",
      };

      const updatedMessages = [...messages, aiResp];
      setMessages(updatedMessages);

      await updateMessages({
        messages: updatedMessages,
        workspaceId: id,
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
    } catch (error) {
      console.error("Error generating AI response:", error);
      toast.error("Failed to get AI response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onGenerate = (input) => {
    if (!input.trim()) return;
    if (userDetail?.token < 10) {
      toast.error("Not enough tokens to send a message!");
      return;
    }

    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setUserInput("");
  };

  return (
    <div className="relative h-[85vh] flex flex-col">
      <ErrorBoundary>
        <div className="flex-1 overflow-y-scroll scrollbar-hide pl-5">
          {messages?.length > 0 ? (
            messages.map((msg, index) => (
              <div
                key={index}
                className="p-3 rounded-lg mb-4 flex gap-2 items-center leading-7"
                style={{ backgroundColor: Colors.CHAT_BACKGROUND }}
              >
                {msg.role === "user" && userDetail?.picture && (
                  <Image
                    src={userDetail.picture}
                    alt="User avatar"
                    width={35}
                    height={35}
                    className="rounded-full"
                    onError={() => console.error("Failed to load user image")}
                  />
                )}
                <ReactMarkdown className="flex flex-col">
                  {msg.content}
                </ReactMarkdown>
              </div>
            ))
          ) : (
            <div className="p-3 text-gray-500">
              No messages yet. Start chatting!
            </div>
          )}
          {loading && (
            <div
              className="p-5 rounded-lg mb-2 flex gap-2 items-center"
              style={{ backgroundColor: Colors.CHAT_BACKGROUND }}
            >
              <Loader2Icon className="animate-spin" />
              <p>Generating response...</p>
            </div>
          )}
        </div>

        {/* Input Section */}
        <div className="flex gap-2 items-end">
          {userDetail?.picture && (
            <Image
              src={userDetail.picture}
              className="rounded-full cursor-pointer"
              onClick={toggleSidebar}
              alt="User avatar"
              width={30}
              height={30}
              onError={() => console.error("Failed to load user avatar")}
            />
          )}
          <div
            className="p-5 border rounded-xl max-w-xl w-full mt-3"
            style={{ backgroundColor: Colors.BACKGROUND }}
          >
            <div className="flex gap-2">
              <textarea
                placeholder={Lookup.INPUT_PLACEHOLDER || "Type your message..."}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="outline-none bg-transparent w-full h-32 max-h-56 resize-none"
                aria-label="Chat input"
              />
              {userInput.trim() && (
                <button
                  onClick={() => onGenerate(userInput)}
                  className="bg-blue-500 p-2 h-10 w-10 rounded-md flex items-center justify-center"
                  aria-label="Send message"
                >
                  <ArrowRight />
                </button>
              )}
            </div>
            <div>
              <Link className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </div>
  );
}

export default ChatView;
