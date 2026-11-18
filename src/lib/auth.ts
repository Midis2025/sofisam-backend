import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import connectToDatabase from '@/lib/mongodb';
import Admin from '@/models/Admin';

export const SESSION_COOKIE_NAME = 'sofisam_admin_session';
const SESSION_DURATION = 7 * 24 * 60 * 60; // 7 days in seconds

export interface SessionPayload {
  adminId: string;
  email: string;
  name: string;
  role: string;
  exp?: number;
}

export interface SafeAdminProfile {
  _id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.includes('REPLACE_WITH')) {
    throw new Error('JWT_SECRET is missing or not configured securely in environment variables.');
  }
  return new TextEncoder().encode(secret);
}

/**
 * Sign a new JWT session token
 */
export async function signSessionToken(payload: Omit<SessionPayload, 'exp'>): Promise<string> {
  const secret = getJwtSecret();
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(secret);
}

/**
 * Verify a given JWT session token
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Create and set HTTP-only session cookie
 */
export async function createSession(admin: {
  _id: string;
  email: string;
  name: string;
  role: string;
}): Promise<string> {
  const token = await signSessionToken({
    adminId: admin._id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION,
  });

  return token;
}

/**
 * Verify current session from request cookies
 */
export async function verifySession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  return verifySessionToken(sessionCookie.value);
}

/**
 * Delete the session cookie (Logout)
 */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Fetch current authenticated administrator document from MongoDB
 */
export async function getCurrentAdmin(): Promise<SafeAdminProfile | null> {
  const session = await verifySession();
  if (!session) {
    return null;
  }

  try {
    await connectToDatabase();
    const admin = await Admin.findById(session.adminId);
    if (!admin || !admin.isActive) {
      return null;
    }

    return {
      _id: admin._id.toString(),
      email: admin.email,
      name: admin.name,
      role: admin.role,
      isActive: admin.isActive,
      lastLoginAt: admin.lastLoginAt ? admin.lastLoginAt.toISOString() : null,
      createdAt: admin.createdAt.toISOString(),
    };
  } catch (error) {
    console.error('Error fetching current admin:', error);
    return null;
  }
}

/**
 * Guard utility for server actions and protected API endpoints
 */
export async function requireAdmin(): Promise<SafeAdminProfile> {
  const admin = await getCurrentAdmin();
  if (!admin) {
    throw new Error('UNAUTHORIZED');
  }
  return admin;
}
