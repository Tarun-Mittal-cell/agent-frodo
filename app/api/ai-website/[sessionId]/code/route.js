// app/api/ai-website/[sessionId]/code/route.js
import { NextResponse } from "next/server";
import { activeSessions } from "../route";

export async function GET(request, { params }) {
  try {
    const { sessionId } = params;
    const session = activeSessions.get(sessionId);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "Session not found",
        },
        { status: 404 }
      );
    }

    if (!session.code) {
      return NextResponse.json(
        {
          success: false,
          error: "Generated code not available yet",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      code: session.code,
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
