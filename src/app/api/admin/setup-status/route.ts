import { NextResponse } from 'next/server';
import connectToDatabase, { classifyMongoError } from '@/lib/mongodb';
import Admin from '@/models/Admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const isEnabled = process.env.ADMIN_REGISTRATION_ENABLED === 'true';
  if (!isEnabled) {
    return NextResponse.json({
      registrationAvailable: false,
    });
  }

  try {
    await connectToDatabase();
    const superAdminExists = await Admin.exists({ role: 'super_admin' });

    return NextResponse.json({
      registrationAvailable: !superAdminExists,
    });
  } catch (error: unknown) {
    const classified = classifyMongoError(error);
    console.error(`Error checking setup status [${classified.category}]: ${classified.diagnostic}`);
    return NextResponse.json(
      {
        registrationAvailable: isEnabled,
        dbConfigured: false,
      },
      { status: 200 }
    );
  }
}
