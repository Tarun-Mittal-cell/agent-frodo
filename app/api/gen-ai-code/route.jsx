import { GenAiCode } from "@/configs/AiModel";
import { NextResponse } from "next/server";

// Set maximum duration for the API route (in seconds)
export const maxDuration = 300;

/**
 * @route POST /api/gen-ai-code
 * @desc Generates website code using an AI model based on the provided prompt
 * @access Public
 * @param {Object} req - Request object containing the user prompt
 * @param {string} req.body.prompt - The user-provided prompt for website generation
 * @returns {Object} Generated website code in JSON format or error
 */
export async function POST(req) {
  try {
    const { prompt } = await req.json();

    // Validate input
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Prompt must be a non-empty string" },
        { status: 400 }
      );
    }

    // Enhance the prompt to instruct the AI on how to handle images
    const enhancedPrompt = `${prompt}\n\nWhen including images in the website, use the /api/generate-image endpoint with an appropriate prompt parameter based on the website's theme or content. For example, for a website about cats, include an image with <img src="/api/generate-image?prompt=cats" alt="Cats Image" />. Ensure the prompt parameter is descriptive and matches the website's context.`;

    // Send the enhanced prompt to the AI model
    const result = await GenAiCode.sendMessage(enhancedPrompt);
    const resp = result.response.text();

    // Parse and return the AI-generated code
    return NextResponse.json(JSON.parse(resp));
  } catch (error) {
    console.error("Error generating website code:", {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: "Failed to generate website code" },
      { status: 500 }
    );
  }
}
