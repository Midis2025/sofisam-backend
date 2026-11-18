import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        {
          success: false,
          database: 'disconnected',
          message: 'MONGODB_URI environment variable is not defined.',
        },
        { status: 503 }
      );
    }

    // Connect to database using cached manager
    await connectToDatabase();

    // Perform database ping
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json(
        {
          success: false,
          database: 'disconnected',
          message: 'Database instance not initialized.',
        },
        { status: 503 }
      );
    }

    await db.command({ ping: 1 });

    return NextResponse.json(
      {
        success: true,
        database: 'connected',
        databaseName: mongoose.connection.name || 'sofisam_admin',
        message: 'MongoDB Atlas connection successful',
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const error = err as { message?: string; name?: string };
    console.error('Database health-check failed:', error?.message || err);

    return NextResponse.json(
      {
        success: false,
        database: 'disconnected',
        message: 'MongoDB connection failed',
      },
      { status: 503 }
    );
  }
}
