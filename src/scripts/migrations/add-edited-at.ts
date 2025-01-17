import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { getListModel } from "@/lib/db/models-v2/list";
import { connectToMongoDB } from "@/lib/db/client";

async function migrateEditedAt() {
  try {
    // Connect to MongoDB
    await connectToMongoDB();
    const ListModel = await getListModel();

    // Find all lists
    const lists = await ListModel.find({}).lean();
    console.log(`Found ${lists.length} lists to migrate`);

    // Update each list
    for (const list of lists) {
      await ListModel.findByIdAndUpdate(list._id, {
        $set: {
          // Set editedAt to updatedAt if it exists, otherwise use createdAt
          editedAt: list.updatedAt || list.createdAt
        }
      });
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateEditedAt(); 