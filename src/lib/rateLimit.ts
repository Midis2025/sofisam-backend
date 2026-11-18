import mongoose, { Schema, Document, Model } from 'mongoose';

interface ILoginAttempt extends Document {
  ip: string;
  attempts: number;
  lastAttemptAt: Date;
  expiresAt: Date;
}

const LoginAttemptSchema = new Schema<ILoginAttempt>(
  {
    ip: {
      type: String,
      required: true,
      index: true,
    },
    attempts: {
      type: Number,
      default: 1,
    },
    lastAttemptAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB TTL index: automatically deletes document when expiresAt reached
    },
  },
  { timestamps: true }
);

const LoginAttempt: Model<ILoginAttempt> =
  mongoose.models.LoginAttempt || mongoose.model<ILoginAttempt>('LoginAttempt', LoginAttemptSchema);

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// In-memory fallback if database is not reachable during rate limit check
const memoryStore = new Map<string, { count: number; resetAt: number }>();

export async function checkRateLimit(ip: string): Promise<{
  allowed: boolean;
  remaining: number;
  retryAfterSeconds?: number;
}> {
  try {
    if (mongoose.connection.readyState === 1) {
      const now = new Date();
      const record = await LoginAttempt.findOne({ ip });

      if (record) {
        if (record.attempts >= MAX_ATTEMPTS) {
          const retryAfterSeconds = Math.ceil((record.expiresAt.getTime() - now.getTime()) / 1000);
          return {
            allowed: false,
            remaining: 0,
            retryAfterSeconds: Math.max(1, retryAfterSeconds),
          };
        }
        return {
          allowed: true,
          remaining: MAX_ATTEMPTS - record.attempts,
        };
      }

      return { allowed: true, remaining: MAX_ATTEMPTS };
    }
  } catch (err) {
    console.warn('Database rate limiter fallback to in-memory:', err);
  }

  // Fallback to in-memory rate limiting
  const now = Date.now();
  const entry = memoryStore.get(ip);
  if (entry) {
    if (now > entry.resetAt) {
      memoryStore.delete(ip);
      return { allowed: true, remaining: MAX_ATTEMPTS };
    }
    if (entry.count >= MAX_ATTEMPTS) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000),
      };
    }
    return { allowed: true, remaining: MAX_ATTEMPTS - entry.count };
  }

  return { allowed: true, remaining: MAX_ATTEMPTS };
}

export async function recordFailedAttempt(ip: string): Promise<void> {
  const expiresAt = new Date(Date.now() + WINDOW_MS);

  try {
    if (mongoose.connection.readyState === 1) {
      await LoginAttempt.findOneAndUpdate(
        { ip },
        {
          $inc: { attempts: 1 },
          $set: { lastAttemptAt: new Date(), expiresAt },
        },
        { upsert: true, new: true }
      );
      return;
    }
  } catch (err) {
    console.warn('Failed to record attempt in DB, falling back to memory:', err);
  }

  // Memory fallback
  const now = Date.now();
  const entry = memoryStore.get(ip);
  if (entry && now < entry.resetAt) {
    entry.count += 1;
  } else {
    memoryStore.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  }
}

export async function clearRateLimit(ip: string): Promise<void> {
  try {
    if (mongoose.connection.readyState === 1) {
      await LoginAttempt.deleteOne({ ip });
    }
  } catch {
    // Ignore error
  }
  memoryStore.delete(ip);
}
