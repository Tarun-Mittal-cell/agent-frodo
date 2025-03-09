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
  Rocket,
  Clock,
  Hexagon,
  Cpu,
  Eye,
  Terminal,
  Braces,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SignInDialog from "./SignInDialog";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ImageUtils from "@/lib/ImageUtils";
import axios from "axios";

function Hero() {
  // Context and state
  const { messages, setMessages } = useContext(MessagesContext);
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const actionContext = useContext(ActionContext);
  const setIsGenerating = actionContext?.setIsGenerating;

  // State variables
  const [userInput, setUserInput] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [timerValue, setTimerValue] = useState(0);
  const [hexRotation, setHexRotation] = useState(0);
  const [hoverEffects, setHoverEffects] = useState({});
  const [typingEffect, setTypingEffect] = useState("");
  const [currentTypingIndex, setCurrentTypingIndex] = useState(0);
  const [showExamples, setShowExamples] = useState(false);

  // Capabilities with enhanced styling
  const [capabilities, setCapabilities] = useState([
    {
      icon: <Globe className="w-5 h-5" />,
      label: "Web Browsing",
      active: true,
      description: "Search and analyze web content in real-time",
      color: "from-emerald-400 to-cyan-400",
    },
    {
      icon: <Code className="w-5 h-5" />,
      label: "API Integration",
      active: true,
      description: "Connect with third-party services seamlessly",
      color: "from-cyan-400 to-blue-400",
    },
    {
      icon: <Package className="w-5 h-5" />,
      label: "Dependency Management",
      active: true,
      description: "Handle packages and libraries automatically",
      color: "from-blue-400 to-indigo-400",
    },
    {
      icon: <Layers className="w-5 h-5" />,
      label: "Advanced UI",
      active: true,
      description: "Create stunning visual interfaces with zero effort",
      color: "from-teal-400 to-emerald-400",
    },
    {
      icon: <Terminal className="w-5 h-5" />,
      label: "Code Generation",
      active: true,
      description: "Production-ready code with best practices",
      color: "from-indigo-400 to-blue-500",
    },
  ]);

  // Examples of generated websites (mockup data)
  const exampleProjects = [
    {
      title: "Quantum Dashboard",
      description: "Analytics platform with real-time data visualization",
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
      tags: ["Dashboard", "Analytics", "Real-time"],
    },
    {
      title: "Nebula Commerce",
      description: "Next-gen e-commerce with 3D product views",
      image:
        "https://images.unsplash.com/photo-1551808525-51a94da548ce?q=80&w=2233&auto=format&fit=crop",
      tags: ["E-commerce", "3D", "Animation"],
    },
    {
      title: "Pulse Social",
      description: "Social media platform with advanced interaction",
      image:
        "https://images.unsplash.com/photo-1545987796-200677ee1011?q=80&w=2070&auto=format&fit=crop",
      tags: ["Social", "Messaging", "Profiles"],
    },
  ];

  // Refs
  const [particles, setParticles] = useState([]);
  const particlesRef = useRef([]);
  const containerRef = useRef(null);
  const textareaRef = useRef(null);
  const animationFrameRef = useRef(null);
  const timerRef = useRef(null);
  const typingIntervalRef = useRef(null);

  // Mutations
  const CreateWorkspace = useMutation(api.workspace.CreateWorkspace);
  const router = useRouter();

  // Initialize component
  useEffect(() => {
    // Set the background
    const image = ImageUtils.getRandomImage("abstract") || {
      url: "https://images.unsplash.com/photo-1597733336794-12d05021d510?q=80&w=2574&auto=format&fit=crop",
    };
    setBackgroundImage(image.url);

    // Create interactive particles
    initParticles();

    // Start the hex logo rotation
    const rotationInterval = setInterval(() => {
      setHexRotation((prev) => (prev + 1) % 360);
    }, 100);

    // Start typing effect for the hero heading
    startTypingEffect();

    // Auto-focus textarea
    if (textareaRef.current) {
      textareaRef.current.focus();
    }

    // Cleanup on unmount
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }

      clearInterval(rotationInterval);
    };
  }, []);

  // Typing effect animation
  const startTypingEffect = () => {
    const targetText = Lookup.HERO_HEADING || "Build Next-Gen Websites with AI";
    let index = 0;

    setTypingEffect("");

    typingIntervalRef.current = setInterval(() => {
      if (index <= targetText.length) {
        setTypingEffect(targetText.substring(0, index));
        index++;
      } else {
        clearInterval(typingIntervalRef.current);
        setTimeout(startTypingEffect, 5000); // Restart after a delay
      }
    }, 50);
  };

  // Timer functionality
  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => {
        setTimerValue((prev) => prev + 0.1);
      }, 100);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerActive]);

  // Initialize the interactive particle effect
  const initParticles = () => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newParticles = [];

    // Create more complex particles with varied properties
    for (let i = 0; i < 80; i++) {
      // Determine if this is a special accent particle
      const isAccent = Math.random() > 0.8;
      const size = isAccent ? Math.random() * 6 + 2 : Math.random() * 3 + 1;

      // Generate colors matching the logo's gradient
      let color;
      if (isAccent) {
        // Accent colors (bright teal/cyan/blue)
        const hue = Math.floor(Math.random() * 60) + 160; // Range from teal to blue
        color = `hsla(${hue}, 100%, 70%, ${Math.random() * 0.7 + 0.3})`;
      } else {
        // Regular particles (more subtle)
        const hue = Math.floor(Math.random() * 40) + 170;
        color = `hsla(${hue}, 100%, 70%, ${Math.random() * 0.3 + 0.1})`;
      }

      newParticles.push({
        id: i,
        x: Math.random() * containerRect.width,
        y: Math.random() * containerRect.height,
        size: size,
        vx: (Math.random() - 0.5) * 0.5 * (isAccent ? 1.5 : 1),
        vy: (Math.random() - 0.5) * 0.5 * (isAccent ? 1.5 : 1),
        color: color,
        pulse: Math.random() * 2 * Math.PI, // For pulsing effect
        pulseSpeed: Math.random() * 0.05 + 0.01,
        glow: isAccent ? 20 : 10,
      });
    }

    particlesRef.current = newParticles;
    setParticles(newParticles);

    // Animated particles
    const animateParticles = () => {
      if (!containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();

      particlesRef.current = particlesRef.current.map((particle) => {
        // Update position
        let newX = particle.x + particle.vx;
        let newY = particle.y + particle.vy;

        // Bounce off walls
        if (newX <= 0 || newX >= containerRect.width) {
          particle.vx *= -1;
          newX = particle.x + particle.vx;
        }

        if (newY <= 0 || newY >= containerRect.height) {
          particle.vy *= -1;
          newY = particle.y + particle.vy;
        }

        // Update pulse phase
        const newPulse = particle.pulse + particle.pulseSpeed;

        // Calculate size variation based on pulse
        const sizeVariation = 1 + Math.sin(newPulse) * 0.2; // 20% size variation

        return {
          ...particle,
          x: newX,
          y: newY,
          pulse: newPulse,
          currentSize: particle.size * sizeVariation,
        };
      });

      setParticles([...particlesRef.current]);
      animationFrameRef.current = requestAnimationFrame(animateParticles);
    };

    animationFrameRef.current = requestAnimationFrame(animateParticles);
  };

  // Handle generation process
  const onGenerate = async (input) => {
    if (!userDetail?.name) {
      setOpenDialog(true);
      return;
    }

    if (userDetail?.token < 10) {
      toast.error("Insufficient tokens! Please upgrade your account.", {
        description: "You need at least 10 tokens to generate content",
        action: {
          label: "Upgrade",
          onClick: () => router.push("/pricing"),
        },
      });
      return;
    }

    setIsLoading(true);
    setTimerActive(true);
    setTimerValue(0);

    try {
      // Feature detection logic
      const needsWebBrowsing =
        input.toLowerCase().includes("browse") ||
        input.toLowerCase().includes("search") ||
        input.toLowerCase().includes("look up");

      const needsAPI =
        input.toLowerCase().includes("api") ||
        input.toLowerCase().includes("data") ||
        input.toLowerCase().includes("fetch");

      const needsDependencies =
        input.toLowerCase().includes("install") ||
        input.toLowerCase().includes("dependency") ||
        input.toLowerCase().includes("package");

      let enhancedPrompt = input;

      // Add enhancement instructions
      enhancedPrompt +=
        "\n\nAdditional requirements: Create a modern, visually stunning UI with glass morphism effects, gradients, and subtle animations. Ensure all images load properly using reliable Unsplash URLs. Make the design production-ready and error-free.";

      // Show toast notifications for activated capabilities
      if (needsWebBrowsing && capabilities[0].active) {
        toast.info("Web browsing capability activated", {
          icon: <Globe className="w-4 h-4 text-cyan-400" />,
          style: { background: "rgba(0,0,0,0.8)", borderColor: "#22d3ee" },
        });
      }

      if (needsAPI && capabilities[1].active) {
        toast.info("API integration capability activated", {
          icon: <Code className="w-4 h-4 text-blue-400" />,
          style: { background: "rgba(0,0,0,0.8)", borderColor: "#60a5fa" },
        });
      }

      if (needsDependencies && capabilities[2].active) {
        toast.info("Dependency management capability activated", {
          icon: <Package className="w-4 h-4 text-indigo-400" />,
          style: { background: "rgba(0,0,0,0.8)", borderColor: "#818cf8" },
        });
      }

      const msg = {
        role: "user",
        content: enhancedPrompt,
      };

      setMessages(msg);

      // Check if setIsGenerating is a function before calling it
      if (typeof setIsGenerating === "function") {
        setIsGenerating(true);
      }

      // Create workspace
      const workspaceId = await CreateWorkspace({
        user: userDetail._id,
        messages: [msg],
      });

      router.push("/workspace/" + workspaceId);
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Failed to generate content", {
        description: error.message || "An unexpected error occurred",
        style: { background: "rgba(0,0,0,0.8)", borderColor: "#f87171" },
      });
      setTimerActive(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle capability status
  const toggleCapability = (index) => {
    const newCapabilities = [...capabilities];
    newCapabilities[index].active = !newCapabilities[index].active;
    setCapabilities(newCapabilities);

    // Show animation effect when toggling
    setHoverEffects((prev) => ({
      ...prev,
      [index]: true,
    }));

    setTimeout(() => {
      setHoverEffects((prev) => ({
        ...prev,
        [index]: false,
      }));
    }, 700);
  };

  // Format timer display
  const formatTimer = (value) => {
    const seconds = Math.floor(value);
    const decimals = Math.floor((value - seconds) * 10);
    return `${seconds}.${decimals}s`;
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-black"
    >
      {/* Dynamic Background Layer */}
      <div className="absolute inset-0 z-0 bg-black">
        {backgroundImage && (
          <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-black">
            <img
              src={backgroundImage}
              alt="Abstract background"
              className="w-full h-full object-cover mix-blend-overlay opacity-20"
              style={{
                animation: "slowPulse 15s ease-in-out infinite",
                filter: "blur(8px) hue-rotate(140deg) saturate(150%)",
              }}
              loading="eager"
              fetchPriority="high"
            />
          </div>
        )}
      </div>

      {/* Grid Overlay */}
      <div
        className="absolute inset-0 z-1 opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 255, 200, 0.1) 1px, transparent 1px), 
                               linear-gradient(90deg, rgba(0, 255, 200, 0.1) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
          backgroundPosition: "center center",
          animation: "gridShift 120s linear infinite",
        }}
      ></div>

      {/* Interactive Particles */}
      <div className="absolute inset-0 z-1">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              width: `${particle.currentSize || particle.size}px`,
              height: `${particle.currentSize || particle.size}px`,
              backgroundColor: particle.color,
              boxShadow: `0 0 ${particle.glow}px ${particle.color}`,
              opacity: 0.7 + Math.sin(particle.pulse || 0) * 0.3,
            }}
            initial={false}
            animate={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 0.1,
              ease: "linear",
              scale: {
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
              },
            }}
          />
        ))}
      </div>

      {/* Floating Elements - Decorative UI Elements */}
      <div className="absolute top-1/4 right-10 z-5">
        <motion.div
          className="w-96 h-96 rounded-full bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 filter blur-3xl"
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.05, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
      <div className="absolute bottom-1/4 left-10 z-5">
        <motion.div
          className="w-80 h-80 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 filter blur-3xl"
          animate={{
            y: [0, 20, 0],
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      {/* Main Content Wrapper - provides some max width constraints */}
      <div className="max-w-7xl w-full mx-auto relative z-10">
        {/* Main Content */}
        <motion.div
          className="flex flex-col items-center w-full space-y-8 z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Logo and Title */}
          <motion.div
            className="flex items-center space-x-4 mb-2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative">
              <motion.div
                className="w-16 h-16 relative"
                animate={{ rotate: hexRotation }}
                transition={{ duration: 0.1, ease: "linear" }}
              >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <defs>
                    <linearGradient
                      id="logoGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#00ffc8" />
                      <stop offset="100%" stopColor="#0080ff" />
                    </linearGradient>
                  </defs>
                  <motion.path
                    d="M50 0 L93.3 25 L93.3 75 L50 100 L6.7 75 L6.7 25 Z"
                    fill="none"
                    stroke="url(#logoGradient)"
                    strokeWidth="4"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                  />
                  <motion.path
                    d="M25 40 L50 50 L75 40 M50 50 L50 80"
                    fill="none"
                    stroke="url(#logoGradient)"
                    strokeWidth="4"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{
                      duration: 1.5,
                      ease: "easeInOut",
                      delay: 0.5,
                    }}
                  />
                </svg>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-full blur-lg"></div>
              </motion.div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-4xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-400">
                FRODO
              </h1>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-blue-500/20 text-emerald-400 border border-emerald-500/20">
                  BETA 1.1
                </span>
                {timerActive && (
                  <motion.div
                    className="flex items-center space-x-1 bg-black/40 border border-cyan-500/30 rounded-full px-2 py-0.5"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span className="text-xs font-mono text-cyan-400">
                      {formatTimer(timerValue)}
                    </span>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Hero Text with Typing Effect */}
          <motion.h2
            className="text-4xl md:text-6xl font-bold text-center max-w-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={typingEffect}
                className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 inline-block"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {typingEffect || Lookup.HERO_HEADING}
                <motion.span
                  className="inline-block w-1 h-10 ml-1 bg-cyan-400"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </motion.span>
            </AnimatePresence>
          </motion.h2>

          <motion.p
            className="text-xl text-slate-300/90 text-center max-w-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {Lookup.HERO_DESC}
          </motion.p>

          {/* Advanced Capabilities */}
          <motion.div
            className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-4 mt-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            {capabilities.map((capability, index) => (
              <motion.button
                key={index}
                onClick={() => toggleCapability(index)}
                className={`relative overflow-hidden px-4 py-3 rounded-xl backdrop-blur-md border transition-all duration-300 flex flex-col items-start gap-2 h-full
                  ${
                    capability.active
                      ? "bg-gradient-to-br from-black/70 to-black/90 border-cyan-500/30 shadow-lg shadow-cyan-900/20 text-white"
                      : "bg-black/40 border-white/5 text-slate-400 hover:bg-black/60"
                  }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Background gradient element */}
                {capability.active && (
                  <motion.div
                    className={`absolute inset-0 opacity-20 bg-gradient-to-r ${capability.color}`}
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: hoverEffects[index] ? [0.2, 0.4, 0.2] : 0.2,
                    }}
                    transition={{
                      duration: hoverEffects[index] ? 0.7 : 0.3,
                    }}
                  />
                )}

                <div className="flex justify-between w-full">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`p-2 rounded-lg ${capability.active ? `bg-gradient-to-r ${capability.color} bg-opacity-20` : "bg-slate-800/50"}`}
                    >
                      {capability.icon}
                    </div>
                    <span className="font-medium">{capability.label}</span>
                  </div>
                  <div
                    className={`w-3 h-3 rounded-full ${
                      capability.active ? "bg-emerald-400" : "bg-slate-600"
                    }`}
                  ></div>
                </div>

                <p className="text-xs text-slate-400 mt-1">
                  {capability.description}
                </p>
              </motion.button>
            ))}
          </motion.div>

          {/* Input Area */}
          <motion.div
            className="w-full max-w-3xl mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <div
              className={`backdrop-blur-md bg-black/30 border rounded-2xl p-4 transition-all duration-500 
                ${
                  isExpanded
                    ? "border-cyan-500/30 shadow-lg shadow-cyan-900/20"
                    : "border-white/10 hover:border-cyan-500/20 hover:shadow-lg hover:shadow-cyan-900/10"
                }`}
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 px-2">
                  <div className="p-1 rounded-md bg-gradient-to-r from-emerald-500/20 to-blue-500/20">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="h-5 w-px bg-slate-700"></div>
                  <div className="flex space-x-1">
                    {capabilities
                      .filter((cap) => cap.active)
                      .map((cap, i) => (
                        <span
                          key={i}
                          className={`w-2 h-2 rounded-full bg-gradient-to-r ${cap.color}`}
                          title={cap.label}
                        ></span>
                      ))}
                  </div>
                  <div className="ml-auto flex space-x-2">
                    <motion.button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="text-slate-400 hover:text-cyan-400 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </motion.button>
                  </div>
                </div>

                <textarea
                  ref={textareaRef}
                  placeholder={
                    Lookup.INPUT_PLACEHOLDER ||
                    "Describe the website you want to build..."
                  }
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
                      <motion.button
                        className="p-2 rounded-lg hover:bg-cyan-500/10 text-slate-400 hover:text-cyan-400 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <UploadCloud className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        className="p-2 rounded-lg hover:bg-cyan-500/10 text-slate-400 hover:text-cyan-400 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Search className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        className="p-2 rounded-lg hover:bg-cyan-500/10 text-slate-400 hover:text-cyan-400 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Braces className="w-4 h-4" />
                      </motion.button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 animate-pulse" />
                      <span className="text-xs text-slate-300 font-mono">
                        {userDetail?.token || 0} tokens available
                      </span>
                    </div>
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
                <motion.button
                  onClick={() => onGenerate(userInput)}
                  disabled={isLoading}
                  className="px-6 py-3 rounded-xl text-white font-medium shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-70 disabled:pointer-events-none flex items-center space-x-2 relative overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Button background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500"></div>

                  {/* Animated overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-blue-400 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Shine effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
                    animate={{
                      left: ["-100%", "200%"],
                      opacity: [0, 0.2, 0],
                    }}
                    transition={{
                      repeat: Infinity,
                      repeatDelay: 3,
                      duration: 1.5,
                    }}
                  />

                  {/* Button content */}
                  <div className="relative z-10 flex items-center space-x-2">
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
                  </div>
                </motion.button>
              </motion.div>
            )}
          </motion.div>

          {/* Suggestions */}
          <motion.div
            className="flex flex-wrap justify-center gap-2 max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            {(
              Lookup?.SUGGSTIONS || [
                "Build me a modern e-commerce site",
                "Create a portfolio with animations",
                "Design a dashboard with real-time data",
              ]
            ).map((suggestion, index) => (
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
                className="backdrop-blur-md bg-black/40 border border-cyan-500/20 px-4 py-2 rounded-full text-sm text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-900/10 transition-all duration-300 flex items-center gap-2"
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                {suggestion}
              </motion.button>
            ))}
          </motion.div>

          {/* Example Projects */}
          <motion.div
            className="w-full max-w-4xl mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.5 }}
          >
            <div className="flex justify-between items-center mb-4">
              <motion.h3
                className="text-xl font-medium text-white flex items-center gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.6 }}
              >
                <Eye className="w-5 h-5 text-cyan-400" />
                Examples by Frodo
              </motion.h3>

              <motion.button
                onClick={() => setShowExamples(!showExamples)}
                className="text-sm text-cyan-400 hover:text-cyan-300"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.6 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {showExamples ? "Hide Examples" : "Show Examples"}
              </motion.button>
            </div>

            <AnimatePresence>
              {showExamples && (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {exampleProjects.map((project, index) => (
                    <motion.div
                      key={index}
                      className="relative group overflow-hidden rounded-xl border border-cyan-500/20 backdrop-blur-md bg-black/40"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        transition: { delay: 1.7 + index * 0.1 },
                      }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-10"></div>

                      {/* Gradient overlay on hover */}
                      <motion.div className="absolute inset-0 bg-gradient-to-t from-emerald-500/30 to-blue-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />

                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-48 object-cover object-center transition-transform duration-700 ease-in-out group-hover:scale-110"
                      />

                      <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                        <h4 className="text-white font-bold">
                          {project.title}
                        </h4>
                        <p className="text-slate-300 text-sm mt-1">
                          {project.description}
                        </p>

                        <div className="flex flex-wrap gap-1 mt-2">
                          {project.tags.map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* "Powered by" Tag */}
          <motion.div
            className="text-xs text-slate-500 mt-12 flex items-center gap-1.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 2 }}
          >
            <span>Powered by</span>
            <span className="text-cyan-400 font-medium">Frodo AI</span>
            <span>•</span>
            <span>Cutting-edge website generation</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Sign In Dialog */}
      <SignInDialog
        openDialog={openDialog}
        closeDialog={(v) => setOpenDialog(v)}
      />

      {/* Global styles for animations */}
      <style jsx global>{`
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

        @keyframes gridShift {
          0% {
            background-position: 0px 0px;
          }
          100% {
            background-position: 100px 100px;
          }
        }

        .text-gradient {
          background: linear-gradient(to right, #00ffc8, #0080ff);
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
