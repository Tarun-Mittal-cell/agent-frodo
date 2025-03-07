import { NextResponse } from "next/server";
import NodeCache from "lru-cache";

// Initialize an in-memory cache with a 5-minute TTL and max 500 entries
const cache = new NodeCache({ max: 500, ttl: 300000 }); // 5 minutes in milliseconds

/**
 * @route POST /api/generate-image
 * @desc Generates an image using Stability AI's Stable Diffusion model
 * @access Public
 * @param {Object} request.body - Request body
 * @param {string} request.body.prompt - Text prompt for image generation
 * @returns {Object} Response with base64-encoded image or error
 */
export async function POST(request) {
  try {
    // Parse request body
    const { prompt } = await request.json();

    // Input validation
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Prompt must be a non-empty string" },
        { status: 400 }
      );
    }

    // Cache check
    const cacheKey = `image_${prompt.trim()}`;
    const cachedImage = cache.get(cacheKey);
    if (cachedImage) {
      return NextResponse.json(cachedImage);
    }

    // Configure Stability AI API request
    const stabilityApiUrl =
      "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image";
    const apiKey = process.env.STABILITY_API_KEY; // Ensure this is server-side only
    if (!apiKey) {
      throw new Error("STABILITY_API_KEY is not configured");
    }

    const response = await fetch(stabilityApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        text_prompts: [{ text: prompt.trim(), weight: 1 }],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        samples: 1,
        steps: 30,
      }),
      signal: AbortSignal.timeout(10000), // 10-second timeout
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Stability API error:", {
        status: response.status,
        message: errorData.message || "Unknown error",
        details: errorData,
      });

      if (response.status === 429) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again later." },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: "Failed to generate image" },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!Array.isArray(data.artifacts) || !data.artifacts[0]?.base64) {
      return NextResponse.json(
        { error: "Invalid image data from Stability API" },
        { status: 500 }
      );
    }

    // Prepare response with base64 image
    const imageResponse = {
      imageBase64: `data:image/png;base64,${data.artifacts[0].base64}`,
      model: "stable-diffusion-xl",
    };

    // Cache the result
    cache.set(cacheKey, imageResponse);

    return NextResponse.json(imageResponse);
  } catch (error) {
    console.error("Error in generate image API:", {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const config = {
  runtime: "nodejs", // Explicitly set to ensure server-side execution
};
