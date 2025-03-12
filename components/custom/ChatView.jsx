"use client";
import { MessagesContext } from "@/context/MessagesContext";
import { UserDetailContext } from "@/context/UserDetailContext";
import Colors from "@/data/Colors";
import Lookup from "@/data/Lookup";
import Prompt from "@/data/Prompt";
import axios from "axios";
import { ArrowRight, Link, Loader2Icon } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import React, { useContext, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useSidebar } from "../ui/sidebar";
import { toast } from "sonner";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useUser } from "@/hooks/use-users";

export const countToken = (inputText) => {
  return inputText
    .trim()
    .split(/\s+/)
    .filter((word) => word).length;
};

function ChatView() {
  const { id } = useParams();
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const { messages, setMessages } = useContext(MessagesContext);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { toggleSidebar } = useSidebar();

  // MongoDB hooks
  const { getWorkspace, updateMessages } = useWorkspaces(userDetail?._id);
  const { updateToken } = useUser();

  useEffect(() => {
    id && getWorkspaceData();
  }, [id]);

  /**
   * Used to Get Workspace data using Workspace ID
   */
  const getWorkspaceData = async () => {
    try {
      const result = await getWorkspace(id);
      if (result) {
        setMessages(result.messages || []);
        console.log("Workspace data:", result);
      }
    } catch (error) {
      console.error("Error getting workspace data:", error);
      toast.error("Failed to load workspace data");
    }
  };

  useEffect(() => {
    if (messages?.length > 0) {
      const role = messages[messages?.length - 1].role;
      if (role === "user") {
        getAiResponse();
      }
    }
  }, [messages]);

  const getAiResponse = async () => {
    setLoading(true);
    try {
      const PROMPT = JSON.stringify(messages) + Prompt.CHAT_PROMPT;
      const result = await axios.post("/api/ai-chat", {
        prompt: PROMPT,
      });

      const aiResp = {
        role: "ai",
        content: result.data.result,
      };

      const updatedMessages = [...messages, aiResp];
      setMessages(updatedMessages);

      // Update messages in database
      await updateMessages(id, updatedMessages);

      // Calculate and update token usage
      const tokenUsage = countToken(JSON.stringify(aiResp));
      const newTokenBalance = Number(userDetail?.token) - Number(tokenUsage);

      setUserDetail((prev) => ({
        ...prev,
        token: newTokenBalance,
      }));

      // Update tokens in database
      if (userDetail?._id) {
        await updateToken(userDetail._id, newTokenBalance);
      }
    } catch (error) {
      console.error("Error generating AI response:", error);
      toast.error("Failed to generate response");
    } finally {
      setLoading(false);
    }
  };

  const onGenerate = (input) => {
    if (!input || input.trim() === "") return;

    if (userDetail?.token < 10) {
      toast.error("You don't have enough tokens!");
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: input,
      },
    ]);
    setUserInput("");
  };

  return (
    <div className="relative h-[85vh] flex flex-col">
      <div className="flex-1 overflow-y-scroll scrollbar-hide pl-5 ">
        {messages?.length > 0 &&
          messages?.map((msg, index) => (
            <div
              key={index}
              className="p-3 rounded-lg mb-4 flex gap-2 items-center leading-7"
              style={{
                backgroundColor: Colors.CHAT_BACKGROUND,
              }}
            >
              {msg?.role === "user" && userDetail?.picture && (
                <Image
                  src={userDetail.picture}
                  alt="userImage"
                  width={35}
                  height={35}
                  className="rounded-full"
                />
              )}
              <ReactMarkdown className="flex flex-col">
                {msg.content}
              </ReactMarkdown>
            </div>
          ))}
        {loading && (
          <div
            className="p-5 rounded-lg mb-2 flex gap-2 items-center"
            style={{
              backgroundColor: Colors.CHAT_BACKGROUND,
            }}
          >
            <Loader2Icon className="animate-spin" />
            <h2>Generating response...</h2>
          </div>
        )}
      </div>

      {/* Input Section  */}
      <div className="flex gap-2 items-end">
        {userDetail?.picture && (
          <Image
            src={userDetail.picture}
            className="rounded-full cursor-pointer"
            onClick={toggleSidebar}
            alt="user"
            width={30}
            height={30}
          />
        )}
        <div
          className="p-5 border rounded-xl max-w-xl w-full mt-3 "
          style={{
            backgroundColor: Colors.BACKGROUND,
          }}
        >
          <div className="flex gap-2 ">
            <textarea
              placeholder={Lookup.INPUT_PLACEHOLDER}
              value={userInput}
              onChange={(event) => setUserInput(event.target.value)}
              className="outline-none bg-transparent w-full h-32 max-h-56 resize-none"
            />
            {userInput && (
              <ArrowRight
                onClick={() => onGenerate(userInput)}
                className="bg-blue-500 p-2 h-10 w-10 rounded-md cursor-pointer"
              />
            )}
          </div>
          <div>
            <Link className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatView;
