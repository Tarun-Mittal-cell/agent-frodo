import { NextResponse } from "next/server";

// Maximum duration for the API request
export const maxDuration = 60;

export async function POST(request) {
  try {
    // Parse the request body
    const requestData = await request.json();

    // Extract prompt, handling different possible formats
    let promptText;

    if (typeof requestData === "object") {
      if (requestData.prompt) {
        promptText = requestData.prompt;
      } else if (requestData.text) {
        promptText = requestData.text;
      } else if (requestData.content) {
        promptText = requestData.content;
      } else if (requestData.message) {
        promptText = requestData.message;
      } else {
        // If no recognized prompt field, convert the entire object to a string
        promptText = JSON.stringify(requestData).substring(0, 1000);
      }
    } else if (typeof requestData === "string") {
      promptText = requestData;
    } else {
      promptText = String(requestData);
    }

    // Make sure we have a valid prompt string
    if (
      !promptText ||
      typeof promptText !== "string" ||
      promptText.trim() === ""
    ) {
      console.error("Invalid or missing prompt:", requestData);
      return NextResponse.json(
        { error: "A valid text prompt is required" },
        { status: 400 }
      );
    }

    // Limit prompt length for Stability API
    promptText = promptText.trim().substring(0, 1900);

    // Add quality modifiers unless they already exist
    if (
      !promptText.toLowerCase().includes("high quality") &&
      !promptText.toLowerCase().includes("detailed")
    ) {
      promptText =
        `${promptText}. High quality, detailed, professional.`.substring(
          0,
          1950
        );
    }

    console.log("Generating image with prompt length:", promptText.length);

    // Get API key from environment variables
    const apiKey = process.env.NEXT_PUBLIC_STABILITY_API_KEY;

    if (!apiKey) {
      console.error("Missing Stability API key");
      return NextResponse.json(
        { error: "Server configuration error: Missing API key" },
        { status: 500 }
      );
    }

    // Using Stability AI for image generation
    const response = await fetch(
      "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          text_prompts: [
            {
              text: promptText,
              weight: 1,
            },
          ],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          samples: 1,
          steps: 30,
          style_preset: "photographic",
        }),
      }
    );

    if (!response.ok) {
      let errorMessage = `API error: ${response.status} ${response.statusText}`;

      try {
        const errorData = await response.json();
        console.error("Stability API error details:", errorData);
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        console.error("Error parsing error response:", parseError);
      }

      // If we get rate limited or quota exceeded, return specific error
      if (response.status === 429) {
        return NextResponse.json(
          {
            error: "Rate limit exceeded. Please try again later.",
            rateLimit: true,
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const responseData = await response.json();

    if (!responseData.artifacts || responseData.artifacts.length === 0) {
      console.error("No image was generated in the response:", responseData);
      return NextResponse.json(
        { error: "No image was generated" },
        { status: 500 }
      );
    }

    console.log("Successfully generated image");

    // Return base64 encoded image
    return NextResponse.json({
      imageBase64: `data:image/png;base64,${responseData.artifacts[0].base64}`,
      model: "stable-diffusion-xl",
      prompt: promptText,
    });
  } catch (error) {
    console.error("Error in generate image API:", error);
    return NextResponse.json(
      {
        error:
          "Failed to generate image: " + (error.message || "Unknown error"),
      },
      { status: 500 }
    );
  }
}
