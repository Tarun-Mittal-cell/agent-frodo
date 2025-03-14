// app/api/gen-ai-code/route.jsx
import { NextResponse } from "next/server";
import { GenAiCode } from "@/configs/AiModel";

export const maxDuration = 300;

export async function POST(req) {
  const { prompt } = await req.json();
  const searchParams = req.nextUrl?.searchParams;
  const streamRequested = searchParams?.get("stream") === "true";

  console.log("ANTHROPIC_API_KEY in use:", process.env.ANTHROPIC_API_KEY);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY is not set");
    return NextResponse.json(
      { error: "Server configuration error: Missing API key" },
      { status: 500 }
    );
  }

  try {
    if (streamRequested) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            const response = await fetch(
              "https://api.anthropic.com/v1/messages",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "x-api-key": process.env.ANTHROPIC_API_KEY,
                  "anthropic-version": "2023-06-01",
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
              const errorText = await response.text();
              throw new Error(
                `Anthropic API error: ${response.status} - ${errorText}`
              );
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                controller.enqueue(
                  encoder.encode("event: done\ndata: Stream completed\n\n")
                );
                break;
              }

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
                      const eventData = JSON.stringify({
                        text: parsed.delta.text,
                      });
                      controller.enqueue(
                        encoder.encode(`data: ${eventData}\n\n`)
                      );
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
            controller.enqueue(
              encoder.encode(
                `event: error\ndata: ${JSON.stringify({ message: error.message })}\n\n`
              )
            );
            controller.close();
          }
        },
      });

      return new NextResponse(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    } else {
      const result = await GenAiCode.sendMessage(prompt);
      const resp = result.response.text();
      return NextResponse.json(JSON.parse(resp));
    }
  } catch (e) {
    console.error("Error in gen-ai-code:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
