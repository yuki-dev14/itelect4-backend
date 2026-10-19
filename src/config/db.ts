import mongoose from "mongoose";

let connection: Promise<typeof mongoose> | undefined;

export function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) return Promise.reject(new Error("MONGODB_URI is not configured"));
  if (mongoose.connection.readyState === 1) return Promise.resolve(mongoose);

  if (!connection) {
    connection = mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 }).catch((error: unknown) => {
      connection = undefined;
      throw error;
    });
  }

  return connection;
}