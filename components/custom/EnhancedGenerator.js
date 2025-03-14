// components/custom/EnhancedGenerator.js
// Enhanced website generator component with modern UI capabilities

import React, { useState, useEffect } from "react";
import { Sandpack } from "@codesandbox/sandpack-react";
import {
  Check,
  RefreshCw,
  Code,
  Laptop,
  Image,
  Wand2,
  Settings,
  PanelLeft,
} from "lucide-react";
import AiModel from "../../configs/AiModel";
import AutonomousControls from "./AutonomousControls";
import UIComponents from "../../lib/UIComponents";
import ImageUtils from "../../lib/ImageUtils";
import Animations from "../../lib/Animations";

/**
 * EnhancedGenerator component provides an advanced UI for generating
 * and previewing websites with Frodo's enhanced AI capabilities.
 */
const EnhancedGenerator = ({ apiKey, defaultTheme = "dark" }) => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedCode, setGeneratedCode] = useState(null);
  const [activeTab, setActiveTab] = useState("editor"); // editor, preview, autonomous
  const [theme, setTheme] = useState(defaultTheme);
  const [enhancementOptions, setEnhancementOptions] = useState({
    useGlassmorphism: true,
    useAnimations: true,
    useGradients: true,
    enhanceImages: true,
    darkModeSupport: true,
  });
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(false);
  const [designStyle, setDesignStyle] = useState("modern"); // modern, minimal, glassmorphic, gradient

  // Sample templates for quick generation
  const templates = [
    {
      name: "Portfolio",
      prompt:
        "Create a modern portfolio website for a UX designer with a hero section, about section, projects showcase, testimonials, and contact form.",
    },
    {
      name: "E-commerce",
      prompt:
        "Build an e-commerce product page with product gallery, pricing information, add to cart functionality, related products, and customer reviews.",
    },
    {
      name: "Dashboard",
      prompt:
        "Create a modern analytics dashboard with charts, statistics cards, recent activity feed, and user profile section.",
    },
    {
      name: "Landing Page",
      prompt:
        "Design a SaaS landing page with hero section, features, pricing table, testimonials, and newsletter signup.",
    },
  ];

  // Apply enhancement options to the prompt
  const getEnhancedPrompt = () => {
    let enhancedPrompt = prompt;

    if (enhancementOptions.useGlassmorphism) {
      enhancedPrompt +=
        " Use glass morphism effects (bg-white/10 backdrop-blur-md) for cards and overlays.";
    }

    if (enhancementOptions.useAnimations) {
      enhancedPrompt +=
        " Add subtle animations for hover states and transitions between elements.";
    }

    if (enhancementOptions.useGradients) {
      enhancedPrompt +=
        " Use gradient backgrounds and text effects for visual interest.";
    }

    if (enhancementOptions.enhanceImages) {
      enhancedPrompt +=
        " Use high-quality images from Unsplash with proper loading attributes.";
    }

    if (enhancementOptions.darkModeSupport) {
      enhancedPrompt += " Include dark mode support with a theme toggle.";
    }

    enhancedPrompt += ` Use a ${designStyle} design style.`;

    return enhancedPrompt;
  };

  // Generate website code
  const generateWebsite = async () => {
    if (!prompt) return;

    setLoading(true);
    setError(null);

    try {
      // Get enhanced prompt with all options
      const enhancedPrompt = getEnhancedPrompt();

      // Generate website code using the enhanced AiModel
      const result = await AiModel.generateWebsite(enhancedPrompt);

      // Additional processing to ensure all images and components are enhanced
      const enhancedResult = enhanceCodeOutput(result);

      setGeneratedCode(enhancedResult);
      setActiveTab("preview");
    } catch (error) {
      console.error("Generation error:", error);
      setError(error.message || "Failed to generate website");
    } finally {
      setLoading(false);
    }
  };

  // Enhance the code output with improved images and components
  const enhanceCodeOutput = (result) => {
    // Deep clone the result
    const enhancedResult = JSON.parse(JSON.stringify(result));

    // Process each file to enhance images and components
    if (enhancedResult.files) {
      Object.keys(enhancedResult.files).forEach((filePath) => {
        let code = enhancedResult.files[filePath].code;

        // Replace any placeholder images with reliable ones from ImageUtils
        code = ImageUtils.replacePlaceholderUrls(code);

        // Add animation classes where appropriate (simple replacement for demonstration)
        if (enhancementOptions.useAnimations) {
          // Add hover animations to buttons
          code = code.replace(
            /(className="[^"]*)(hover:bg-[^"]*")(\s*>)/g,
            `$1$2 transition-all duration-300 hover:scale-105 active:scale-95$3`
          );

          // Add fade-in animations to sections
          code = code.replace(
            /(<section[^>]*className="[^"]*")(\s*>)/g,
            `$1 animate-in fade-in duration-1000$2`
          );
        }

        // Update the processed code
        enhancedResult.files[filePath].code = code;
      });
    }

    return enhancedResult;
  };

  // Handle template selection
  const selectTemplate = (templatePrompt) => {
    setPrompt(templatePrompt);
  };

  // Toggle an enhancement option
  const toggleOption = (option) => {
    setEnhancementOptions({
      ...enhancementOptions,
      [option]: !enhancementOptions[option],
    });
  };

  // Handle autonomous agent result
  const handleAutonomousResult = (result) => {
    console.log("Autonomous agent result:", result);
    // In a real implementation, this would process the autonomous agent's output
    // and update the UI accordingly
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl overflow-hidden">
          <div className="border-b border-slate-200 dark:border-slate-700">
            <div className="flex">
              <button
                onClick={() => setActiveTab("editor")}
                className={`px-6 py-4 font-medium flex items-center ${
                  activeTab === "editor"
                    ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                    : "text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
              >
                <Code className="w-5 h-5 mr-2" />
                Code Editor
              </button>

              <button
                onClick={() => setActiveTab("preview")}
                disabled={!generatedCode}
                className={`px-6 py-4 font-medium flex items-center ${
                  !generatedCode
                    ? "text-slate-400 dark:text-slate-600 cursor-not-allowed"
                    : activeTab === "preview"
                      ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                      : "text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
              >
                <Laptop className="w-5 h-5 mr-2" />
                Preview
              </button>

              <button
                onClick={() => setActiveTab("autonomous")}
                className={`px-6 py-4 font-medium flex items-center ${
                  activeTab === "autonomous"
                    ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                    : "text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
              >
                <Wand2 className="w-5 h-5 mr-2" />
                Autonomous Mode
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === "editor" && (
              <div>
                <div className="mb-6">
                  <label
                    htmlFor="prompt"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                  >
                    Describe the website you want to create
                  </label>
                  <textarea
                    id="prompt"
                    rows="4"
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
                    placeholder="Create a modern portfolio website with a hero section, about me, projects showcase, and contact form..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="flex flex-wrap gap-3 mb-6">
                  {templates.map((template, index) => (
                    <button
                      key={index}
                      onClick={() => selectTemplate(template.prompt)}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                      {template.name} Template
                    </button>
                  ))}
                </div>

                <div className="flex justify-between items-center mb-6">
                  <button
                    onClick={() =>
                      setAdvancedSettingsOpen(!advancedSettingsOpen)
                    }
                    className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    {advancedSettingsOpen ? "Hide" : "Show"} Advanced Settings
                  </button>

                  <div className="flex items-center">
                    <button
                      onClick={() =>
                        setTheme(theme === "dark" ? "light" : "dark")
                      }
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors mr-4"
                    >
                      {theme === "dark" ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                          />
                        </svg>
                      )}
                    </button>

                    <button
                      onClick={generateWebsite}
                      disabled={!prompt || loading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-5 h-5 mr-2" />
                          Generate Website
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {advancedSettingsOpen && (
                  <div className="bg-slate-100 dark:bg-slate-700 rounded-xl p-6 mb-6 animate-in fade-in duration-300">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                      Advanced Settings
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-3">
                          Design Style
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {[
                            "modern",
                            "minimal",
                            "glassmorphic",
                            "gradient",
                          ].map((style) => (
                            <button
                              key={style}
                              onClick={() => setDesignStyle(style)}
                              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                                designStyle === style
                                  ? "bg-blue-600 text-white"
                                  : "bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200"
                              }`}
                            >
                              {style.charAt(0).toUpperCase() + style.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-3">
                          Enhancement Options
                        </h4>
                        <div className="space-y-2">
                          {Object.keys(enhancementOptions).map((option) => (
                            <label key={option} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={enhancementOptions[option]}
                                onChange={() => toggleOption(option)}
                                className="w-4 h-4 text-blue-600 bg-slate-100 dark:bg-slate-700 rounded border-slate-300 dark:border-slate-600 focus:ring-blue-500"
                              />
                              <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                                {option
                                  .replace(/([A-Z])/g, " $1")
                                  .replace(/^./, (str) => str.toUpperCase())}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-4 rounded-lg mb-6">
                    <p className="flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2" />
                      {error}
                    </p>
                  </div>
                )}

                {generatedCode && (
                  <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 p-4 rounded-lg mb-6">
                    <p className="flex items-center">
                      <Check className="w-5 h-5 mr-2" />
                      Website generated successfully! Click the Preview tab to
                      see the result.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "preview" && generatedCode && (
              <div className="h-[70vh]">
                <Sandpack
                  theme={theme}
                  template="react"
                  files={generatedCode.files}
                  options={{
                    showNavigator: true,
                    showLineNumbers: true,
                  }}
                />
              </div>
            )}

            {activeTab === "autonomous" && (
              <div>
                <AutonomousControls
                  apiKey={apiKey}
                  onResult={handleAutonomousResult}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedGenerator;
