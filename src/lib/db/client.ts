import mongoose, { Connection, ConnectOptions } from 'mongoose';

const opts: ConnectOptions = {
  bufferCommands: true,
  autoIndex: true,
  maxPoolSize: 10,
  minPoolSize: 5,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 30000,
  family: 4,
  retryWrites: true,
  w: 'majority'
};

type MongooseCache = {
  conn: Connection | null;
  promise: Promise<Connection> | null;
};

let cached: MongooseCache = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectToMongoDB() {
  if (!process.env.MONGODB_URI_V2) {
    throw new Error('Please define the MONGODB_URI_V2 environment variable inside .env.local');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const uri = process.env.MONGODB_URI_V2;
    cached.promise = mongoose.createConnection(uri, opts).asPromise();
  }

  try {
    cached.conn = await cached.promise;
    console.log('Successfully connected to MongoDB');
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
