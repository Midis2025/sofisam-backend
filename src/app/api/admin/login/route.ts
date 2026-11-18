import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb';
import Admin from '@/models/Admin';
import { createSession } from '@/lib/auth';
import { loginSchema } from '@/lib/validation';
import { checkRateLimit, recordFailedAttempt, clearRateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    // Determine client IP for persistent rate limiting
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : realIp || '127.0.0.1';

    // 1. Check rate limit
    const rateLimit = await checkRateLimit(clientIp);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many login attempts. Access is locked. Please try again in ${rateLimit.retryAfterSeconds} seconds.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfterSeconds || 60),
          },
        }
      );
    }

    // 2. Parse & validate request body
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid email or password format.' },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // 3. Connect to database
    try {
      await connectToDatabase();
    } catch (dbErr: unknown) {
      console.error('Database connection failed in login route:', dbErr);
      return NextResponse.json(
        {
          error:
            'Database service unavailable. Please ensure MongoDB Atlas connection string is configured in .env.local',
        },
        { status: 503 }
      );
    }

    // 4. Find administrator (generic error message prevents email enumeration)
    const admin = await Admin.findOne({ email });
    if (!admin || !admin.isActive) {
      await recordFailedAttempt(clientIp);
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // 5. Verify password with bcryptjs
    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isPasswordValid) {
      await recordFailedAttempt(clientIp);
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // 6. Reset rate limit counter on successful credentials
    await clearRateLimit(clientIp);

    // 7. Update lastLoginAt
    admin.lastLoginAt = new Date();
    await admin.save();

    // 8. Create signed JWT session with HTTP-only cookie
    await createSession({
      _id: admin._id.toString(),
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });

    // 9. Return safe profile
    return NextResponse.json({
      success: true,
      admin: {
        _id: admin._id.toString(),
        email: admin.email,
        name: admin.name,
        role: admin.role,
        lastLoginAt: admin.lastLoginAt.toISOString(),
      },
    });
  } catch (err: unknown) {
    console.error('Unexpected error in admin login:', err);
    return NextResponse.json(
      { error: 'An unexpected internal error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
