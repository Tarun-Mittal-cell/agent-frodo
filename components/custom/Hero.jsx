"use client";
import React, { useContext, useState, useEffect } from "react";
import { MessagesContext } from "@/context/MessagesContext";
import { UserDetailContext } from "@/context/UserDetailContext";
import Lookup from "@/data/Lookup";
import {
  ArrowRight,
  Sparkles,
  Command,
  Globe,
  Code,
  Zap,
  Package,
  ChevronDown,
} from "lucide-react";
import SignInDialog from "./SignInDialog";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function Hero() {
  // Core state and context
  const { messages, setMessages } = useContext(MessagesContext);
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const [userInput, setUserInput] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Enhanced capabilities for website generation
  const [capabilities, setCapabilities] = useState([
    {
      icon: <Globe className="w-4 h-4" />,
      label: "Web Browsing",
      active: true,
    },
    {
      icon: <Code className="w-4 h-4" />,
      label: "API Integration",
      active: true,
    },
    {
      icon: <Package className="w-4 h-4" />,
      label: "Dependencies",
      active: true,
    },
    { icon: <Zap className="w-4 h-4" />, label: "Advanced UI", active: true },
  ]);

  // API mutations
  const CreateWorkspace = useMutation(api.workspace.CreateWorkspace);

  // Handle generation process with enhanced features
  const onGenerate = async (input) => {
    if (!userDetail?.name) {
      setOpenDialog(true);
      return;
    }

    if (userDetail?.token < 10) {
      toast.error("You don't have enough tokens", {
        description: "Please upgrade your account to continue",
        action: {
          label: "Upgrade",
          onClick: () => router.push("/pricing"),
        },
      });
      return;
    }

    setIsLoading(true);

    try {
      // Detect what capabilities are needed
      const needsWebBrowsing =
        input.toLowerCase().includes("browse") ||
        input.toLowerCase().includes("search");
      const needsAPI =
        input.toLowerCase().includes("api") ||
        input.toLowerCase().includes("data");
      const needsDependencies =
        input.toLowerCase().includes("install") ||
        input.toLowerCase().includes("dependency");

      // Enhance the prompt with UI instructions
      let enhancedPrompt = input;
      enhancedPrompt +=
        "\n\nAdditional requirements: Create a modern, visually stunning UI with glass morphism effects, gradients, and subtle animations. Use reliable Unsplash image URLs and ensure all images load correctly. Make the design production-ready and error-free.";

      // Show toast notifications for capabilities
      if (needsWebBrowsing && capabilities[0].active) {
        toast.info("Web browsing activated", {
          icon: <Globe className="w-4 h-4" />,
        });
      }

      if (needsAPI && capabilities[1].active) {
        toast.info("API integration activated", {
          icon: <Code className="w-4 h-4" />,
        });
      }

      if (needsDependencies && capabilities[2].active) {
        toast.info("Dependency management activated", {
          icon: <Package className="w-4 h-4" />,
        });
      }

      // Prepare the message
      const msg = {
        role: "user",
        content: enhancedPrompt,
      };

      // Update the messages context
      setMessages(msg);

      // Create workspace - FIXED: removed metadata field
      const workspaceId = await CreateWorkspace({
        user: userDetail._id,
        messages: [msg],
      });

      // Navigate to workspace
      router.push("/workspace/" + workspaceId);
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Failed to generate content");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle capability status
  const toggleCapability = (index) => {
    setCapabilities((prev) =>
      prev.map((cap, i) =>
        i === index ? { ...cap, active: !cap.active } : cap
      )
    );
  };

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Optimized background with gradient overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-900 via-indigo-950/90 to-slate-900 overflow-hidden">
        {/* Subtle grid pattern for texture */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath fill-rule='evenodd' d='M0 0h20v20H0V0zm1 1h18v18H1V1z'/%3E%3C/g%3E%3C/svg%3E\")",
            backgroundSize: "20px 20px",
          }}
        />
      </div>

      {/* Enhanced orbs with improved aesthetics */}
      <div className="orb-container">
        <div className="orb orb-blue"></div>
        <div className="orb orb-purple"></div>
        <div className="orb orb-pink"></div>
        <div className="orb orb-cyan"></div>
        <div className="orb orb-green"></div>
        {/* Star-like particles */}
        <div className="stars">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="star"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                width: `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center max-w-3xl w-full space-y-6 z-10 animate-fade-in">
        {/* Logo and Title */}
        <div className="flex items-center space-x-3 mb-2">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-md"></div>
            <Command className="w-10 h-10 text-blue-400 relative z-10" />
          </div>
          <h1 className="text-3xl font-bold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-500">
            FRODO
          </h1>
        </div>

        {/* Hero Text */}
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center animate-fade-in-up">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500">
            {Lookup.HERO_HEADING}
          </span>
        </h2>

        <p className="text-xl text-slate-300 text-center max-w-xl animate-fade-in-up-delayed">
          {Lookup.HERO_DESC}
        </p>

        {/* Enhanced Capabilities */}
        <div className="flex flex-wrap justify-center gap-2 w-full">
          {capabilities.map((capability, index) => (
            <button
              key={index}
              onClick={() => toggleCapability(index)}
              className={`px-4 py-2 rounded-lg border transition-all duration-300 flex items-center gap-2 ${
                capability.active
                  ? "backdrop-blur-md bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-lg shadow-blue-500/10"
                  : "bg-slate-800/50 text-slate-400 border-slate-700/50 hover:bg-slate-700/50"
              }`}
            >
              {capability.icon}
              <span className="text-sm">{capability.label}</span>
              <div
                className={`w-2 h-2 rounded-full ${
                  capability.active ? "bg-green-400" : "bg-slate-600"
                }`}
              ></div>
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div className="w-full max-w-2xl animate-fade-in-up">
          <div
            className={`backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4 transition-all duration-300 ${
              isExpanded
                ? "shadow-xl shadow-blue-500/5 border-blue-500/20"
                : "hover:shadow-lg hover:border-white/20"
            }`}
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 px-2">
                <span className="text-slate-500 text-sm">Frodo</span>
                <div className="h-4 w-px bg-slate-700/50"></div>
                <div className="flex space-x-1">
                  {capabilities
                    .filter((cap) => cap.active)
                    .map((cap, i) => (
                      <span
                        key={i}
                        className="w-2 h-2 rounded-full bg-blue-500"
                        title={cap.label}
                      ></span>
                    ))}
                </div>
                <div className="ml-auto">
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>
              </div>

              <textarea
                placeholder={Lookup.INPUT_PLACEHOLDER}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onFocus={() => setIsExpanded(true)}
                className="w-full bg-transparent border-none outline-none resize-none min-h-[120px] text-white placeholder:text-slate-500"
              />

              {isExpanded && (
                <div className="flex justify-between pt-2 border-t border-slate-700/50 animate-fade-in">
                  <div className="text-xs text-slate-500">
                    Available tokens: {userDetail?.token || 0}
                  </div>

                  <div className="text-xs text-slate-500">
                    {userInput.length} characters
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Generate Button */}
          {userInput?.length > 0 && (
            <div className="flex justify-end mt-4 animate-fade-in">
              <button
                onClick={() => onGenerate(userInput)}
                disabled={isLoading}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-medium shadow-lg shadow-blue-700/20 hover:shadow-blue-700/40 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-70 disabled:pointer-events-none flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
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
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    <span>Generate</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Suggestions */}
        <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
          {Lookup?.SUGGSTIONS.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onGenerate(suggestion)}
              className="backdrop-blur-md bg-white/5 border border-white/10 px-4 py-2 rounded-full text-sm text-slate-300 hover:text-blue-400 hover:border-blue-400/20 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 flex items-center gap-2 staggered-item"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Sparkles className="w-3 h-3 text-blue-400" />
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

      {/* CSS for optimized animations and orbs */}
      <style jsx global>{`
        /* Optimized Orbs */
        .orb-container {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 1;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.6;
          will-change: transform;
        }

        .orb-blue {
          width: 350px;
          height: 350px;
          background: radial-gradient(
            circle,
            rgba(59, 130, 246, 0.5) 0%,
            rgba(37, 99, 235, 0.1) 70%
          );
          top: 10%;
          right: 15%;
          animation: floatOrb1 15s ease-in-out infinite;
        }

        .orb-purple {
          width: 450px;
          height: 450px;
          background: radial-gradient(
            circle,
            rgba(139, 92, 246, 0.5) 0%,
            rgba(124, 58, 237, 0.1) 70%
          );
          bottom: 5%;
          left: 5%;
          animation: floatOrb2 18s ease-in-out infinite;
        }

        .orb-pink {
          width: 250px;
          height: 250px;
          background: radial-gradient(
            circle,
            rgba(236, 72, 153, 0.4) 0%,
            rgba(219, 39, 119, 0.1) 70%
          );
          top: 30%;
          left: 20%;
          animation: floatOrb3 12s ease-in-out infinite;
        }

        .orb-cyan {
          width: 300px;
          height: 300px;
          background: radial-gradient(
            circle,
            rgba(34, 211, 238, 0.3) 0%,
            rgba(6, 182, 212, 0.1) 70%
          );
          bottom: 30%;
          right: 20%;
          animation: floatOrb4 20s ease-in-out infinite;
        }

        .orb-green {
          width: 200px;
          height: 200px;
          background: radial-gradient(
            circle,
            rgba(16, 185, 129, 0.3) 0%,
            rgba(5, 150, 105, 0.1) 70%
          );
          top: 65%;
          right: 30%;
          animation: floatOrb5 14s ease-in-out infinite;
        }

        /* Star-like particles */
        .stars {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .star {
          position: absolute;
          background-color: rgba(255, 255, 255, 0.8);
          border-radius: 50%;
          animation: twinkle 5s ease-in-out infinite;
        }

        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.5);
          }
        }

        @keyframes floatOrb1 {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-30px, 30px) scale(1.1);
          }
        }

        @keyframes floatOrb2 {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(40px, -20px) scale(1.08);
          }
        }

        @keyframes floatOrb3 {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(20px, 20px) scale(1.05);
          }
          66% {
            transform: translate(-20px, 10px) scale(1.05);
          }
        }

        @keyframes floatOrb4 {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(-15px, -25px) scale(1.03);
          }
          66% {
            transform: translate(20px, 15px) scale(1.03);
          }
        }

        @keyframes floatOrb5 {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(10px, -15px) scale(1.02);
          }
          75% {
            transform: translate(-10px, 15px) scale(1.02);
          }
        }

        /* Fade In Animations */
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.7s ease-out forwards;
        }

        .animate-fade-in-up-delayed {
          animation: fadeInUp 0.7s ease-out 0.2s forwards;
          opacity: 0;
        }

        .staggered-item {
          opacity: 0;
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default Hero;
