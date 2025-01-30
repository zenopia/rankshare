import { connectToDatabase } from "@/lib/db/mongodb";
import { getListModel } from "@/lib/db/models-v2/list";
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
const envFiles = ['.env', '.env.local', '.env.development', '.env.production'];
let envLoaded = false;

for (const file of envFiles) {
  const envPath = path.resolve(process.cwd(), file);
  const result = dotenv.config({ path: envPath });
  if (result.error === undefined) {
    console.log(`Loaded environment from: ${file}`);
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.warn('No environment file found, will try to use existing environment variables');
}

// Verify MongoDB URI
const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URI_V2;
if (!mongoUri) {
  console.error('Error: MongoDB URI not found in environment variables');
  console.error('Please ensure either MONGODB_URI or MONGODB_URI_V2 is set in your .env file');
  process.exit(1);
}

async function removeCollaboratorUsername() {
  try {
    console.log('Starting collaborator username removal migration...');
    console.log('Using MongoDB URI:', mongoUri.replace(/mongodb\+srv:\/\/[^@]+@/, 'mongodb+srv://[hidden]@'));
    
    // Connect to MongoDB
    const connection = await connectToDatabase();
    const ListModel = await getListModel();
    
    console.log('Connected to MongoDB successfully');
    
    // First, find all lists that have collaborators with username field
    const listsWithUsername = await ListModel.find({
      'collaborators.username': { $exists: true }
    }).lean();

    console.log(`Found ${listsWithUsername.length} lists with username field in collaborators`);
    
    if (listsWithUsername.length > 0) {
      console.log('\nExample collaborators from first list:');
      console.log(JSON.stringify(listsWithUsername[0].collaborators, null, 2));
    }

    // Confirm before proceeding
    console.log('\nProceeding with update...');
    
    // Update each list
    let updatedCount = 0;
    for (const list of listsWithUsername) {
      // Create new collaborators array without username field
      const updatedCollaborators = list.collaborators.map(({ username, ...rest }) => rest);
      
      // Update the list with the new collaborators array
      const result = await ListModel.updateOne(
        { _id: list._id },
        { $set: { collaborators: updatedCollaborators } }
      );
      
      if (result.modifiedCount > 0) {
        updatedCount++;
      }
    }

    // Verify the update
    const remainingListsWithUsername = await ListModel.countDocuments({
      'collaborators.username': { $exists: true }
    });

    // Log results
    console.log('\nMigration completed:');
    console.log(`Successfully updated ${updatedCount} out of ${listsWithUsername.length} lists`);
    console.log(`Remaining lists with username field: ${remainingListsWithUsername}`);

    if (remainingListsWithUsername > 0) {
      console.log('\nWarning: Some lists still have username field. The update might not have worked as expected.');
      
      // Show remaining lists for debugging
      const remainingLists = await ListModel.find({
        'collaborators.username': { $exists: true }
      }).lean();
      
      console.log('\nRemaining lists with username field:');
      for (const list of remainingLists) {
        console.log(`List ID: ${list._id}`);
        console.log('Collaborators:', JSON.stringify(list.collaborators, null, 2));
      }
    }

  } catch (error) {
    console.error('Migration failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
    }
  } finally {
    // Ensure the process exits
    process.exit(0);
  }
}

// Run the migration
removeCollaboratorUsername(); 