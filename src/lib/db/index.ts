import mongoose from "mongoose";

let isConnected = false;

export async function connectToDatabase() {
  if (isConnected) {
    return;
  }

  const MONGODB_URI = process.env.MONGODB_URI_V2 || 'mongodb://localhost:27017/rankshare';

  try {
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
    isConnected = true;
    console.log("Connected to MongoDB at", MONGODB_URI);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
} 