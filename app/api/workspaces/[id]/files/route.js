import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../../lib/mongodb';
import Workspace from '../../../../../models/Workspace';

export async function PUT(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;
    const { files } = await request.json();
    
    // UpdateFiles functionality
    if (!files) {
      return NextResponse.json(
        { success: false, message: "No files provided" }, 
        { status: 400 }
      );
    }
    
    const workspace = await Workspace.findByIdAndUpdate(
      id,
      { fileData: files },
      { new: true }
    );
    
    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }
    
    return NextResponse.json(workspace);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
