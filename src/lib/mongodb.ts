import mongoose from 'mongoose';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export interface MongoDiagnostic {
  hasEnvUri: boolean;
  schemeValid: boolean;
  parsedHost: string;
  connected: boolean;
  errorCategory?: string;
  diagnosticMessage?: string;
}

export function classifyMongoError(err: unknown): { category: string; diagnostic: string } {
  const errorObj = err as { message?: string; name?: string; code?: number };
  const msg = errorObj?.message || String(err);
  const name = errorObj?.name || '';
  const code = errorObj?.code;

  if (!process.env.MONGODB_URI) {
    return {
      category: 'Missing environment variable',
      diagnostic: 'MONGODB_URI is not defined in the environment configuration.',
    };
  }

  if (name === 'MongoServerSelectionError' || msg.includes('Server selection timed out')) {
    return {
      category: 'Server selection timeout / Network access denied',
      diagnostic:
        'Connection timed out after 10000ms waiting for cluster response. In Vercel serverless environments, this typically indicates that MongoDB Atlas Network Access is not allowing connections from Vercel dynamic IPs (0.0.0.0/0 required) or the cluster is paused.',
    };
  }

  if (name === 'MongoNetworkError' || msg.includes('ECONNREFUSED') || msg.includes('ETIMEDOUT') || msg.includes('connection timed out')) {
    return {
      category: 'Connection timeout',
      diagnostic: 'Socket connection dropped or timed out before handshake completed. Check Atlas Network Access IP allowlist.',
    };
  }

  if (msg.includes('querySrv ENOTFOUND') || msg.includes('querySrv ETIMEOUT') || msg.includes('ENOTFOUND')) {
    return {
      category: 'DNS/SRV resolution failure',
      diagnostic: 'DNS resolver failed to find the MongoDB SRV record. Verify cluster hostname in MONGODB_URI.',
    };
  }

  if (code === 8000 || msg.includes('bad auth') || msg.includes('Authentication failed') || msg.includes('auth error')) {
    return {
      category: 'Authentication failed',
      diagnostic: 'MongoDB authentication failed. Check database username and password in Atlas Database Access. Special characters in password must be URL-encoded.',
    };
  }

  return {
    category: 'Database unavailable',
    diagnostic: 'Database cluster is unreachable or returned an unclassified driver error.',
  };
}

/**
 * Sanitizes and extracts the MongoDB connection URI
 */
function getSanitizedMongoUri(): { uri: string; host: string } {
  let uri = process.env.MONGODB_URI || '';

  // Clean leading/trailing spaces or quotes
  uri = uri.trim().replace(/^["']|["']$/g, '');

  // Handle accidental duplicate key prefix (e.g. MONGODB_URI=mongodb+srv://...)
  if (uri.startsWith('MONGODB_URI=')) {
    uri = uri.replace(/^MONGODB_URI=\s*/, '');
  }

  const hasUri = Boolean(uri);
  const startsWithSrv = uri.startsWith('mongodb+srv://') || uri.startsWith('mongodb://');

  // Extract cluster hostname safely without printing credentials
  const hostMatch = uri.match(/@([^/?:]+)/);
  const host = hostMatch ? hostMatch[1] : (startsWithSrv ? 'parsed-cluster' : 'unknown');

  console.log(`[Mongo Diagnostic] MONGODB_URI exists: ${hasUri}`);
  console.log(`[Mongo Diagnostic] Scheme valid (mongodb+srv): ${startsWithSrv}`);
  console.log(`[Mongo Diagnostic] Target Cluster Host: ${host}`);

  if (!uri || uri.includes('<db_username>') || uri.includes('YOUR_USERNAME')) {
    throw new Error('MONGODB_URI is not configured or contains placeholder credentials.');
  }

  if (!startsWithSrv) {
    throw new Error('Invalid MONGODB_URI scheme. Expected a connection string starting with "mongodb://" or "mongodb+srv://".');
  }

  return { uri, host };
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  const { uri, host } = getSanitizedMongoUri();

  // If already connected and ready, return existing connection
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
      socketTimeoutMS: 45000,
    };

    console.log(`⏳ Connecting to MongoDB Atlas cluster: ${host}...`);

    cached.promise = mongoose
      .connect(uri, opts)
      .then((instance) => {
        console.log('✅ MongoDB Atlas connected successfully!');
        console.log(`📦 Database: ${instance.connection.name}`);
        console.log(`🌐 Host: ${instance.connection.host}`);
        return instance;
      })
      .catch((err) => {
        const classified = classifyMongoError(err);
        console.error(`❌ MongoDB connection failed [${classified.category}]: ${classified.diagnostic}`);
        cached.promise = null;
        cached.conn = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    cached.conn = null;
    throw err;
  }

  return cached.conn;
}

export default connectToDatabase;
