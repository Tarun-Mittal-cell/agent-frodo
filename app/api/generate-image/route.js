import { LRUCache } from "lru-cache";
import { NextResponse } from "next/server";

// Initialize an in-memory cache with a 5-minute TTL and max 500 entries
const cache = new LRUCache({ max: 500, ttl: 300000 }); // 5 minutes in milliseconds

/**
 * @route GET /api/generate-image
 * @desc Generates an image using Stability AI's Stable Diffusion model
 * @access Public
 * @param {string} request.query.prompt - Text prompt for image generation
 * @returns {Response} Image binary data or error
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const prompt = searchParams.get("prompt");

    // Input validation
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Prompt must be a non-empty string" },
        { status: 400 }
      );
    }

    const cacheKey = `image_${prompt.trim()}`;
    const cachedImage = cache.get(cacheKey);

    if (cachedImage && cachedImage.imageBinary) {
      // Return cached image as binary data
      return new Response(cachedImage.imageBinary, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=86400", // Cache for 24 hours
        },
      });
    }

    // Configure Stability AI API request
    const stabilityApiUrl =
      "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image";
    const apiKey = process.env.STABILITY_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is missing or invalid" },
        { status: 500 }
      );
    }

    try {
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

      // Convert base64 to binary for direct image serving
      const imageBinary = Buffer.from(data.artifacts[0].base64, "base64");

      // Cache the binary data
      cache.set(cacheKey, { imageBinary });

      // Return the image directly as binary data
      return new Response(imageBinary, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=86400", // Cache for 24 hours
        },
      });
    } catch (error) {
      if (error.name === "AbortError") {
        return NextResponse.json(
          { error: "Request timed out" },
          { status: 504 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Error in generate image GET API:", {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
    const { prompt } = await request.json();

    // Input validation
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Prompt must be a non-empty string" },
        { status: 400 }
      );
    }

    const cacheKey = `image_${prompt.trim()}`;
    const cachedImage = cache.get(cacheKey);

    if (cachedImage && cachedImage.imageBinary) {
      // Return cached image as base64 in JSON response
      return NextResponse.json({
        imageBase64: `data:image/png;base64,${cachedImage.imageBinary.toString("base64")}`,
        model: "stable-diffusion-xl",
      });
    }

    // Configure Stability AI API request
    const stabilityApiUrl =
      "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image";
    const apiKey = process.env.STABILITY_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is missing or invalid" },
        { status: 500 }
      );
    }

    try {
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

      // Convert base64 to binary for caching
      const imageBinary = Buffer.from(data.artifacts[0].base64, "base64");
      cache.set(cacheKey, { imageBinary });

      // Return the base64 image directly from the API response
      return NextResponse.json({
        imageBase64: `data:image/png;base64,${data.artifacts[0].base64}`,
        model: "stable-diffusion-xl",
      });
    } catch (error) {
      if (error.name === "AbortError") {
        return NextResponse.json(
          { error: "Request timed out" },
          { status: 504 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Error in generate image POST API:", {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Configuration for Next.js API route
export const config = {
  runtime: "nodejs",
};
