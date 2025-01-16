import { config } from 'dotenv';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env.local');
console.log('Loading env from:', envPath);
const result = config({ path: envPath });

if (!process.env.MONGODB_URI_V2) {
  console.error('MONGODB_URI_V2 is not defined in .env.local');
  process.exit(1);
}

console.log('Environment variables loaded successfully');
console.log('MONGODB_URI_V2:', process.env.MONGODB_URI_V2);

import { getUserModel } from '../lib/db/models-v2/user';
import { getUserProfileModel } from '../lib/db/models-v2/user-profile';
import { getListModel } from '../lib/db/models-v2/list';
import { getFollowModel } from '../lib/db/models-v2/follow';
import { getPinModel } from '../lib/db/models-v2/pin';
import { connectToMongoDB } from '../lib/db/client';

async function createIndexes() {
  let connection;
  try {
    console.log('Connecting to MongoDB...');
    connection = await connectToMongoDB();
    console.log('Connected to MongoDB');

    console.log('Creating indexes...');

    // Get all models
    const [UserModel, UserProfileModel, ListModel, FollowModel, PinModel] = await Promise.all([
      getUserModel(),
      getUserProfileModel(),
      getListModel(),
      getFollowModel(),
      getPinModel()
    ]);

    // Drop existing indexes
    console.log('Dropping existing indexes...');
    await Promise.all([
      UserModel?.collection.dropIndexes(),
      UserProfileModel?.collection.dropIndexes(),
      ListModel?.collection.dropIndexes(),
      FollowModel?.collection.dropIndexes(),
      PinModel?.collection.dropIndexes()
    ]);

    console.log('Creating new indexes...');
    // Create indexes in parallel
    await Promise.all([
      // User indexes
      UserModel?.collection.createIndex({ searchIndex: 'text' }),
      UserModel?.collection.createIndex({ username: 1 }, { unique: true }),
      UserModel?.collection.createIndex({ clerkId: 1 }, { unique: true }),

      // UserProfile indexes
      UserProfileModel?.collection.createIndex({ userId: 1 }, { unique: true }),

      // List indexes
      ListModel?.collection.createIndex({ 'owner.userId': 1, privacy: 1 }),
      ListModel?.collection.createIndex({ 'collaborators.userId': 1, 'collaborators.status': 1 }),
      ListModel?.collection.createIndex({ category: 1 }),
      ListModel?.collection.createIndex({ title: 'text', description: 'text' }),

      // Follow indexes
      FollowModel?.collection.createIndex({ followerId: 1, status: 1 }),
      FollowModel?.collection.createIndex({ followingId: 1, status: 1 }),
      FollowModel?.collection.createIndex({ followerId: 1, followingId: 1 }, { unique: true }),

      // Pin indexes
      PinModel?.collection.createIndex({ clerkId: 1, createdAt: -1 }),
      PinModel?.collection.createIndex({ listId: 1 }),
      PinModel?.collection.createIndex({ clerkId: 1, listId: 1 }, { unique: true })
    ]);

    console.log('All indexes created successfully!');
  } catch (error) {
    console.error('Error creating indexes:', error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log('Database connection closed');
      } catch (error) {
        console.error('Error closing database connection:', error);
      }
    }
    process.exit();
  }
}

// Run the script
createIndexes().catch(error => {
  console.error('Failed to create indexes:', error);
  process.exit(1);
}); 