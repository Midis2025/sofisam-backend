import { NextResponse } from 'next/server';
import connectToDatabase, { classifyMongoError } from '@/lib/mongodb';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        {
          success: false,
          database: 'disconnected',
          category: 'Missing environment variable',
          message: 'MONGODB_URI environment variable is not defined.',
        },
        { status: 503 }
      );
    }

    // Attempt database connection
    await connectToDatabase();

    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json(
        {
          success: false,
          database: 'disconnected',
          category: 'Database unavailable',
          message: 'Database instance not initialized.',
        },
        { status: 503 }
      );
    }

    // Execute real database ping
    const pingResult = await db.command({ ping: 1 });
    if (pingResult.ok !== 1) {
      return NextResponse.json(
        {
          success: false,
          database: 'disconnected',
          category: 'Database unavailable',
          message: 'MongoDB ping command did not return success status.',
        },
        { status: 503 }
      );
    }

    console.log('✓ Database health check passed: ping successful');

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
    const classified = classifyMongoError(err);
    console.error(`Database health-check failed [${classified.category}]: ${classified.diagnostic}`);

    return NextResponse.json(
      {
        success: false,
        database: 'disconnected',
        category: classified.category,
        message: 'MongoDB connection failed',
        diagnostic: classified.diagnostic,
      },
      { status: 503 }
    );
  }
}
