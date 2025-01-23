import { config } from 'dotenv';
import path from 'path';

// Load the appropriate .env file based on NODE_ENV
const env = process.env.NODE_ENV || 'development';
config({ path: path.resolve(process.cwd(), env === 'production' ? '.env.production' : '.env.local') });

import { connectToMongoDB } from "@/lib/db/client";
import { getListModel } from "@/lib/db/models-v2/list";
import { getPinModel } from "@/lib/db/models-v2/pin";
import { getListViewModel } from "@/lib/db/models-v2/list-view";
import { Types } from "mongoose";

type BulkOperation = {
  updateOne: {
    filter: {
      clerkId: string;
      listId: Types.ObjectId;
    };
    update: {
      $set: {
        lastViewedAt: Date;
        accessType: 'pin' | 'owner' | 'collaborator';
      };
    };
    upsert: boolean;
  };
};

async function migrateListViews() {
  try {
    console.log('Connecting to MongoDB...');
    console.log('Environment:', env);
    await connectToMongoDB();
    
    const ListModel = await getListModel();
    const PinModel = await getPinModel();
    const ListViewModel = await getListViewModel();

    console.log('Dropping existing ListView collection...');
    await ListViewModel.collection.drop().catch(() => console.log('ListView collection did not exist'));

    console.log('Getting all lists...');
    const lists = await ListModel.find({}).lean();
    
    console.log('Getting all pins...');
    const pins = await PinModel.find({}).lean();

    const operations: BulkOperation[] = [];

    // Add views for pins
    console.log('Processing pins...');
    pins.forEach(pin => {
      operations.push({
        updateOne: {
          filter: { 
            clerkId: pin.clerkId,
            listId: new Types.ObjectId(pin.listId.toString())
          },
          update: {
            $set: {
              lastViewedAt: pin.lastViewedAt || new Date(),
              accessType: 'pin'
            }
          },
          upsert: true
        }
      });
    });

    // Add views for owners and collaborators
    console.log('Processing owners and collaborators...');
    lists.forEach(list => {
      // Add owner
      operations.push({
        updateOne: {
          filter: {
            clerkId: list.owner.clerkId,
            listId: new Types.ObjectId(list._id.toString())
          },
          update: {
            $set: {
              lastViewedAt: new Date(),
              accessType: 'owner'
            }
          },
          upsert: true
        }
      });

      // Add collaborators
      if (list.collaborators) {
        list.collaborators
          .filter(c => c.status === 'accepted')
          .forEach(collaborator => {
            if (!collaborator.clerkId) return;
            
            operations.push({
              updateOne: {
                filter: {
                  clerkId: collaborator.clerkId,
                  listId: new Types.ObjectId(list._id.toString())
                },
                update: {
                  $set: {
                    lastViewedAt: new Date(),
                    accessType: 'collaborator'
                  }
                },
                upsert: true
              }
            });
          });
      }
    });

    console.log(`Executing ${operations.length} operations...`);
    if (operations.length > 0) {
      await ListViewModel.bulkWrite(operations);
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateListViews(); 