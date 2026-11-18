import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb';
import Admin from '@/models/Admin';
import { createSession } from '@/lib/auth';
import { registerSuperAdminSchema } from '@/lib/validation';
import { checkRateLimit, recordFailedAttempt, clearRateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : realIp || '127.0.0.1';

    // 1. Verify ADMIN_REGISTRATION_ENABLED flag
    if (process.env.ADMIN_REGISTRATION_ENABLED !== 'true') {
      return NextResponse.json(
        { error: 'Registration is disabled. Please contact your system administrator.' },
        { status: 403 }
      );
    }

    // 2. Rate limiting on registration attempts
    const rateLimit = await checkRateLimit(clientIp);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many registration attempts. Please wait ${rateLimit.retryAfterSeconds} seconds before trying again.`,
        },
        { status: 429 }
      );
    }

    // 3. Connect to database
    try {
      await connectToDatabase();
    } catch (dbErr: unknown) {
      console.error('Database connection failed during admin registration:', dbErr);
      return NextResponse.json(
        {
          error:
            'MongoDB connection error. Please verify MONGODB_URI in your environment configuration.',
        },
        { status: 503 }
      );
    }

    // 4. Ensure no Super Admin exists in MongoDB
    const existingSuperAdmin = await Admin.findOne({ role: 'super_admin' }).select('_id').lean();
    if (existingSuperAdmin) {
      return NextResponse.json(
        { error: 'Super Admin registration is permanently closed. An administrator already exists.' },
        { status: 403 }
      );
    }

    // 5. Parse & Validate request body (Full Name, Email, Password, Confirm Password)
    const body = await request.json();
    const validation = registerSuperAdminSchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'Invalid registration form input.';
      await recordFailedAttempt(clientIp);
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { name, email, password } = validation.data;

    // 6. Check if email is already taken
    const existingEmail = await Admin.findOne({ email }).select('_id').lean();
    if (existingEmail) {
      await recordFailedAttempt(clientIp);
      return NextResponse.json(
        { error: 'An account with this email address already exists.' },
        { status: 409 }
      );
    }

    // 7. Hash password using bcrypt (work factor 12)
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // 8. Atomic creation with automatic role: "super_admin" (never trusted from client)
    const superAdmin = new Admin({
      name,
      email,
      passwordHash,
      role: 'super_admin',
      isActive: true,
      lastLoginAt: new Date(),
    });

    try {
      await superAdmin.save();
    } catch (saveError: unknown) {
      // Catch MongoDB unique index race condition (E11000)
      const err = saveError as { code?: number };
      if (err.code === 11000) {
        return NextResponse.json(
          { error: 'Super Admin registration is permanently closed. An administrator already exists.' },
          { status: 403 }
        );
      }
      throw saveError;
    }

    // 9. Clear rate limits upon successful registration
    await clearRateLimit(clientIp);

    // 10. Automatically establish authenticated session
    await createSession({
      _id: superAdmin._id.toString(),
      email: superAdmin.email,
      name: superAdmin.name,
      role: 'super_admin',
    });

    // 11. Return safe administrator profile
    return NextResponse.json({
      success: true,
      message: 'Super Admin account provisioned successfully.',
      admin: {
        _id: superAdmin._id.toString(),
        email: superAdmin.email,
        name: superAdmin.name,
        role: 'super_admin',
        lastLoginAt: superAdmin.lastLoginAt?.toISOString(),
      },
    });
  } catch (error: unknown) {
    console.error('Fatal error during Super Admin registration:', error);
    return NextResponse.json(
      { error: 'An unexpected internal error occurred during registration.' },
      { status: 500 }
    );
  }
}
