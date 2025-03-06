import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal,
  Code,
  Braces,
  Cpu,
  Layers,
  Rocket,
  Zap,
  Shield,
  Github,
  CheckCircle,
  Globe,
  Database,
} from "lucide-react";

export default function FrodoLandingPage() {
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState("features");
  const [isCodeVisible, setIsCodeVisible] = useState(false);
  const [loadingState, setLoadingState] = useState("loading");
  const terminalRef = useRef(null);
  const [terminalText, setTerminalText] = useState("");

  // Terminal typing animation
  useEffect(() => {
    if (loadingState === "loading") {
      const texts = [
        "> Initializing Tenzin 1.0 core systems...",
        "> Loading neural architecture...",
        "> Engaging Chromaflow orchestration...",
        "> Activating multi-agent workflow system...",
        "> FRODO AI system ready.",
      ];

      let currentTextIndex = 0;
      let currentCharIndex = 0;
      let timeoutId;

      const typeText = () => {
        if (currentTextIndex < texts.length) {
          const currentFullText = texts[currentTextIndex];

          if (currentCharIndex < currentFullText.length) {
            setTerminalText(
              (prev) => prev + currentFullText.charAt(currentCharIndex)
            );
            currentCharIndex++;
            timeoutId = setTimeout(typeText, 30);
          } else {
            setTerminalText((prev) => prev + "\n");
            currentTextIndex++;
            currentCharIndex = 0;
            timeoutId = setTimeout(typeText, 500);
          }
        } else {
          setLoadingState("complete");
        }
      };

      timeoutId = setTimeout(typeText, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [loadingState]);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalText]);

  // Sample code for display
  const sampleCode = `// Autonomous code generation with FRODO
import { Chromaflow } from '@octave-x/tenzin';

// Initialize the multi-agent system
const frodo = new Chromaflow.Agent({
  capabilities: ['frontend', 'backend', 'database'],
  autonomyLevel: 'full',
  systemPrompt: \`You are FRODO, an autonomous coding
    assistant that builds complete applications from
    natural language descriptions.\`
});

// Start autonomous development session
const project = await frodo.createProject({
  description: "Build a 3D interactive dashboard with 
    real-time data visualization and user authentication",
  stack: {
    frontend: "React + Three.js",
    backend: "Node.js",
    database: "MongoDB"
  },
  features: [
    "User authentication",
    "Real-time data updates",
    "3D visualization of metrics",
    "Responsive design",
    "Dark mode support"
  ]
});

// FRODO will autonomously:
// 1. Plan the application architecture
// 2. Generate code for all components
// 3. Test functionality
// 4. Debug and optimize
// 5. Deploy the completed application`;

  // Features content
  const features = [
    {
      title: "Autonomous Development",
      icon: <Cpu className="w-6 h-6 text-blue-400" />,
      description:
        "FRODO autonomously creates complete applications from natural language descriptions, from planning to deployment.",
    },
    {
      title: "Tenzin 1.0 Core",
      icon: <Zap className="w-6 h-6 text-yellow-400" />,
      description:
        "Powered by our breakthrough small language model technology for unprecedented speed and efficiency.",
    },
    {
      title: "Chromaflow Orchestration",
      icon: <Layers className="w-6 h-6 text-purple-400" />,
      description:
        "Seamlessly orchestrates multiple specialized agents for optimal performance across frontend, backend, and database tasks.",
    },
    {
      title: "Multi-Agent Workflow",
      icon: <Database className="w-6 h-6 text-green-400" />,
      description:
        "Specialized agents collaborate to solve complex development challenges with expert-level quality.",
    },
    {
      title: "24/7 Continuous Learning",
      icon: <Globe className="w-6 h-6 text-cyan-400" />,
      description:
        "Constantly improves by learning from new technologies, patterns, and best practices.",
    },
    {
      title: "Enterprise-Grade Security",
      icon: <Shield className="w-6 h-6 text-red-400" />,
      description:
        "Built with security-first principles to protect your code, data, and intellectual property.",
    },
  ];

  // Loading animation
  if (loadingState === "loading") {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-200 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 relative">
              <div className="absolute inset-0 bg-blue-500 rounded-lg opacity-20 animate-ping"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Braces className="h-8 w-8 text-blue-400" />
              </div>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 text-transparent bg-clip-text">
              FRODO
            </h2>
          </div>

          <div
            ref={terminalRef}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4 h-80 overflow-y-auto font-mono text-sm text-green-400 mb-6"
          >
            {terminalText}
            <span className="inline-block w-2 h-4 bg-green-500 animate-pulse ml-1"></span>
          </div>

          <div className="flex justify-between">
            <div>
              <p className="text-gray-400 text-sm">Powered by</p>
              <p className="text-gray-300">
                Tenzin 1.0 • Chromaflow • Octave-X
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
              <span className="text-gray-400 text-sm">
                Initializing system...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${darkMode ? "bg-gray-950 text-gray-200" : "bg-gray-100 text-gray-900"}`}
    >
      {/* Dynamic background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black to-gray-950 opacity-80"></div>
        <div
          className={`absolute top-40 -left-20 w-96 h-96 rounded-full bg-blue-700 mix-blend-screen filter blur-3xl opacity-20 animate-blob`}
        ></div>
        <div
          className={`absolute bottom-40 -right-20 w-96 h-96 rounded-full bg-purple-700 mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000`}
        ></div>
        <div
          className={`absolute top-1/3 right-1/4 w-96 h-96 rounded-full bg-emerald-700 mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-4000`}
        ></div>
      </div>

      <div className="relative z-10">
        {/* Header/Navigation */}
        <header className="py-6 border-b border-gray-800/50">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="relative h-10 w-10"
                >
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 blur opacity-70"></div>
                  <div className="absolute inset-0.5 rounded-lg bg-gray-950 flex items-center justify-center">
                    <Braces className="h-5 w-5 text-blue-400" />
                  </div>
                </motion.div>
                <motion.h1
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-2xl font-bold tracking-tight"
                >
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 text-transparent bg-clip-text">
                    FRODO
                  </span>
                </motion.h1>
              </div>

              <motion.nav
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="hidden md:block"
              >
                <ul className="flex items-center gap-6">
                  <li>
                    <button
                      onClick={() => setActiveTab("features")}
                      className={`px-2 py-1 transition-colors ${activeTab === "features" ? "text-blue-400" : "text-gray-400 hover:text-gray-300"}`}
                    >
                      Features
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab("technology")}
                      className={`px-2 py-1 transition-colors ${activeTab === "technology" ? "text-blue-400" : "text-gray-400 hover:text-gray-300"}`}
                    >
                      Technology
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab("documentation")}
                      className={`px-2 py-1 transition-colors ${activeTab === "documentation" ? "text-blue-400" : "text-gray-400 hover:text-gray-300"}`}
                    >
                      Documentation
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab("pricing")}
                      className={`px-2 py-1 transition-colors ${activeTab === "pricing" ? "text-blue-400" : "text-gray-400 hover:text-gray-300"}`}
                    >
                      Pricing
                    </button>
                  </li>
                </ul>
              </motion.nav>

              <div className="flex items-center gap-3">
                <motion.button
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  onClick={() => setDarkMode(!darkMode)}
                  className={`p-2 rounded-full transition-colors ${darkMode ? "bg-gray-800 text-yellow-400 hover:bg-gray-700" : "bg-white text-gray-800 hover:bg-gray-200"}`}
                  aria-label="Toggle dark mode"
                >
                  {darkMode ? "🌞" : "🌙"}
                </motion.button>

                <motion.a
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  href="#"
                  className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-500 hover:to-purple-500 transition-all duration-300 shadow-lg shadow-blue-900/20"
                >
                  <Rocket className="w-4 h-4" />
                  <span>Get Started</span>
                </motion.a>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.7 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
                >
                  Revolutionizing{" "}
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 text-transparent bg-clip-text">
                    Software Development
                  </span>
                </motion.h2>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  className="text-lg text-gray-400 mb-8 max-w-lg"
                >
                  Transform your development workflow with FRODO - The world's
                  most advanced AI coding agent powered by breakthrough Small
                  Language Model technology.
                </motion.p>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="flex flex-wrap gap-4"
                >
                  <a
                    href="#"
                    className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium 
                    shadow-lg shadow-blue-900/20 transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/30 hover:scale-105 active:scale-95"
                  >
                    Get Started Free
                  </a>

                  <a
                    href="#"
                    className="px-6 py-3 rounded-lg bg-gray-800/50 backdrop-blur-sm border border-gray-700 text-white font-medium 
                    transition-all duration-300 hover:bg-gray-800 hover:scale-105 active:scale-95"
                  >
                    View Demo
                  </a>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.3 }}
                  className="mt-8 flex items-center gap-1"
                >
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full border-2 border-gray-950 overflow-hidden"
                      >
                        <img
                          src={`https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&q=80`}
                          alt="User avatar"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <span className="ml-2 text-gray-400 text-sm">
                    Join{" "}
                    <span className="text-blue-400 font-medium">2,500+</span>{" "}
                    developers using FRODO
                  </span>
                </motion.div>
              </div>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-xl rounded-xl"></div>
                <div className="relative rounded-xl overflow-hidden border border-gray-800/50 bg-gray-900/80 backdrop-blur-sm shadow-xl">
                  <div className="flex items-center gap-2 border-b border-gray-800 px-4 py-3">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="text-xs text-gray-400 flex-1 text-center">
                      FRODO Autonomous Coding
                    </div>
                  </div>

                  <div className="p-4 font-mono text-sm overflow-hidden">
                    <pre className="text-gray-300 whitespace-pre-wrap">
                      <code>{sampleCode}</code>
                    </pre>
                  </div>

                  <div className="border-t border-gray-800 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-green-400 text-xs">
                      <CheckCircle className="w-4 h-4" />
                      <span>Code ready for production</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400 text-xs">
                      <Terminal className="w-3 h-3" />
                      <span>Generated in 12.4s</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 border-t border-gray-800/50">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Powered by{" "}
                <span className="bg-gradient-to-r from-purple-400 to-emerald-400 text-transparent bg-clip-text">
                  Tenzin 1.0
                </span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Breakthrough small language model technology offering
                unprecedented speed, accuracy, and efficiency for development
                workflows.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl transform group-hover:translate-x-1 group-hover:translate-y-1 transition-transform duration-300"></div>
                  <div className="relative p-6 bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-xl hover:border-gray-700 transition-colors duration-300">
                    <div className="mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="mt-16 text-center"
            >
              <a
                href="#"
                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <span>Learn more about our technology</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </a>
            </motion.div>
          </div>
        </section>

        {/* Chromaflow Section */}
        <section className="py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20"></div>
          <div className="container mx-auto px-6 relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.7 }}
                className="order-2 lg:order-1"
              >
                <div className="relative p-1 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500">
                  <div className="bg-gray-950 p-6 rounded-lg">
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        "Frontend",
                        "Backend",
                        "Database",
                        "Testing",
                        "DevOps",
                        "Security",
                      ].map((agent, index) => (
                        <div
                          key={agent}
                          className="flex flex-col items-center p-3 rounded bg-gray-900/60 backdrop-blur-sm border border-gray-800"
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-2">
                            <Code className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-xs text-center text-gray-300">
                            {agent}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 flex items-center justify-center">
                      <div className="px-4 py-2 rounded bg-gray-900/60 backdrop-blur-sm border border-gray-800 text-center">
                        <div className="text-sm font-medium text-blue-400 mb-1">
                          Chromaflow Engine
                        </div>
                        <div className="text-xs text-gray-400">
                          Multi-Agent Orchestration
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 text-center">
                      <div className="inline-block px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 text-xs">
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                          All systems operational
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.7 }}
                className="order-1 lg:order-2"
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
                    Chromaflow
                  </span>{" "}
                  Orchestration Engine
                </h2>

                <p className="text-gray-400 mb-6">
                  Our proprietary Chromaflow technology seamlessly orchestrates
                  multiple specialized agents for optimal performance across the
                  entire development stack.
                </p>

                <ul className="space-y-4 mb-8">
                  {[
                    "Intelligent task distribution between specialized agents",
                    "Real-time communication and coordination",
                    "Automated conflict resolution and code integration",
                    "Continuous learning from each development session",
                    "Self-optimizing workflow based on project requirements",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="mt-1 min-w-[20px]">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      </div>
                      <span className="text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="#"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/50 backdrop-blur-sm border border-gray-700 text-white font-medium 
                    transition-all duration-300 hover:bg-gray-800 hover:scale-105 active:scale-95"
                >
                  <span>Explore Chromaflow</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </a>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 relative overflow-hidden border-t border-gray-800/50">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7 }}
              className="relative p-8 md:p-12 rounded-2xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-purple-600/30 backdrop-blur-sm"></div>
              <div className="absolute inset-0 bg-gray-950/50"></div>

              <div className="relative">
                <div className="text-center max-w-2xl mx-auto mb-8">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Experience the Future of Development
                  </h2>
                  <p className="text-gray-300">
                    Join thousands of developers leveraging FRODO to build
                    faster, smarter, and more efficiently.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                  {[
                    {
                      title: "Free Tier",
                      price: "$0",
                      features: [
                        "5 projects per month",
                        "Basic Tenzin model",
                        "Community support",
                        "Standard response time",
                      ],
                    },
                    {
                      title: "Pro",
                      price: "$49",
                      features: [
                        "Unlimited projects",
                        "Advanced Tenzin 1.0",
                        "Priority support",
                        "Faster response time",
                        "Custom agents",
                      ],
                    },
                    {
                      title: "Enterprise",
                      price: "Custom",
                      features: [
                        "Unlimited everything",
                        "Full Chromaflow access",
                        "Dedicated support",
                        "On-premise option",
                        "Custom integration",
                      ],
                    },
                  ].map((plan, index) => (
                    <div
                      key={plan.title}
                      className={`rounded-xl overflow-hidden ${index === 1 ? "border-2 border-blue-500 relative" : "border border-gray-700"}`}
                    >
                      {index === 1 && (
                        <div className="absolute top-0 inset-x-0 bg-blue-500 text-xs py-1 text-center text-white font-medium">
                          MOST POPULAR
                        </div>
                      )}

                      <div
                        className={`bg-gray-900/80 backdrop-blur-sm p-6 ${index === 1 ? "pt-8" : ""}`}
                      >
                        <h3 className="text-xl font-semibold mb-2">
                          {plan.title}
                        </h3>
                        <p className="text-3xl font-bold mb-4">
                          {plan.price}
                          <span className="text-sm text-gray-400 font-normal">
                            {plan.price === "Custom" ? "" : "/month"}
                          </span>
                        </p>

                        <ul className="space-y-2 mb-6">
                          {plan.features.map((feature, i) => (
                            <li
                              key={i}
                              className="text-sm text-gray-300 flex items-start gap-2"
                            >
                              <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <button
                          className={`w-full py-2 rounded-lg ${index === 1 ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white" : "bg-gray-800 text-gray-200"} font-medium transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]`}
                        >
                          Get Started
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 border-t border-gray-800/50">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4">
                Trusted by Innovative Teams
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                See what developers and companies are saying about their
                experience with FRODO.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  quote:
                    "FRODO has completely transformed our development workflow. What used to take days now takes hours, and the code quality is exceptional.",
                  author: "Sarah Chen",
                  role: "Lead Developer",
                  company: "TechNova",
                },
                {
                  quote:
                    "The Chromaflow orchestration is mind-blowing. The way it handles both frontend and backend development simultaneously is nothing short of revolutionary.",
                  author: "Michael Rodriguez",
                  role: "CTO",
                  company: "DataSphere",
                },
                {
                  quote:
                    "We've reduced our development time by 70% while improving code quality. The Tenzin core provides intelligent solutions that even our senior developers learn from.",
                  author: "Jasmine Washington",
                  role: "Engineering Manager",
                  company: "Quantum Solutions",
                },
              ].map((testimonial, index) => (
                <motion.div
                  key={testimonial.author}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="bg-gray-900/40 backdrop-blur-sm border border-gray-800 rounded-xl p-6"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className="w-5 h-5 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  <p className="text-gray-300 mb-6">{testimonial.quote}</p>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-400"></div>
                    <div>
                      <p className="font-medium">{testimonial.author}</p>
                      <p className="text-sm text-gray-400">
                        {testimonial.role}, {testimonial.company}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Technical Overview */}
        <section className="py-16 border-t border-gray-800/50">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.7 }}
              >
                <h2 className="text-3xl font-bold mb-6">
                  Technical Excellence
                </h2>
                <p className="text-gray-400 mb-6">
                  FRODO combines cutting-edge AI with software engineering best
                  practices to deliver exceptional results.
                </p>

                <div className="space-y-6">
                  <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-800 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Code className="w-4 h-4 text-blue-400" />
                      </div>
                      <h3 className="font-medium">
                        Intelligent Code Generation
                      </h3>
                    </div>
                    <div className="pl-11">
                      <p className="text-sm text-gray-400">
                        FRODO generates contextually aware, production-ready
                        code that follows best practices and modern design
                        patterns.
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-800 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-purple-400" />
                      </div>
                      <h3 className="font-medium">Real-time Collaboration</h3>
                    </div>
                    <div className="pl-11">
                      <p className="text-sm text-gray-400">
                        Seamlessly collaborate with FRODO in real-time,
                        providing feedback and refinements as your application
                        evolves.
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-800 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <Shield className="w-4 h-4 text-emerald-400" />
                      </div>
                      <h3 className="font-medium">Secure Development</h3>
                    </div>
                    <div className="pl-11">
                      <p className="text-sm text-gray-400">
                        Built with security-first principles to protect your
                        code, data, and intellectual property throughout the
                        development process.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="aspect-square max-w-md mx-auto relative"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5/6 h-5/6 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 animate-pulse"></div>
                </div>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="w-2/3 h-2/3 rounded-full border border-blue-500/30 flex items-center justify-center animate-spin"
                    style={{ animationDuration: "15s" }}
                  >
                    {[0, 60, 120, 180, 240, 300].map((rotation, i) => (
                      <div
                        key={i}
                        className="absolute w-3 h-3 rounded-full bg-blue-500"
                        style={{
                          transform: `rotate(${rotation}deg) translateX(140px)`,
                        }}
                      ></div>
                    ))}
                  </div>
                </div>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="w-1/2 h-1/2 rounded-full border border-purple-500/30 flex items-center justify-center animate-spin"
                    style={{
                      animationDuration: "10s",
                      animationDirection: "reverse",
                    }}
                  >
                    {[0, 72, 144, 216, 288].map((rotation, i) => (
                      <div
                        key={i}
                        className="absolute w-2 h-2 rounded-full bg-purple-500"
                        style={{
                          transform: `rotate(${rotation}deg) translateX(90px)`,
                        }}
                      ></div>
                    ))}
                  </div>
                </div>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Get Started / Final CTA */}
        <section className="py-16 bg-gradient-to-r from-blue-900/30 to-purple-900/30">
          <div className="container mx-auto px-6 text-center">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7 }}
              className="max-w-2xl mx-auto"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Transform Your Development Workflow?
              </h2>
              <p className="text-gray-300 mb-8">
                Experience the future of software development with FRODO, Tenzin
                1.0, and Chromaflow technology.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="#"
                  className="px-8 py-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium 
                  shadow-lg shadow-blue-900/20 transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/30 hover:scale-105 active:scale-95"
                >
                  Get Started Free
                </a>

                <a
                  href="#"
                  className="px-8 py-4 rounded-lg bg-gray-800/50 backdrop-blur-sm border border-gray-700 text-white font-medium 
                  transition-all duration-300 hover:bg-gray-800 hover:scale-105 active:scale-95"
                >
                  Schedule Demo
                </a>
              </div>

              <p className="mt-6 text-gray-400 text-sm">
                No credit card required. Start building amazing software in
                minutes.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-gray-800/50">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="relative h-8 w-8">
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 blur opacity-70"></div>
                    <div className="absolute inset-0.5 rounded-md bg-gray-950 flex items-center justify-center">
                      <Braces className="h-4 w-4 text-blue-400" />
                    </div>
                  </div>
                  <span className="text-xl font-bold">FRODO</span>
                </div>

                <p className="text-gray-400 text-sm mb-4">
                  Revolutionizing software development with breakthrough AI
                  technology.
                </p>

                <div className="flex gap-4">
                  {["twitter", "github", "linkedin", "youtube"].map(
                    (social) => (
                      <a
                        key={social}
                        href="#"
                        className="text-gray-400 hover:text-blue-400 transition-colors"
                      >
                        <span className="sr-only">{social}</span>
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                      </a>
                    )
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">
                  Product
                </h4>
                <ul className="space-y-2">
                  {[
                    "Features",
                    "Pricing",
                    "Integrations",
                    "Roadmap",
                    "Changelog",
                  ].map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">
                  Resources
                </h4>
                <ul className="space-y-2">
                  {[
                    "Documentation",
                    "API Reference",
                    "Tutorials",
                    "Blog",
                    "Community",
                  ].map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">
                  Company
                </h4>
                <ul className="space-y-2">
                  {["About Us", "Careers", "Press", "Contact", "Partners"].map(
                    (item) => (
                      <li key={item}>
                        <a
                          href="#"
                          className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                        >
                          {item}
                        </a>
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-500 text-sm">
                © 2025 Octave-X. All rights reserved.
              </p>

              <div className="flex gap-8 mt-4 md:mt-0">
                <a
                  href="#"
                  className="text-gray-500 hover:text-blue-400 transition-colors text-sm"
                >
                  Privacy Policy
                </a>
                <a
                  href="#"
                  className="text-gray-500 hover:text-blue-400 transition-colors text-sm"
                >
                  Terms of Service
                </a>
                <a
                  href="#"
                  className="text-gray-500 hover:text-blue-400 transition-colors text-sm"
                >
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
