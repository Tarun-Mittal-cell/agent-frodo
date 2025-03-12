import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/mongodb';
import User from '../../../models/User';
import Workspace from '../../../models/Workspace';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Seed route disabled in production' }, { status: 403 });
  }
  
  try {
    await connectToDatabase();
    
    // Clear existing data
    await User.deleteMany({});
    await Workspace.deleteMany({});
    
    // Create test user
    const testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      picture: 'https://via.placeholder.com/150',
      uid: 'test-user-123',
      token: 50000
    });
    
    // Create test workspace
    const testWorkspace = await Workspace.create({
      messages: [
        { role: 'user', content: 'Hello, world!' },
        { role: 'assistant', content: 'Hi there! How can I help you?' }
      ],
      user: testUser._id.toString(),
      createdAt: Date.now()
    });
    
    return NextResponse.json({
      success: true,
      data: {
        user: testUser,
        workspace: testWorkspace
      }
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
