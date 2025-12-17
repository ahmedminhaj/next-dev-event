import mongoose, { Mongoose } from "mongoose";

// Read the MongoDB connection string from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env"
  );
}

// Define the type for our cached connection
interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// Extend the global namespace to include our cache
// This prevents TypeScript errors when accessing global properties
declare global {
  var mongooseCache: MongooseCache | undefined;
}

// Use global cache to persist connection across hot reloads in development
// In production; this ensures we reuse the same connection
const cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
};

// Store the cache globally
if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * Establishes a connection to MongoDB using Mongoose
 * Reuses existing connections to prevent connection exhaustion
 * @returns Promise resolving to the Mongoose instance
 */
export async function connectToDatabase(): Promise<Mongoose> {
  // Return existing connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // Create a new connection promise if one doesn't exist
  // This prevents multiple simultaneous connection attempts
  if (!cached.promise) {
    const options = {
      bufferCommands: false, // Disable command buffering for better error handling
    };

    // @ts-ignore
    cached.promise = mongoose.connect(MONGODB_URI, options);
  }

  // Wait for connection and cache it
  cached.conn = await cached.promise;

  return cached.conn;
}
