import { connectToMongoDB } from "@/lib/db/client";
import { getListModel } from "@/lib/db/models-v2/list";

async function main() {
  try {
    console.log('Starting migration: Adding listType property to lists...');
    
    // Connect to MongoDB
    await connectToMongoDB();
    const ListModel = await getListModel();
    
    // Update all documents that don't have a listType
    const result = await ListModel.updateMany(
      { listType: { $exists: false } },
      { $set: { listType: 'ordered' } }
    );
    
    console.log(`Migration complete! Updated ${result.modifiedCount} lists.`);
    console.log(`${result.matchedCount} lists matched the query.`);
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main(); 