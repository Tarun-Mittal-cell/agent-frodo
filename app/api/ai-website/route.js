// app/api/ai-website/route.js
import { NextResponse } from "next/server";
import IntegratedAgent from "../../../lib/IntegratedAgent";
import { createSession, updateSession } from "../../../lib/SessionStore";
import { emitToSession } from "../../../lib/WebSocketServer";
import crypto from "crypto";

export async function POST(request) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Valid prompt is required",
        },
        { status: 400 }
      );
    }

    // Create session ID
    const sessionId = crypto.randomUUID();

    // Initialize agent
    const agent = new IntegratedAgent();

    // Create new session
    createSession(sessionId, {
      agent,
      prompt,
      status: "initializing",
      progress: 0,
    });

    // Start generation process (non-blocking)
    startGeneration(sessionId, prompt, agent);

    return NextResponse.json({
      success: true,
      sessionId,
      message: "Website generation started",
    });
  } catch (error) {
    console.error("Error starting generation:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}

/**
 * Start the generation process in the background
 * @param {string} sessionId - The session ID
 * @param {string} prompt - User's prompt
 * @param {IntegratedAgent} agent - Agent instance
 */
async function startGeneration(sessionId, prompt, agent) {
  try {
    // Set up status event handler
    agent.on("status:update", (data) => {
      updateSession(sessionId, {
        status: data.phase,
        message: data.message,
        progress: data.progress,
      });

      // Emit to WebSocket
      emitToSession(sessionId, "status-update", data);
    });

    // Set up requirements event handler
    agent.on("requirements:ready", (requirements) => {
      updateSession(sessionId, { requirements });
      emitToSession(sessionId, "requirements-update", requirements);
    });

    // Set up diagrams event handler
    agent.on("diagrams:ready", (diagrams) => {
      updateSession(sessionId, { diagrams });
      emitToSession(sessionId, "diagrams-update", diagrams);
    });

    // Set up code event handlers
    agent.on("file:generated", (file) => {
      const session = updateSession(sessionId, {
        generatedFiles: [...(session?.generatedFiles || []), file],
      });

      emitToSession(sessionId, "file-update", file);
    });

    // Set up streaming events for real-time updates
    agent.on("stream:update", (data) => {
      emitToSession(sessionId, "stream-update", data);
    });

    // Handle errors
    agent.on("error", (error) => {
      updateSession(sessionId, {
        status: "error",
        error: error.message || "An unknown error occurred",
      });

      emitToSession(sessionId, "error", {
        message: error.message || "An unknown error occurred",
      });
    });

    // Start the generation
    const result = await agent.generateWebsite(prompt, {
      streamingEnabled: true,
    });

    // Update session with final results
    updateSession(sessionId, {
      status: "completed",
      progress: 100,
      code: result.code,
      previewUrl: result.previewUrl,
      outputDir: result.outputDir,
      completed: true,
      completedAt: Date.now(),
    });

    // Final event
    emitToSession(sessionId, "generation-complete", {
      previewUrl: result.previewUrl,
      outputDir: result.outputDir,
    });
  } catch (error) {
    console.error(
      `Error in generation process for session ${sessionId}:`,
      error
    );

    // Update session with error
    updateSession(sessionId, {
      status: "error",
      error: error.message || "An unknown error occurred",
      progress: 0,
    });

    // Emit error event
    emitToSession(sessionId, "error", {
      message: error.message || "An unknown error occurred",
    });
  }
}
