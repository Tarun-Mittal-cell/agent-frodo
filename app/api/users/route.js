import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/mongodb';
import User from '../../../models/User';

export async function GET(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const uid = searchParams.get('uid');
    
    if (email) {
      // GetUser functionality
      const user = await User.findOne({ email });
      return NextResponse.json(user || null);
    } 
    else if (uid) {
      // GetUserByUid functionality
      const user = await User.findOne({ uid });
      return NextResponse.json(user || null);
    }
    
    const users = await User.find({});
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();
    const data = await request.json();
    
    // Check if user already exists (CreateUser functionality)
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return NextResponse.json(null);
    }
    
    // Create new user with token
    const user = await User.create({
      name: data.name,
      email: data.email,
      picture: data.picture,
      uid: data.uid,
      token: 50000, // Default token value as in Convex
    });
    
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
