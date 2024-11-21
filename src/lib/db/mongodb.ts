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

// Optimize connection pool settings
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

async function dbConnect(): Promise<Connection> {
  if (cached?.conn) {
    console.log('Using cached MongoDB connection');
    return cached.conn;
  }

  if (!cached?.promise) {
    try {
      console.log('Creating new MongoDB connection...');
      cached = global.mongoose = {
        conn: null,
        promise: mongoose
          .connect(MONGODB_URI, MONGODB_OPTIONS)
          .then((mongoose) => {
            console.log('MongoDB connected successfully');
            return mongoose.connection;
          })
      };
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  } else {
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

// Modify connection event listeners to avoid duplicate logging
let listenersAttached = false;

if (!listenersAttached) {
  mongoose.connection.on('connected', () => {
    console.log('MongoDB connected');
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
    cached = { conn: null, promise: null };
  });

  listenersAttached = true;
}

// Add index creation
async function createIndexes() {
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

    // Handle text index separately
    try {
      // Drop all existing text indexes first
      const indexes = await conn.collection('lists').listIndexes().toArray();
      for (const index of indexes) {
        if (index.key._fts === 'text') {
          await conn.collection('lists').dropIndex(index.name);
        }
      }

      // Create new text index
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
    } catch (e) {
      console.error('Error handling text index:', e);
    }

    // Create other indexes
    await Promise.all(indexPromises);
    console.log('MongoDB indexes created successfully');
  } catch (error) {
    // Log error but don't throw - indexes are optimization, not critical
    console.error('Warning: Error creating some indexes:', error);
  }
}

// Only create indexes in production to avoid development conflicts
if (process.env.NODE_ENV === 'production') {
  createIndexes();
}

export default dbConnect; 