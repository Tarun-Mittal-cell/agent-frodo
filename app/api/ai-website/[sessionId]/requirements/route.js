// app/api/ai-website/[sessionId]/requirements/route.js
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

    if (!session.requirements) {
      return NextResponse.json(
        {
          success: false,
          error: "Requirements not available yet",
        },
        { status: 404 }
      );
    }

    // Return requirements
    return NextResponse.json({
      success: true,
      requirements: session.requirements,
    });
  } catch (error) {
    console.error("Error getting requirements:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}
