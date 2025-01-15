import mongoose, { Connection, ConnectOptions } from 'mongoose';

interface MongooseCache {
  conn: Connection | null;
  promise: Promise<Connection> | null;
}

declare global {
  var _mongooseConnection: MongooseCache;
}

global._mongooseConnection = global._mongooseConnection || { conn: null, promise: null };

export async function connectToDatabase(customUri?: string): Promise<Connection> {
  const MONGODB_URI = customUri || process.env.MONGODB_URI_V2;

  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI_V2 environment variable inside .env.local');
  }

  const cache = global._mongooseConnection;

  if (cache.conn) {
    console.log('Using existing MongoDB connection');
    return cache.conn;
  }

  if (!cache.promise) {
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

    console.log('Creating new MongoDB connection');
    cache.promise = mongoose.createConnection(MONGODB_URI, opts).asPromise();
  }

  try {
    cache.conn = await cache.promise;
    console.log('Successfully connected to MongoDB');
    return cache.conn;
  } catch (e) {
    cache.promise = null;
    throw e;
  }
}

export default connectToDatabase; 