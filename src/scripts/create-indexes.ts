import { config } from 'dotenv';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env.local');
console.log('Loading env from:', envPath);
const result = config({ path: envPath });
console.log('Env loading result:', result);
console.log('MONGODB_URI_V2:', process.env.MONGODB_URI_V2);

import { getUserModel } from '../lib/db/models-v2/user';
import { getUserProfileModel } from '../lib/db/models-v2/user-profile';
import { getListModel } from '../lib/db/models-v2/list';
import { getFollowModel } from '../lib/db/models-v2/follow';
import { getPinModel } from '../lib/db/models-v2/pin';

async function createIndexes() {
  try {
    console.log('Creating indexes...');

    // Get all models
    const [UserModel, UserProfileModel, ListModel, FollowModel, PinModel] = await Promise.all([
      getUserModel(),
      getUserProfileModel(),
      getListModel(),
      getFollowModel(),
      getPinModel()
    ]);

    // Create indexes in parallel
    await Promise.all([
      // User indexes
      UserModel?.collection.createIndex({ searchIndex: 'text' }),
      UserModel?.collection.createIndex({ username: 1 }),
      UserModel?.collection.createIndex({ clerkId: 1 }),

      // UserProfile indexes
      UserProfileModel?.collection.createIndex({ userId: 1 }),

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
      PinModel?.collection.createIndex({ userId: 1, createdAt: -1 }),
      PinModel?.collection.createIndex({ listId: 1 }),
      PinModel?.collection.createIndex({ userId: 1, listId: 1 }, { unique: true })
    ]);

    console.log('All indexes created successfully!');
  } catch (error) {
    console.error('Error creating indexes:', error);
  } finally {
    process.exit();
  }
}

createIndexes(); 