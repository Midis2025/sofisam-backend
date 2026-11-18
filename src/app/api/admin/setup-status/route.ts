import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Admin from '@/models/Admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  // 1. Check environment switch
  const isEnabled = process.env.ADMIN_REGISTRATION_ENABLED === 'true';
  if (!isEnabled) {
    return NextResponse.json({
      registrationAvailable: false,
    });
  }

  // 2. Check if a Super Admin already exists in MongoDB
  try {
    await connectToDatabase();
    const superAdminExists = await Admin.exists({ role: 'super_admin' });

    return NextResponse.json({
      registrationAvailable: !superAdminExists,
    });
  } catch (error: unknown) {
    console.error('Error checking setup status:', error);
    // If database connection is awaiting user configuration, reflect enabled state
    return NextResponse.json(
      {
        registrationAvailable: isEnabled,
        dbConfigured: false,
      },
      { status: 200 }
    );
  }
}
