import { config } from 'dotenv';
import path from 'path';
import { Collection } from 'mongodb';
import mongoose from 'mongoose';

// Load environment variables based on NODE_ENV
const env = process.env.NODE_ENV || 'development';
const envFile = env === 'production' ? '.env.production' : '.env.local';
config({ path: path.resolve(process.cwd(), envFile) });

async function connectToMongoDB() {
  const uri = process.env.MONGODB_URI_V2;
  if (!uri) {
    throw new Error('MONGODB_URI_V2 is not defined in environment variables');
  }

  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

async function migrate() {
  try {
    console.log(`Starting migration in ${env} environment...`);
    
    // Connect to MongoDB
    await connectToMongoDB();
    
    // Get the lists collection
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Failed to get database instance');
    }
    
    const listsCollection = db.collection('lists');
    
    // Get all lists
    const lists = await listsCollection.find({}).toArray();
    console.log(`Found ${lists.length} lists to migrate`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Process each list
    for (const list of lists) {
      try {
        // Sort items by rank to preserve order
        const sortedItems = list.items?.sort((a: any, b: any) => a.rank - b.rank) || [];
        
        // Remove rank field from each item
        const updatedItems = sortedItems.map((item: any) => {
          const { rank, ...itemWithoutRank } = item;
          return itemWithoutRank;
        });
        
        // Update the list with new items array and add listType
        await listsCollection.updateOne(
          { _id: list._id },
          { 
            $set: { 
              items: updatedItems,
              listType: 'ordered' // Default to ordered since that was the previous behavior
            }
          }
        );
        
        successCount++;
        if (successCount % 100 === 0) {
          console.log(`Processed ${successCount} lists...`);
        }
      } catch (error) {
        console.error(`Error processing list ${list._id}:`, error);
        errorCount++;
      }
    }
    
    console.log('\nMigration completed:');
    console.log(`Successfully migrated: ${successCount} lists`);
    console.log(`Failed to migrate: ${errorCount} lists`);
    
    // Drop the index if it exists (in case there was an index on rank)
    try {
      await listsCollection.dropIndex('items.rank_1');
      console.log('Successfully dropped rank index');
    } catch (error) {
      // Index might not exist, that's okay
      console.log('No rank index found to drop');
    }
    
    console.log('Schema updated successfully');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    // Exit the process
    process.exit();
  }
}

// Run the migration
migrate(); 