import { config } from 'dotenv';
import { resolve } from 'path';
import { MongoClient } from 'mongodb';

// Load environment variables from .env.local
const envPath = resolve(process.cwd(), '.env.local');
config({ path: envPath });

const mongoUri = process.env.MONGODB_URI_V3;
if (!mongoUri) {
  console.error('MONGODB_URI_V3 is not defined in .env.local');
  process.exit(1);
}

async function createIndexes() {
  let client: MongoClient | null = null;

  try {
    console.log('Starting index creation process...');
    client = new MongoClient(mongoUri as string);
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    const listsCollection = db.collection('lists');
    const usersCollection = db.collection('users');

    // Drop existing indexes
    console.log('\nDropping existing indexes...');
    await Promise.all([
      listsCollection.dropIndexes(),
      usersCollection.dropIndexes()
    ]).catch(() => {
      console.log('Note: Some collections may not have existing indexes');
    });

    // Create list indexes
    console.log('\nCreating list indexes...');
    await listsCollection.createIndex(
      { title: 'text', description: 'text', 'items.title': 'text' },
      {
        weights: {
          title: 10,
          'items.title': 5,
          description: 1
        },
        name: 'list_text_search'
      }
    );

    await listsCollection.createIndex(
      { 'owner.userId': 1 },
      { name: 'owner_lookup' }
    );

    await listsCollection.createIndex(
      { privacy: 1, 'owner.clerkId': 1, 'collaborators.clerkId': 1 },
      { name: 'privacy_access_lookup' }
    );

    // Create user indexes
    console.log('\nCreating user indexes...');
    await usersCollection.createIndex(
      { username: 'text', displayName: 'text' },
      {
        weights: {
          username: 10,
          displayName: 8
        },
        name: 'user_text_search',
        default_language: 'none'
      }
    );

    await usersCollection.createIndex(
      { clerkId: 1 },
      { unique: true, name: 'clerk_id_lookup' }
    );

    await usersCollection.createIndex(
      { username: 1 },
      { unique: true, name: 'username_lookup' }
    );

    console.log('\nSuccessfully created all indexes!');
  } catch (error) {
    console.error('Error creating indexes:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('Disconnected from MongoDB');
    }
    process.exit(0);
  }
}

createIndexes(); 