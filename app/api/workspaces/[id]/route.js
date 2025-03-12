import { NextResponse } from "next/server";
import connectToDatabase from "../../../../lib/mongodb";
import Workspace from "../../../../models/Workspace";
import mongoose from "mongoose";

/**
 * GET a workspace by ID
 */
export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const id = params.id;

    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log(`Invalid workspace ID format: ${id}`);
      return NextResponse.json(
        { error: "Invalid workspace ID format" },
        { status: 400 }
      );
    }

    const workspace = await Workspace.findById(id);

    if (!workspace) {
      console.log(`Workspace not found with ID: ${id}`);
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    console.log(`Fetched workspace: ${id}`);
    return NextResponse.json(workspace);
  } catch (error) {
    console.error("Error fetching workspace:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PUT to update a workspace
 */
export async function PUT(request, { params }) {
  try {
    await connectToDatabase();
    const id = params.id;

    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log(`Invalid workspace ID format: ${id}`);
      return NextResponse.json(
        { error: "Invalid workspace ID format" },
        { status: 400 }
      );
    }

    const data = await request.json();
    console.log(
      `Updating workspace ${id} with data:`,
      JSON.stringify(data, null, 2)
    );

    const workspace = await Workspace.findByIdAndUpdate(id, data, {
      new: true,
    });

    if (!workspace) {
      console.log(`Workspace not found with ID: ${id}`);
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    console.log(`Updated workspace: ${id}`);
    return NextResponse.json(workspace);
  } catch (error) {
    console.error("Error updating workspace:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PATCH for partial updates
 */
export async function PATCH(request, { params }) {
  try {
    await connectToDatabase();
    const id = params.id;

    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log(`Invalid workspace ID format: ${id}`);
      return NextResponse.json(
        { error: "Invalid workspace ID format" },
        { status: 400 }
      );
    }

    const data = await request.json();
    console.log(
      `Patching workspace ${id} with data:`,
      JSON.stringify(data, null, 2)
    );

    const workspace = await Workspace.findByIdAndUpdate(
      id,
      { $set: data }, // Use $set for partial updates
      { new: true }
    );

    if (!workspace) {
      console.log(`Workspace not found with ID: ${id}`);
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    console.log(`Patched workspace: ${id}`);
    return NextResponse.json(workspace);
  } catch (error) {
    console.error("Error patching workspace:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE a workspace
 */
export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();
    const id = params.id;

    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log(`Invalid workspace ID format: ${id}`);
      return NextResponse.json(
        { error: "Invalid workspace ID format" },
        { status: 400 }
      );
    }

    const workspace = await Workspace.findByIdAndDelete(id);

    if (!workspace) {
      console.log(`Workspace not found with ID: ${id}`);
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    console.log(`Deleted workspace: ${id}`);
    return NextResponse.json({
      success: true,
      message: "Workspace deleted successfully",
      id: id,
    });
  } catch (error) {
    console.error("Error deleting workspace:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
