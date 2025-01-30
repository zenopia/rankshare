import { clerkClient } from "@clerk/clerk-sdk-node";
import { connectToDatabase } from "@/lib/db/mongodb";
import { getUserModel } from "@/lib/db/models-v2/user";
import * as dotenv from 'dotenv';
import path from 'path';

// Determine which env file to use
const envFile = process.env.ENV_FILE || '.env.local';
const envPath = path.resolve(process.cwd(), envFile);

console.log(`Loading environment from: ${envPath}`);
dotenv.config({ path: envPath });

async function migrateUserImageUrls() {
  try {
    console.log('Starting user image URL migration...');
    
    // Verify environment variables
    const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URI_V2;
    if (!mongoUri) {
      throw new Error('MongoDB URI environment variable (MONGODB_URI or MONGODB_URI_V2) is not set');
    }
    if (!process.env.CLERK_SECRET_KEY) {
      throw new Error('CLERK_SECRET_KEY environment variable is not set');
    }

    console.log('Using MongoDB URI:', mongoUri.replace(/mongodb\+srv:\/\/[^:]+:[^@]+@/, 'mongodb+srv://[hidden]@'));
    
    // Connect to MongoDB
    const connection = await connectToDatabase();
    const UserModel = await getUserModel();
    
    // Get all users from our database
    const dbUsers = await UserModel.find({}).lean();
    console.log(`Found ${dbUsers.length} users in database`);
    
    // Track migration statistics
    const stats = {
      total: dbUsers.length,
      updated: 0,
      failed: 0,
      notFound: 0
    };

    // Process users in batches of 50 to avoid rate limits
    const batchSize = 50;
    for (let i = 0; i < dbUsers.length; i += batchSize) {
      const batch = dbUsers.slice(i, i + batchSize);
      const clerkIds = batch.map(user => user.clerkId);
      
      try {
        // Fetch users from Clerk
        const clerkUsers = await clerkClient.users.getUserList({
          userId: clerkIds
        });

        // Create a map of Clerk IDs to image URLs
        const imageUrlMap = new Map(
          clerkUsers.map(user => [user.id, user.imageUrl])
        );

        // Update each user in the batch
        const updatePromises = batch.map(async (user) => {
          const imageUrl = imageUrlMap.get(user.clerkId);
          
          if (!imageUrl) {
            console.log(`No image URL found for user ${user.clerkId}`);
            stats.notFound++;
            return;
          }

          try {
            await UserModel.updateOne(
              { clerkId: user.clerkId },
              { $set: { imageUrl } }
            );
            stats.updated++;
          } catch (error) {
            console.error(`Error updating user ${user.clerkId}:`, error);
            stats.failed++;
          }
        });

        await Promise.all(updatePromises);
        
        // Log progress
        console.log(`Processed ${Math.min(i + batchSize, dbUsers.length)}/${dbUsers.length} users`);
        
        // Add a small delay between batches to avoid rate limits
        if (i + batchSize < dbUsers.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Error processing batch starting at index ${i}:`, error);
        stats.failed += batch.length;
      }
    }

    // Log final statistics
    console.log('\nMigration completed:');
    console.log(`Total users: ${stats.total}`);
    console.log(`Successfully updated: ${stats.updated}`);
    console.log(`Not found in Clerk: ${stats.notFound}`);
    console.log(`Failed to update: ${stats.failed}`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Ensure the process exits
    process.exit(0);
  }
}

// Run the migration
migrateUserImageUrls(); 