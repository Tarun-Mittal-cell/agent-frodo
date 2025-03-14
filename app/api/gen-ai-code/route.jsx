// app/api/gen-ai-code/route.jsx
import { NextResponse } from "next/server";
import { GenAiCode } from "@/configs/AiModel";

export const maxDuration = 300;

export async function POST(req) {
  const { prompt } = await req.json();

  // Check if streaming is requested via query parameter
  const searchParams = req.nextUrl?.searchParams;
  const streamRequested = searchParams?.get("stream") === "true";

  try {
    if (streamRequested) {
      // Streaming implementation
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            // Use native fetch API to create a stream
            const response = await fetch(
              "https://api.anthropic.com/v1/messages",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "X-API-Key": process.env.ANTHROPIC_API_KEY,
                  "Anthropic-Version": "2023-06-01",
                },
                body: JSON.stringify({
                  model: "claude-3-opus-20240229",
                  max_tokens: 4000,
                  messages: [{ role: "user", content: prompt }],
                  stream: true,
                }),
              }
            );

            if (!response.ok) {
              throw new Error(`Anthropic API error: ${response.status}`);
            }

            // Process Server-Sent Events (SSE) from Anthropic
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk
                .split("\n")
                .filter((line) => line.trim() !== "");

              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  const data = line.slice(6);
                  if (data === "[DONE]") continue;

                  try {
                    const parsed = JSON.parse(data);
                    if (
                      parsed.type === "content_block_delta" &&
                      parsed.delta?.text
                    ) {
                      controller.enqueue(encoder.encode(parsed.delta.text));
                    }
                  } catch (e) {
                    console.error("Error parsing SSE data:", e);
                  }
                }
              }
            }

            controller.close();
          } catch (error) {
            console.error("Streaming error:", error);
            controller.error(error);
          }
        },
      });

      // Return the stream with appropriate headers
      return new NextResponse(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    } else {
      // Traditional non-streaming implementation (compatible with existing code)
      const result = await GenAiCode.sendMessage(prompt);
      const resp = result.response.text();
      return NextResponse.json(JSON.parse(resp));
    }
  } catch (e) {
    console.error("Error in gen-ai-code:", e);
    return NextResponse.json({ error: e.message });
  }
}
