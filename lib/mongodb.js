import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;
const IS_DEVELOPMENT = process.env.NODE_ENV !== "production";

// Use global variables to share state across API routes
if (!global.__MONGO_MEMORY_SERVER__) {
  global.__MONGO_MEMORY_SERVER__ = {
    instance: null,
    uri: null,
    initializing: false,
  };
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function getMongoMemoryServerUri() {
  // If we already have a URI, return it
  if (global.__MONGO_MEMORY_SERVER__.uri) {
    return global.__MONGO_MEMORY_SERVER__.uri;
  }

  // If another process is initializing, wait
  if (global.__MONGO_MEMORY_SERVER__.initializing) {
    console.log("Waiting for MongoDB server initialization...");
    while (
      global.__MONGO_MEMORY_SERVER__.initializing &&
      !global.__MONGO_MEMORY_SERVER__.uri
    ) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return global.__MONGO_MEMORY_SERVER__.uri;
  }

  // Initialize new server
  global.__MONGO_MEMORY_SERVER__.initializing = true;

  try {
    console.log("Starting new in-memory MongoDB server...");
    const mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    // Store for reuse
    global.__MONGO_MEMORY_SERVER__.instance = mongoServer;
    global.__MONGO_MEMORY_SERVER__.uri = uri;

    console.log(`MongoDB memory server running at: ${uri}`);
    return uri;
  } catch (error) {
    console.error("Failed to start MongoDB memory server:", error);
    throw error;
  } finally {
    global.__MONGO_MEMORY_SERVER__.initializing = false;
  }
}

async function connectToDatabase() {
  if (cached.conn) {
    console.log("Using existing connection");
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
    };

    // Set up connection
    if (IS_DEVELOPMENT) {
      try {
        // If mongoose is already connected, disconnect first
        if (mongoose.connection.readyState !== 0) {
          console.log("Disconnecting existing connection");
          await mongoose.disconnect();
        }

        // Get URI to in-memory server
        const uri = await getMongoMemoryServerUri();
        console.log("Connecting to in-memory MongoDB...");
        cached.promise = mongoose.connect(uri, opts);
      } catch (error) {
        console.error("Error with MongoDB setup:", error);
        throw error;
      }
    } else {
      // In production, use MongoDB Atlas
      console.log("Connecting to MongoDB Atlas...");
      cached.promise = mongoose.connect(MONGODB_URI, opts);
    }
  }

  try {
    cached.conn = await cached.promise;
    console.log("MongoDB connection established");
    return cached.conn;
  } catch (error) {
    cached.promise = null; // Clear promise on failure
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

// Cleanup on app exit
if (IS_DEVELOPMENT) {
  ["SIGINT", "SIGTERM", "SIGQUIT"].forEach((signal) => {
    process.on(signal, async () => {
      if (global.__MONGO_MEMORY_SERVER__.instance) {
        await global.__MONGO_MEMORY_SERVER__.instance.stop();
        console.log("MongoDB memory server stopped");
      }
      process.exit(0);
    });
  });
}

export default connectToDatabase;
