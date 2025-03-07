"use client";
import React, { useContext, useState, useEffect, useRef } from "react";
import { MessagesContext } from "@/context/MessagesContext";
import { UserDetailContext } from "@/context/UserDetailContext";
import { ActionContext } from "@/context/ActionContext";
import Lookup from "@/data/Lookup";
import {
  ArrowRight,
  Sparkles,
  Command,
  Globe,
  Code,
  Zap,
  Layers,
  Package,
  ChevronDown,
  UploadCloud,
  Search,
} from "lucide-react";
import { motion } from "framer-motion";
import SignInDialog from "./SignInDialog";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ImageUtils from "@/lib/ImageUtils";
import OptimizedImage from "./OptimizedImage"; // Custom component for optimized image loading

function Hero() {
  // Contexts and State Management
  const { messages, setMessages } = useContext(MessagesContext);
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const actionContext = useContext(ActionContext);
  const setIsGenerating = actionContext?.setIsGenerating;
  const [userInput, setUserInput] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [capabilities, setCapabilities] = useState([
    {
      icon: <Globe className="w-5 h-5" />,
      label: "Web Browsing",
      active: true,
    },
    {
      icon: <Code className="w-5 h-5" />,
      label: "API Integration",
      active: true,
    },
    {
      icon: <Package className="w-5 h-5" />,
      label: "Dependency Management",
      active: true,
    },
    {
      icon: <Layers className="w-5 h-5" />,
      label: "Advanced UI",
      active: true,
    },
  ]);
  const [particles, setParticles] = useState([]);
  const particlesRef = useRef([]);
  const containerRef = useRef(null);
  const textareaRef = useRef(null);
  const animationFrameRef = useRef(null);

  const router = useRouter();
  const CreateWorkspace = useMutation(api.workspace.CreateWorkspace);

  // Initialize Background and Particles
  useEffect(() => {
    const image = ImageUtils.getRandomImage("abstract");
    setBackgroundImage(image.url);
    initParticles();

    if (textareaRef.current) textareaRef.current.focus();

    return () => {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Particle Animation Logic
  const initParticles = () => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * containerRect.width,
      y: Math.random() * containerRect.height,
      size: Math.random() * 4 + 1,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      color: `rgba(${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 255)}, ${Math.random() * 0.5 + 0.1})`,
    }));
    particlesRef.current = newParticles;
    setParticles(newParticles);
    animateParticles();
  };

  const animateParticles = () => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    particlesRef.current = particlesRef.current.map((particle) => {
      let newX = particle.x + particle.vx;
      let newY = particle.y + particle.vy;
      if (newX <= 0 || newX >= containerRect.width) particle.vx *= -1;
      if (newY <= 0 || newY >= containerRect.height) particle.vy *= -1;
      return { ...particle, x: newX, y: newY };
    });
    setParticles([...particlesRef.current]);
    animationFrameRef.current = requestAnimationFrame(animateParticles);
  };

  // Generate Content Handler
  const onGenerate = async (input) => {
    if (!userDetail?.name) {
      setOpenDialog(true);
      return;
    }
    if (userDetail?.token < 10) {
      toast.error("Insufficient tokens! Please upgrade your account.", {
        description: "You need at least 10 tokens to generate content",
        action: { label: "Upgrade", onClick: () => router.push("/pricing") },
      });
      return;
    }
    setIsLoading(true);
    try {
      const needsWebBrowsing = /browse|search|look up/i.test(input);
      const needsAPI = /api|data|fetch/i.test(input);
      const needsDependencies = /install|dependency|package/i.test(input);
      let enhancedPrompt = `${input}\n\nAdditional requirements: Create a modern, visually stunning UI with glassmorphism effects, gradients, and subtle animations. Ensure all images load properly using reliable Unsplash URLs. Make the design production-ready and error-free.`;
      if (needsWebBrowsing && capabilities[0].active)
        toast.info("Web browsing capability activated", {
          icon: <Globe className="w-4 h-4" />,
        });
      if (needsAPI && capabilities[1].active)
        toast.info("API integration capability activated", {
          icon: <Code className="w-4 h-4" />,
        });
      if (needsDependencies && capabilities[2].active)
        toast.info("Dependency management capability activated", {
          icon: <Package className="w-4 h-4" />,
        });
      const msg = { role: "user", content: enhancedPrompt };
      setMessages(msg);
      if (typeof setIsGenerating === "function") setIsGenerating(true);
      const workspaceId = await CreateWorkspace({
        user: userDetail._id,
        messages: [msg],
      });
      router.push(`/workspace/${workspaceId}`);
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Failed to generate content", {
        description: error.message || "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Capability
  const toggleCapability = (index) => {
    setCapabilities((prev) =>
      prev.map((cap, i) =>
        i === index ? { ...cap, active: !cap.active } : cap
      )
    );
  };

  return (
    <div
      ref={containerRef}
      className="min-h-[90vh] flex flex-col items-center justify-center p-6 relative overflow-hidden"
    >
      {/* Dynamic Background with Optimized Image */}
      <div className="absolute inset-0 z-0">
        {backgroundImage && (
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-slate-900/90 to-indigo-950/80">
            <OptimizedImage
              src={backgroundImage}
              alt="Abstract background"
              className="w-full h-full object-cover mix-blend-overlay opacity-50"
              style={{
                animation: "slowPulse 15s ease-in-out infinite",
                filter: "blur(8px)",
              }}
              priority
            />
          </div>
        )}
      </div>

      {/* Interactive Particles */}
      <div className="absolute inset-0 z-1">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            }}
            initial={false}
            animate={{ left: `${particle.x}px`, top: `${particle.y}px` }}
            transition={{ duration: 0.1, ease: "linear" }}
          />
        ))}
      </div>

      {/* Decorative Floating Elements */}
      <div className="absolute top-20 right-10 z-5">
        <motion.div
          className="w-44 h-44 rounded-full bg-gradient-to-r from-blue-500/30 to-purple-600/30 filter blur-3xl"
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.05, 1],
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <div className="absolute bottom-20 left-10 z-5">
        <motion.div
          className="w-64 h-64 rounded-full bg-gradient-to-r from-fuchsia-500/20 to-cyan-500/20 filter blur-3xl"
          animate={{
            y: [0, 20, 0],
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>
      <div className="absolute top-1/3 left-1/4 z-5">
        <motion.div
          className="w-32 h-32 rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/20 filter blur-3xl"
          animate={{
            y: [0, 15, 0],
            scale: [1, 1.08, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      {/* Main Content */}
      <motion.div
        className="flex flex-col items-center max-w-3xl w-full space-y-8 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Logo and Title */}
        <motion.div
          className="flex items-center space-x-3 mb-2"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-md"></div>
            <Command className="w-10 h-10 text-primary relative z-10" />
          </div>
          <h1 className="text-3xl font-light tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            FRODO
          </h1>
        </motion.div>

        {/* Hero Text */}
        <motion.h2
          className="text-4xl md:text-6xl font-bold text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500">
            {Lookup.HERO_HEADING}
          </span>
        </motion.h2>
        <motion.p
          className="text-xl text-slate-300/90 text-center max-w-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {Lookup.HERO_DESC}
        </motion.p>

        {/* Capabilities */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 w-full"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          {capabilities.map((capability, index) => (
            <button
              key={index}
              onClick={() => toggleCapability(index)}
              className={`px-4 py-2 rounded-lg backdrop-blur-md border border-white/10 transition-all duration-300 flex items-center gap-2 ${
                capability.active
                  ? "bg-primary/20 text-primary border-primary/30 shadow-lg shadow-primary/10"
                  : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"
              }`}
            >
              {capability.icon}
              {capability.label}
              <div
                className={`w-3 h-3 rounded-full ml-1 ${capability.active ? "bg-green-400" : "bg-slate-600"}`}
              ></div>
            </button>
          ))}
        </motion.div>

        {/* Input Area */}
        <motion.div
          className="w-full max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <div
            className={`backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/20 ${isExpanded ? "border-primary/20 shadow-lg shadow-primary/10" : ""}`}
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 px-2">
                <Command className="w-4 h-4 text-slate-400" />
                <div className="h-5 w-px bg-slate-700"></div>
                <div className="flex space-x-1">
                  {capabilities
                    .filter((cap) => cap.active)
                    .map((cap, i) => (
                      <span
                        key={i}
                        className="w-2 h-2 rounded-full bg-primary"
                        title={cap.label}
                      ></span>
                    ))}
                </div>
                <div className="ml-auto flex space-x-2">
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-slate-400 hover:text-primary transition-colors"
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>
              </div>
              <textarea
                ref={textareaRef}
                placeholder={Lookup.INPUT_PLACEHOLDER}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onFocus={() => setIsExpanded(true)}
                className="w-full bg-transparent border-none outline-none resize-none min-h-[100px] text-white placeholder:text-slate-500"
              />
              {isExpanded && (
                <motion.div
                  className="flex justify-between pt-2 border-t border-slate-700/50"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex space-x-2">
                    <button className="p-2 rounded-lg hover:bg-slate-700/30 text-slate-400 hover:text-slate-300 transition-colors">
                      <UploadCloud className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-slate-700/30 text-slate-400 hover:text-slate-300 transition-colors">
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-xs text-slate-500 self-center px-2">
                    {userDetail?.token || 0} tokens available
                  </span>
                </motion.div>
              )}
            </div>
          </div>

          {/* Generate Button */}
          {userInput?.length > 0 && (
            <motion.div
              className="flex justify-end mt-3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <button
                onClick={() => onGenerate(userInput)}
                disabled={isLoading}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium shadow-lg shadow-blue-700/20 hover:shadow-blue-700/40 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-70 disabled:pointer-events-none flex items-center space-x-2"
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
            </motion.div>
          )}
        </motion.div>

        {/* Suggestions */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          {Lookup?.SUGGSTIONS.map((suggestion, index) => (
            <motion.button
              key={index}
              onClick={() => onGenerate(suggestion)}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { delay: 1.2 + index * 0.1 },
              }}
              className="backdrop-blur-md bg-white/5 border border-white/10 px-4 py-2 rounded-full text-sm text-slate-300 hover:text-primary hover:border-primary/20 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 flex items-center gap-2"
            >
              <Sparkles className="w-3 h-3 text-primary" />
              {suggestion}
            </motion.button>
          ))}
        </motion.div>

        {/* Powered By */}
        <motion.div
          className="text-xs text-slate-500 mt-8 flex items-center gap-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.5 }}
        >
          <span>Powered by</span>
          <span className="text-primary font-medium">Frodo AI</span>
          <span>•</span>
          <span>Cutting-edge website generation</span>
        </motion.div>
      </motion.div>

      {/* Sign In Dialog */}
      <SignInDialog
        openDialog={openDialog}
        closeDialog={(v) => setOpenDialog(v)}
      />

      {/* Global Styles */}
      <style jsx global>{`
        :root {
          --primary-color: rgb(99, 102, 241);
          --primary-light: rgba(99, 102, 241, 0.2);
        }
        .text-primary {
          color: var(--primary-color);
        }
        .bg-primary {
          background-color: var(--primary-color);
        }
        .bg-primary\/20 {
          background-color: var(--primary-light);
        }
        .border-primary\/20 {
          border-color: rgba(99, 102, 241, 0.2);
        }
        .border-primary\/30 {
          border-color: rgba(99, 102, 241, 0.3);
        }
        .shadow-primary\/10 {
          --tw-shadow-color: rgba(99, 102, 241, 0.1);
        }
        @keyframes slowPulse {
          0%,
          100% {
            transform: scale(1);
            filter: brightness(1);
          }
          50% {
            transform: scale(1.05);
            filter: brightness(1.1);
          }
        }
        @keyframes gradientFlow {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .text-gradient {
          background: linear-gradient(to right, #3b82f6, #8b5cf6, #ec4899);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          text-fill-color: transparent;
          animation: gradientFlow 8s ease infinite;
        }
      `}</style>
    </div>
  );
}

export default Hero;
