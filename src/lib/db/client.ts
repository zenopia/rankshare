import mongoose, { Connection, ConnectOptions } from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('Missing MONGODB_URI');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect(): Promise<Connection> {
  if (cached?.conn) {
    return cached.conn;
  }

  if (!cached?.promise) {
    const opts: ConnectOptions = {
      bufferCommands: false,
    };

    cached = global.mongoose = {
      conn: null,
      promise: mongoose.connect(process.env.MONGODB_URI, opts).then((mongoose) => {
        return mongoose.connection;
      })
    };
  }

  try {
    const conn = await cached.promise;
    if (!conn) {
      throw new Error('MongoDB connection failed');
    }
    cached.conn = conn;
    return conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
}

export default dbConnect;
