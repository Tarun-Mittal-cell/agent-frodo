import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET() {
  try {
    console.log('Testing direct MongoDB connection...');
    
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      return NextResponse.json({
        error: 'MONGODB_URI environment variable is not set',
        status: 'error'
      }, { status: 500 });
    }
    
    // Hide credentials in logs
    const sanitizedUri = MONGODB_URI.replace(
      /(mongodb:\/\/)([^@]+)@/,
      (match, p1, p2) => `${p1}[CREDENTIALS]@`
    );
    
    console.log(`Connecting to: ${sanitizedUri}`);
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 15000, // 15 seconds timeout
    });
    
    const adminDb = mongoose.connection.db.admin();
    const dbInfo = await adminDb.listDatabases();
    
    await mongoose.disconnect();
    
    return NextResponse.json({
      status: 'success',
      message: 'MongoDB connection successful',
      databases: dbInfo.databases.map(db => db.name),
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'MongoDB connection failed',
      error: error.message,
    }, { status: 500 });
  }
}
