// app/api/ai-website/[sessionId]/cleanup/route.js
import { NextResponse } from "next/server";
import { activeSessions } from "../route";

export async function POST(request, { params }) {
  try {
    const { sessionId } = params;
    const session = activeSessions.get(sessionId);

    if (session && session.agent) {
      // Clean up resources
      await session.agent.cleanup();
    }

    // Remove from active sessions
    activeSessions.delete(sessionId);

    return NextResponse.json({
      success: true,
      message: "Session cleaned up",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
