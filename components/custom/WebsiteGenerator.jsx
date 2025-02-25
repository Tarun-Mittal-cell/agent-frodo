// components/custom/WebsiteGenerator.jsx
"use client";
import React, { useState } from "react";
import { Sandpack } from "@codesandbox/sandpack-react";
import AiModel from "@/configs/AiModel";
import ImageUtils from "@/lib/ImageUtils";
import { Button } from "@/components/ui/button";

export default function WebsiteGenerator() {
  const [prompt, setPrompt] = useState("");
  const [generatedCode, setGeneratedCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateWebsite = async () => {
    if (!prompt) return;

    setLoading(true);
    setError(null);

    try {
      // Generate website with enhanced UI features
      const result = await AiModel.generateWebsite(prompt);
      setGeneratedCode(result);
    } catch (error) {
      console.error("Generation error:", error);
      setError(error.message || "Failed to generate website");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 space-y-4">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-violet-600">
          Generate Modern Websites
        </h2>
        <p className="text-slate-600 dark:text-slate-300 max-w-3xl">
          Describe the website you want to create and Dumpling will generate it
          with beautiful UI, working images, and modern animations.
        </p>

        <div className="flex flex-col space-y-4">
          <textarea
            className="w-full p-4 border rounded-lg resize-none h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Create a modern portfolio website with a hero section, project gallery, and contact form..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
          />

          <div className="flex gap-4">
            <Button
              onClick={generateWebsite}
              disabled={!prompt || loading}
              className="backdrop-blur-md bg-white/10 border border-white/20 shadow-xl transition-all duration-300 hover:shadow-blue-500/20 hover:scale-[1.02]"
            >
              {loading ? "Generating..." : "Generate Website"}
            </Button>

            <Button
              onClick={() => {
                // Example prompts
                setPrompt(
                  "Create a modern SaaS landing page with hero section, features, pricing plans, and testimonials. Use glass morphism effects and gradient backgrounds."
                );
              }}
              variant="outline"
              className="text-sm"
              disabled={loading}
            >
              Example Prompt
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          <p>Error: {error}</p>
        </div>
      )}

      {generatedCode && (
        <div className="space-y-6">
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl shadow-xl p-6">
            <h3 className="text-xl font-bold mb-2">
              {generatedCode.projectTitle}
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              {generatedCode.explanation}
            </p>
          </div>

          <div className="h-[70vh] rounded-xl overflow-hidden border shadow-xl">
            <Sandpack
              theme="dark"
              template="react"
              files={generatedCode.files}
              options={{
                showNavigator: true,
                showLineNumbers: true,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
