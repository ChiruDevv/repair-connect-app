/*
 * MongoDB Connection Utility
 * 
 * This file creates a singleton connection to MongoDB using Mongoose.
 * In serverless environments (like Vercel), each API route invocation may
 * create a new process. Without caching, this would open a new DB connection
 * every time, quickly exhausting MongoDB connection limits.
 * 
 * The global.mongooseCache trick stores the connection on the Node.js global
 * object, which persists across hot-reloads in development and across
 * serverless invocations in production.
 */
import mongoose from "mongoose";

// Read the MongoDB connection string from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable in .env.local"
  );
}

// Type definition for the cached connection state
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

// Reuse existing cache or create a new one
// global.mongooseCache persists across hot-reloads (dev) and cold starts (prod)
const cached: MongooseCache = global.mongooseCache ?? { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

// Main connection function - returns the cached connection or creates a new one
export async function connectToDatabase(): Promise<typeof mongoose> {
  // If we already have a connection, return it immediately (most common path)
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    // First time connecting - create the promise
// bufferCommands: false means Mongoose won't queue operations while connecting
// This is important for serverless where we need fast fail if DB is down
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts);
  }

  try {
    // Await the connection and cache it
// If connection fails, clear the promise so next request can retry
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
