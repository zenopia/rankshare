import mongoose, { Connection, ConnectOptions } from 'mongoose';

declare global {
  // eslint-disable-next-line no-var
  var mongoose: {
    conn: Connection | null;
    promise: Promise<Connection> | null;
  } | undefined;
}

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

const MONGODB_URI: string = process.env.MONGODB_URI;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const MONGODB_OPTIONS: ConnectOptions = {
  bufferCommands: false,
  maxPoolSize: 5,
  minPoolSize: 1,
  socketTimeoutMS: 45000,
  family: 4,
  serverSelectionTimeoutMS: 10000,
  heartbeatFrequencyMS: 10000,
  maxIdleTimeMS: 30000,
  connectTimeoutMS: 30000,
  compressors: ['zlib'],
};

// Add connection counter for debugging
let connectionAttempts = 0;

async function dbConnect(): Promise<Connection> {
  // Only log first connection attempt in development
  const shouldLog = process.env.NODE_ENV !== 'production' && connectionAttempts === 0;
  connectionAttempts++;

  if (cached?.conn) {
    if (shouldLog) console.log('Using cached MongoDB connection');
    return cached.conn;
  }

  if (!cached?.promise) {
    try {
      if (shouldLog) console.log('Creating new MongoDB connection...');
      cached = global.mongoose = {
        conn: null,
        promise: mongoose
          .connect(MONGODB_URI, MONGODB_OPTIONS)
          .then((mongoose) => {
            if (shouldLog) console.log('MongoDB connected successfully');
            return mongoose.connection;
          })
      };
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  } else if (shouldLog) {
    console.log('Using existing connection promise');
  }

  try {
    const conn = await cached.promise;
    if (!conn) {
      throw new Error('MongoDB connection failed - connection is null');
    }
    cached.conn = conn;
    return conn;
  } catch (e) {
    cached.promise = null;
    console.error('Failed to establish MongoDB connection:', e);
    throw e;
  }
}

// Only attach listeners once
let listenersAttached = false;

if (!listenersAttached) {
  mongoose.connection.on('connected', () => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('MongoDB connected');
    }
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('MongoDB disconnected');
    }
    cached = { conn: null, promise: null };
  });

  listenersAttached = true;
}

// Only create indexes in production and only once
let indexesCreated = false;

async function createIndexes() {
  if (indexesCreated) return;
  
  try {
    const conn = await dbConnect();
    
    // Create regular indexes
    const indexPromises = [
      conn.collection('lists').createIndex({ ownerId: 1 }, { background: true }),
      conn.collection('lists').createIndex({ privacy: 1 }, { background: true }),
      conn.collection('lists').createIndex({ category: 1 }, { background: true }),
      conn.collection('lists').createIndex({ createdAt: -1 }, { background: true }),
      conn.collection('lists').createIndex({ viewCount: -1 }, { background: true }),
      conn.collection('pins').createIndex({ userId: 1 }, { background: true }),
      conn.collection('pins').createIndex({ listId: 1 }, { background: true }),
      conn.collection('follows').createIndex({ followerId: 1 }, { background: true }),
      conn.collection('follows').createIndex({ followingId: 1 }, { background: true }),
    ];

    // Handle text index
    await conn.collection('lists').createIndex(
      { 
        title: 'text', 
        description: 'text',
        ownerName: 'text' 
      },
      { 
        background: true,
        name: 'title_description_owner_text',
        weights: {
          title: 3,
          ownerName: 2,
          description: 1
        }
      }
    );

    await Promise.all(indexPromises);
    indexesCreated = true;
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('MongoDB indexes created successfully');
    }
  } catch (error) {
    console.error('Warning: Error creating some indexes:', error);
  }
}

if (process.env.NODE_ENV === 'production') {
  createIndexes();
}

export default dbConnect; 