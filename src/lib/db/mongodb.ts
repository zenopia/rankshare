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
    return cached.conn;
  }

  if (!cached?.promise) {
    try {
      console.log('Connecting to MongoDB...');
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

// Add connection event listeners
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Add index creation
async function createIndexes() {
  try {
    const conn = await dbConnect();
    
    // Create indexes with dropDups and background options
    const indexPromises = [
      // Regular indexes
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

    // Text index needs special handling
    try {
      // First try to drop existing text indexes
      await conn.collection('lists').dropIndex('title_text');
      await conn.collection('lists').dropIndex('title_text_description_text');
    } catch (e) {
      // Ignore errors if indexes don't exist
    }

    // Create new text index
    indexPromises.push(
      conn.collection('lists').createIndex(
        { 
          title: 'text', 
          description: 'text' 
        },
        { 
          background: true,
          name: 'title_description_text_v2',
          weights: {
            title: 2,
            description: 1
          }
        }
      )
    );

    await Promise.all(indexPromises);
    console.log('MongoDB indexes created successfully');
  } catch (error) {
    // Log error but don't throw - indexes are optimization, not critical for function
    console.error('Warning: Error creating some indexes:', error);
  }
}

// Only create indexes in production to avoid development conflicts
if (process.env.NODE_ENV === 'production') {
  createIndexes();
}

export default dbConnect; 