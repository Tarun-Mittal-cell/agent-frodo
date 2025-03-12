import { NextResponse } from "next/server";
import connectToDatabase from "../../../lib/mongodb";
import Workspace from "../../../models/Workspace";

export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (userId) {
      // GetAllWorkspace functionality
      const workspaces = await Workspace.find({ user: userId }).sort({
        createdAt: -1,
      }); // desc order as in Convex

      return NextResponse.json(workspaces);
    }

    const workspaces = await Workspace.find({});
    return NextResponse.json(workspaces);
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();

    // Parse the request body
    const data = await request.json();
    console.log("Creating workspace with data:", JSON.stringify(data, null, 2));

    // Validate required fields
    if (!data.user) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Create workspace with default values for optional fields
    const workspace = await Workspace.create({
      messages: data.messages || [],
      user: data.user,
      createdAt: Date.now(),
      fileData: data.fileData || [],
    });

    console.log("Workspace created:", workspace._id);

    return NextResponse.json(workspace);
  } catch (error) {
    console.error("Error creating workspace:", error);
    return NextResponse.json(
      {
        error: error.message,
        details: error.stack,
      },
      { status: 500 }
    );
  }
}
