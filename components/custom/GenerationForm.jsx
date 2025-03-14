// components/custom/GenerationForm.jsx
import { useState } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

export default function GenerationForm({ onSubmit }) {
  const [prompt, setPrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Example prompts for user guidance
  const examplePrompts = [
    "Create a personal portfolio website with a minimalist design, showcasing my work as a photographer with 3 gallery pages and a contact form.",
    "Generate an e-commerce website for a small bakery with product listings, about page, and order form.",
    "Build a blog website with responsive design, dark mode support, and categories for tech, travel, and food.",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate input
    if (!prompt.trim()) {
      setError("Please enter a description for your website");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      await onSubmit(prompt);
    } catch (err) {
      setError(err.message || "Failed to start generation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const setExamplePrompt = (example) => {
    setPrompt(example);
    setError("");
  };

  return (
    <div className="generation-form-container bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
      <h2 className="text-xl font-semibold mb-4">Describe Your Website</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="prompt"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Enter a detailed description of the website you want to create:
          </label>

          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your website requirements, features, design preferences..."
            rows={6}
            className={`w-full p-3 ${error ? "border-red-500" : "border-gray-300"}`}
            disabled={isSubmitting}
          />

          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>

        <div className="examples mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Or try one of these examples:
          </p>

          <div className="flex flex-wrap gap-2">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setExamplePrompt(example)}
                className="text-xs px-3 py-1 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition"
                disabled={isSubmitting}
              >
                Example {index + 1}
              </button>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Starting Generation..." : "Generate Website"}
        </Button>
      </form>
    </div>
  );
}
