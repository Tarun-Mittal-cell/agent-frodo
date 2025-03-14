// app/api/ai-website/[sessionId]/status/route.js
import { NextResponse } from "next/server";
import { getSession } from "../../../../lib/SessionStore";

export async function GET(request, { params }) {
  try {
    const { sessionId } = params;

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: "Session ID is required",
        },
        { status: 400 }
      );
    }

    // Get session data
    const session = getSession(sessionId);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "Session not found",
        },
        { status: 404 }
      );
    }

    // Return status info (without sending the entire session data)
    return NextResponse.json({
      success: true,
      status: session.status,
      progress: session.progress,
      message: session.message,
      previewUrl: session.previewUrl,
      hasRequirements: !!session.requirements,
      hasDiagrams: !!session.diagrams,
      hasCode: !!session.code,
      error: session.error,
      filesGenerated: session.generatedFiles?.length || 0,
    });
  } catch (error) {
    console.error("Error getting session status:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}
