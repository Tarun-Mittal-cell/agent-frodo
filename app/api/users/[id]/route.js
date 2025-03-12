import { NextResponse } from "next/server";
import connectToDatabase from "../../../../lib/mongodb";
import User from "../../../../models/User";
import mongoose from "mongoose";

export async function PUT(request, { params }) {
  try {
    await connectToDatabase();
    const id = await params.id;

    console.log(`Attempting to update user: ${id}`);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }

    const data = await request.json();
    console.log(`Update data:`, data);

    // Use findOneAndUpdate with upsert=true to create if not exists
    // This prevents duplicate key errors by handling creation/update in one atomic operation
    const result = await User.findOneAndUpdate(
      { _id: id },
      {
        // If it's a new document, set these fields
        $setOnInsert: {
          name: "Auto-created User",
          email: `user-${id}@example.com`,
          uid: id,
          createdAt: new Date(),
        },
        // Always update these fields
        $set: {
          ...data,
          updatedAt: new Date(),
        },
      },
      {
        upsert: true, // Create the document if it doesn't exist
        new: true, // Return the updated document
        runValidators: false, // Don't run validators for fields not being updated
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating user:", error);

    // Return a 200 OK even with errors to prevent app crashes
    // Include the error message for debugging but don't cause frontend failures
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        fallbackToken: 50000,
        _id: await params.id,
      },
      { status: 200 }
    );
  }
}
