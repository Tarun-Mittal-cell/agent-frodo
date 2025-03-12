import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/mongodb';
import Workspace from '../../../../models/Workspace';

export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;
    
    // GetWorkspace functionality
    const workspace = await Workspace.findById(id);
    
    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }
    
    return NextResponse.json(workspace);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;
    const data = await request.json();
    
    const workspace = await Workspace.findByIdAndUpdate(id, data, { new: true });
    
    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }
    
    return NextResponse.json(workspace);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;
    
    const workspace = await Workspace.findByIdAndDelete(id);
    
    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
