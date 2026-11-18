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

/**
 * Sanitizes and extracts the MongoDB connection URI
 */
function getSanitizedMongoUri(): string {
  let uri = process.env.MONGODB_URI || '';

  // Clean leading/trailing spaces or quotes
  uri = uri.trim().replace(/^["']|["']$/g, '');

  // Handle accidental duplicate key prefix (e.g. MONGODB_URI=mongodb+srv://...)
  if (uri.startsWith('MONGODB_URI=')) {
    uri = uri.replace(/^MONGODB_URI=\s*/, '');
  }

  if (!uri || uri.includes('<db_username>') || uri.includes('YOUR_USERNAME')) {
    throw new Error('MONGODB_URI is not configured or contains placeholder credentials in environment variables.');
  }

  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    throw new Error('Invalid MONGODB_URI scheme. Expected a connection string starting with "mongodb://" or "mongodb+srv://".');
  }

  return uri;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  const uri = getSanitizedMongoUri();

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

    console.log('⏳ Connecting to MongoDB Atlas...');

    cached.promise = mongoose
      .connect(uri, opts)
      .then((instance) => {
        console.log('✅ MongoDB Atlas connected successfully!');
        console.log(`📦 Database: ${instance.connection.name}`);
        console.log(`🌐 Host: ${instance.connection.host}`);
        return instance;
      })
      .catch((err) => {
        // Reset cached promise so future requests can retry connecting
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
