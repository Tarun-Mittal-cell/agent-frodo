"use client";
import React, { useContext, useState } from "react";
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
  Rocket,
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
      // Enhance the prompt for stunning UI generation
      let enhancedPrompt = input;
      enhancedPrompt +=
        "\n\nGenerate an extraordinary, production-ready website with these specific requirements:\n" +
        "- Create a visually stunning UI with advanced glass morphism effects\n" +
        "- Use radial and conic gradients for modern, eye-catching backgrounds\n" +
        "- Implement subtle micro-animations for interactive elements\n" +
        "- Use reliable Unsplash image URLs with proper loading attributes\n" +
        "- Ensure full mobile responsiveness with tailored layouts for all devices\n" +
        "- Apply futuristic design principles inspired by SpaceX and Tesla interfaces\n" +
        "- Use proper typography hierarchy with dramatic font scaling\n" +
        "- Implement dark mode by default with light mode toggle\n" +
        "- Add subtle parallax effects for depth and immersion\n" +
        "- Use asymmetrical layouts and dynamic spacing\n" +
        "- Add optimized loading states and skeleton screens";

      // Show toast notifications for capabilities
      if (capabilities[0].active) {
        toast("Web browsing capability activated", {
          icon: <Globe className="text-blue-400" />,
        });
      }

      const msg = {
        role: "user",
        content: enhancedPrompt,
      };

      setMessages(msg);

      // Create workspace - Fixed: removed metadata field
      const workspaceId = await CreateWorkspace({
        user: userDetail._id,
        messages: [msg],
      });

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
      {/* Beautiful, static gradient background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-indigo-950/90 to-black">
          {/* Subtle noise texture overlay */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              backgroundSize: "cover",
            }}
          />
        </div>
      </div>

      {/* Beautiful Static Orbs */}
      <div className="orbs-container pointer-events-none">
        {/* Main orbs with perfect positioning and subtle glow */}
        <div className="orb orb-blue"></div>
        <div className="orb orb-purple"></div>
        <div className="orb orb-pink"></div>
        <div className="orb orb-cyan"></div>

        {/* Decorative elements */}
        <div className="static-ring"></div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center max-w-3xl w-full space-y-8 z-10">
        {/* Logo and Title */}
        <div className="flex items-center space-x-3 mb-2">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-md"></div>
            <Rocket className="w-10 h-10 text-blue-400 relative z-10" />
          </div>
          <h1 className="text-3xl font-bold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-500">
            FRODO
          </h1>
        </div>

        {/* Hero Text */}
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center fade-in-up">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500">
            {Lookup.HERO_HEADING}
          </span>
        </h2>

        <p className="text-xl text-slate-300 text-center max-w-xl fade-in-up-delayed">
          {Lookup.HERO_DESC}
        </p>

        {/* Enhanced Capabilities */}
        <div className="flex flex-wrap justify-center gap-2 w-full">
          {capabilities.map((capability, index) => (
            <button
              key={index}
              onClick={() => toggleCapability(index)}
              className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 ${
                capability.active
                  ? "backdrop-blur-md bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-lg shadow-blue-500/10"
                  : "bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-700/50"
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
        <div className="w-full max-w-2xl fade-in-up">
          <div
            className={`backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4 transition-all duration-300 ${
              isExpanded
                ? "shadow-xl shadow-blue-500/5 border-blue-500/20"
                : "hover:shadow-lg hover:border-white/20"
            }`}
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 px-2">
                <span className="text-slate-500 text-sm">Frodo AI</span>
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
                <div className="flex justify-between pt-2 border-t border-slate-700/50 fade-in">
                  <div className="text-xs text-slate-500">
                    Available tokens: {userDetail?.token || 0}
                  </div>

                  <div className="text-xs text-blue-400">
                    {capabilities.filter((c) => c.active).length} capabilities
                    active
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Generate Button */}
          {userInput?.length > 0 && (
            <div className="flex justify-end mt-4 fade-in">
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

      {/* CSS for static orbs and animations */}
      <style jsx global>{`
        /* Beautiful Static Orbs */
        .orbs-container {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 1;
        }

        /* Large, beautiful orbs with fixed positioning */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(70px);
          opacity: 0.6;
        }

        .orb-blue {
          width: 600px;
          height: 600px;
          top: -100px;
          right: -100px;
          background: radial-gradient(
            circle,
            rgba(59, 130, 246, 0.5) 0%,
            rgba(37, 99, 235, 0.2) 30%,
            transparent 70%
          );
        }

        .orb-purple {
          width: 500px;
          height: 500px;
          bottom: -100px;
          left: -100px;
          background: radial-gradient(
            circle,
            rgba(139, 92, 246, 0.5) 0%,
            rgba(124, 58, 237, 0.2) 40%,
            transparent 70%
          );
        }

        .orb-pink {
          width: 300px;
          height: 300px;
          top: 20%;
          left: 10%;
          background: radial-gradient(
            circle,
            rgba(236, 72, 153, 0.4) 0%,
            rgba(219, 39, 119, 0.1) 60%,
            transparent 70%
          );
        }

        .orb-cyan {
          width: 350px;
          height: 350px;
          bottom: 30%;
          right: 10%;
          background: radial-gradient(
            circle,
            rgba(6, 182, 212, 0.4) 0%,
            rgba(14, 165, 233, 0.1) 50%,
            transparent 70%
          );
        }

        /* Decorative ring */
        .static-ring {
          position: absolute;
          width: 800px;
          height: 800px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          border: 1px solid rgba(59, 130, 246, 0.1);
          box-shadow:
            0 0 50px rgba(59, 130, 246, 0.05),
            inset 0 0 30px rgba(59, 130, 246, 0.05);
          opacity: 0.6;
        }

        /* Elegant fade-in animations */
        .fade-in {
          opacity: 0;
          animation: fadeIn 0.8s ease-out forwards;
        }

        .fade-in-up {
          opacity: 0;
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .fade-in-up-delayed {
          opacity: 0;
          animation: fadeInUp 0.8s ease-out 0.2s forwards;
        }

        .staggered-item {
          opacity: 0;
          animation: fadeIn 0.5s ease-out forwards;
        }

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

        /* Responsive adjustments */
        @media (max-width: 640px) {
          .orb-blue {
            width: 400px;
            height: 400px;
            right: -200px;
          }

          .orb-purple {
            width: 350px;
            height: 350px;
            left: -150px;
          }

          .static-ring {
            width: 500px;
            height: 500px;
          }
        }
      `}</style>
    </div>
  );
}

export default Hero;
