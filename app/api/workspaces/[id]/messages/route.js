import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../../lib/mongodb';
import Workspace from '../../../../../models/Workspace';

export async function PUT(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;
    const { messages } = await request.json();
    
    // UpdateMessages functionality
    const workspace = await Workspace.findByIdAndUpdate(
      id,
      { messages },
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
