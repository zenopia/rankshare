import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectToDatabase } from '@/lib/db/mongodb';
import { getListModel } from '@/lib/db/models-v2/list';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the correct path
config({ path: path.resolve(__dirname, '../../.env.local') });

async function migrateLists() {
  try {
    console.log('Starting list migration...');
    await connectToDatabase();
    const ListModel = await getListModel();

    // Get all lists
    const lists = await ListModel.find({});
    console.log(`Found ${lists.length} lists to migrate`);

    // Update each list to remove embedded username
    const bulkOps = lists.map(list => ({
      updateOne: {
        filter: { _id: list._id },
        update: {
          $unset: {
            'owner.username': '',
            'owner.joinedAt': '',
            'collaborators.$[].username': ''
          }
        }
      }
    }));

    if (bulkOps.length > 0) {
      const result = await ListModel.bulkWrite(bulkOps);
      console.log(`Successfully updated ${result.modifiedCount} lists`);
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateLists(); 