import mongoose from 'mongoose';
import { config } from 'dotenv';

// Load environment variables
config();

const MONGODB_URI = process.env.MONGODB_URI_V3;

if (!MONGODB_URI) {
  console.error('MONGODB_URI_V3 environment variable is not set');
  process.exit(1);
}

async function migrateUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI as string);
    console.log('Connected to MongoDB');

    // Get the User collection
    const User = mongoose.connection.collection('users');

    // Update all users with the new preferences structure
    const result = await User.updateMany(
      {
        // Find users that don't have the new preferences structure
        'preferences.notifications': { $exists: false }
      },
      {
        $set: {
          preferences: {
            notifications: {
              email: {
                collaborationInvites: true,
                collaborationUpdates: true,
                listActivity: true,
                mentions: true
              },
              push: {
                collaborationInvites: true,
                collaborationUpdates: true,
                listActivity: true,
                mentions: true
              }
            },
            privacy: {
              defaultListPrivacy: 'private',
              showProfileStats: true
            },
            theme: 'system'
          }
        }
      }
    );

    console.log(`Migration complete. Modified ${result.modifiedCount} users.`);
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
migrateUsers(); 