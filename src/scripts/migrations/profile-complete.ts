import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { connectToMongoDB } from "@/lib/db/client";
import { getUserProfileModel } from "@/lib/db/models-v2/user-profile";

async function migrateProfileComplete() {
  try {
    console.log('Starting profile completion migration...');
    
    // Connect to MongoDB
    await connectToMongoDB();
    const UserProfileModel = await getUserProfileModel();

    // Get all user profiles
    const profiles = await UserProfileModel.find({});
    console.log(`Found ${profiles.length} profiles to process`);

    let completed = 0;
    let incomplete = 0;

    // Update each profile
    for (const profile of profiles) {
      const isComplete = !!(
        profile.location &&
        profile.dateOfBirth &&
        profile.gender &&
        profile.livingStatus
      );

      profile.profileComplete = isComplete;
      await profile.save();

      if (isComplete) {
        completed++;
      } else {
        incomplete++;
      }

      // Log progress every 100 profiles
      if ((completed + incomplete) % 100 === 0) {
        console.log(`Processed ${completed + incomplete} profiles...`);
      }
    }

    console.log('\nMigration completed successfully!');
    console.log(`Total profiles processed: ${profiles.length}`);
    console.log(`Complete profiles: ${completed}`);
    console.log(`Incomplete profiles: ${incomplete}`);

  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Run the migration
migrateProfileComplete(); 