import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/mongodb';

export async function GET() {
  try {
    await connectToDatabase();
    return NextResponse.json({ 
      isConnected: true,
      mode: process.env.NODE_ENV !== 'production' ? 'development (in-memory)' : 'production' 
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return NextResponse.json({ 
      isConnected: false, 
      error: error.message,
      mode: process.env.NODE_ENV
    }, { status: 500 });
  }
}
