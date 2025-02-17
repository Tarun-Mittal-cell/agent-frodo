"use client";
import { MessagesContext } from "@/context/MessagesContext";
import { UserDetailContext } from "@/context/UserDetailContext";
import Lookup from "@/data/Lookup";
import { ArrowRight, Sparkles, Command } from "lucide-react";
import React, { useContext, useState } from "react";
import SignInDialog from "./SignInDialog";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function Hero() {
  const [userInput, setUserInput] = useState("");
  const { messages, setMessages } = useContext(MessagesContext);
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const [openDialog, setOpenDialog] = useState(false);
  const CreateWorkspace = useMutation(api.workspace.CreateWorkspace);
  const router = useRouter();

  const onGenerate = async (input) => {
    if (!userDetail?.name) {
      setOpenDialog(true);
      return;
    }
    if (userDetail?.token < 10) {
      toast("You dont have enough tokens!");
      return;
    }
    const msg = {
      role: "user",
      content: input,
    };
    setMessages(msg);

    const workspaceId = await CreateWorkspace({
      user: userDetail._id,
      messages: [msg],
    });
    router.push("/workspace/" + workspaceId);
  };

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center p-6 relative">
      {/* Floating Elements */}

      {/* Main Content */}
      <div className="flex flex-col items-center max-w-3xl w-full space-y-6 z-10">
        {/* Logo and Title */}
        <div className="flex items-center space-x-3 mb-2">
          <Command className="w-8 h-8 text-purple-400" />
          <h1 className="text-2xl font-light tracking-wide">DUMPLING</h1>
        </div>

        {/* Hero Text */}
        <h2 className="text-4xl md:text-5xl font-bold text-center text-gradient">
          {Lookup.HERO_HEADING}
        </h2>
        <p className="text-muted-foreground text-center max-w-xl">
          {Lookup.HERO_DESC}
        </p>

        {/* Input Area */}
        <div className="w-full max-w-2xl">
          <div className="glass rounded-xl p-4 hover-glow">
            <div className="flex gap-3">
              <textarea
                placeholder={Lookup.INPUT_PLACEHOLDER}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="w-full bg-transparent border-none outline-none resize-none min-h-[120px] placeholder:text-muted-foreground"
              />
              {userInput?.length > 0 && (
                <button
                  onClick={() => onGenerate(userInput)}
                  className="self-end p-2 rounded-lg bg-primary/20 hover:bg-primary/30 transition-colors"
                >
                  <ArrowRight className="w-5 h-5 text-primary" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Suggestions */}
        <div className="flex flex-wrap justify-center gap-2 max-w-2xl mt-6">
          {Lookup?.SUGGSTIONS.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onGenerate(suggestion)}
              className="glass px-4 py-2 rounded-full text-sm text-muted-foreground hover:text-primary hover-glow flex items-center gap-2"
            >
              <Sparkles className="w-3 h-3" />
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Sign In Dialog */}
      <SignInDialog
        openDialog={openDialog}
        closeDialog={(v) => setOpenDialog(v)}
      />
    </div>
  );
}

export default Hero;
