import mongoose from 'mongoose';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectToDatabase } from '@/lib/db/mongodb';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the correct path
config({ path: path.resolve(__dirname, '../../.env.local') });

// Verify environment variables are loaded
const V1_URI = process.env.MONGODB_URI || '';
const V2_URI = process.env.MONGODB_URI_V2 || '';

if (!V1_URI || !V2_URI) {
  throw new Error('MongoDB URIs must be defined in .env.local');
}

// Import models
import { getUserModel } from '@/lib/db/models-v2/user';
import { getListModel } from '@/lib/db/models-v2/list';
import { getFollowModel } from '@/lib/db/models-v2/follow';
import { getPinModel } from '@/lib/db/models-v2/pin';

// Define interfaces for V1 models
interface V1User {
  _id: mongoose.Types.ObjectId;
  clerkId: string;
  username: string;
  bio?: string;
  location?: string;
  dateOfBirth?: Date;
  gender?: string;
  livingStatus?: string;
  privacySettings?: {
    showBio?: boolean;
    showLocation?: boolean;
    showPersonalDetails?: boolean;
  };
}

interface V1List {
  _id: mongoose.Types.ObjectId;
  ownerId: string;
  title: string;
  description?: string;
  category: string;
  privacy: 'public' | 'private';
  items: Array<{
    title: string;
    comment?: string;
    rank: number;
    properties?: Array<{
      type?: 'text' | 'link';
      label: string;
      value: string;
    }>;
  }>;
  viewCount?: number;
  totalPins?: number;
  totalCopies?: number;
  collaborators?: Array<{
    userId: string;
    email?: string;
    role: string;
    status: string;
    invitedAt: Date;
    acceptedAt?: Date;
  }>;
  createdAt: Date;
  lastEditedAt?: Date;
}

interface V1Follow {
  _id: mongoose.Types.ObjectId;
  followerId: string;
  followingId: string;
}

interface V1Pin {
  _id: mongoose.Types.ObjectId;
  userId: string;
  listId: string;
}

// Connect to both databases
async function connectToDatabases() {
  const v1Connection = await mongoose.createConnection(V1_URI).asPromise();
  const v2Connection = await connectToDatabase(V2_URI);
  return { v1Connection, v2Connection };
}

async function migrateUsers(v1Connection: mongoose.Connection) {
  console.log('Starting user migration...');
  const V1UserModel = v1Connection.model<V1User>('User', new mongoose.Schema({}, { strict: false }));
  const V2UserModel = await getUserModel();
  const V2UserProfileModel = v1Connection.model('UserProfile', new mongoose.Schema({}, { strict: false }));

  const users = await V1UserModel.find({});
  console.log(`Found ${users.length} users to migrate`);

  for (const user of users) {
    try {
      // Try to update existing user or create new one
      const newUser = await V2UserModel.findOneAndUpdate(
        { clerkId: user.clerkId },
        {
          $setOnInsert: {
            clerkId: user.clerkId,
            username: user.username,
            displayName: user.username,
            searchIndex: `${user.username}`.toLowerCase(),
            followersCount: 0,
            followingCount: 0,
            listCount: 0
          }
        },
        { upsert: true, new: true }
      );

      // Try to update existing profile or create new one
      await V2UserProfileModel.findOneAndUpdate(
        { userId: newUser._id },
        {
          $setOnInsert: {
            userId: newUser._id,
            bio: user.bio,
            location: user.location,
            dateOfBirth: user.dateOfBirth,
            gender: user.gender,
            livingStatus: user.livingStatus,
            privacySettings: {
              showBio: user.privacySettings?.showBio ?? true,
              showLocation: user.privacySettings?.showLocation ?? true,
              showDateOfBirth: user.privacySettings?.showPersonalDetails ?? false,
              showGender: user.privacySettings?.showPersonalDetails ?? false,
              showLivingStatus: user.privacySettings?.showPersonalDetails ?? false
            }
          }
        },
        { upsert: true }
      );

      console.log(`Migrated/Updated user: ${user.username}`);
    } catch (error) {
      console.error(`Failed to migrate user: ${user.username}`, error);
    }
  }
}

async function migrateLists(v1Connection: mongoose.Connection) {
  console.log('Starting list migration...');
  const V1ListModel = v1Connection.model<V1List>('List', new mongoose.Schema({}, { strict: false }));
  const V2ListModel = await getListModel();
  const V2UserModel = await getUserModel();

  const lists = await V1ListModel.find({});
  console.log(`Found ${lists.length} lists to migrate`);

  // Keep track of old to new list IDs
  const listIdMap = new Map<string, string>();

  for (const list of lists) {
    try {
      const owner = await V2UserModel.findOne({ clerkId: list.ownerId });
      if (!owner) {
        console.error(`Owner not found for list: ${list.title}`);
        continue;
      }

      // Filter out items with empty titles and ensure all required fields
      const validItems = list.items
        .filter(item => item.title && item.title.trim())
        .map((item) => ({
          title: item.title.trim(),
          comment: item.comment,
          rank: item.rank,
          properties: item.properties?.map((prop) => ({
            type: prop.type || 'text',
            label: prop.label,
            value: prop.value
          }))
        }));

      if (validItems.length === 0) {
        console.error(`List "${list.title}" has no valid items, skipping`);
        continue;
      }

      // Create new list with V2 structure
      const newList = await V2ListModel.create({
        title: list.title,
        description: list.description,
        category: list.category,
        privacy: list.privacy,
        owner: {
          userId: owner._id,
          clerkId: owner.clerkId,
          username: owner.username,
          joinedAt: list.createdAt
        },
        items: validItems,
        stats: {
          viewCount: list.viewCount || 0,
          pinCount: list.totalPins || 0,
          copyCount: list.totalCopies || 0
        },
        collaborators: await Promise.all(
          (list.collaborators || []).map(async (collab) => {
            const collaborator = await V2UserModel.findOne({ clerkId: collab.userId });
            return {
              userId: collaborator?._id,
              clerkId: collab.userId,
              username: collaborator?.username,
              email: collab.email,
              role: collab.role === 'owner' ? 'admin' : collab.role,
              status: collab.status,
              invitedAt: collab.invitedAt,
              acceptedAt: collab.acceptedAt
            };
          })
        ),
        lastEditedAt: list.lastEditedAt
      });

      // Store the ID mapping
      listIdMap.set(list._id.toString(), (newList as any)._id.toString());

      // Update user's list count
      await V2UserModel.updateOne(
        { _id: owner._id },
        { $inc: { listCount: 1 } }
      );

      console.log(`Migrated list: ${list.title}`);
    } catch (error) {
      console.error(`Failed to migrate list: ${list.title}`, error);
    }
  }

  return listIdMap;
}

async function migrateFollows(v1Connection: mongoose.Connection) {
  console.log('Starting follow migration...');
  const V1FollowModel = v1Connection.model<V1Follow>('Follow', new mongoose.Schema({}, { strict: false }));
  const V2FollowModel = await getFollowModel();
  const V2UserModel = await getUserModel();

  const follows = await V1FollowModel.find({});
  console.log(`Found ${follows.length} follows to migrate`);

  for (const follow of follows) {
    try {
      const follower = await V2UserModel.findOne({ clerkId: follow.followerId });
      const following = await V2UserModel.findOne({ clerkId: follow.followingId });

      if (!follower || !following) {
        console.error('Could not find users for follow relationship');
        continue;
      }

      // Try to update existing follow or create new one
      await V2FollowModel.findOneAndUpdate(
        {
          followerId: follower.clerkId,
          followingId: following.clerkId
        },
        {
          $setOnInsert: {
            followerId: follower.clerkId,
            followingId: following.clerkId,
            status: 'accepted',
            followerInfo: {
              username: follower.username,
              displayName: follower.displayName
            },
            followingInfo: {
              username: following.username,
              displayName: following.displayName
            }
          }
        },
        { upsert: true }
      );

      // Update follow counts only if the follow was newly created
      const existingFollow = await V2FollowModel.findOne({
        followerId: follower.clerkId,
        followingId: following.clerkId
      });

      if (!existingFollow) {
        await Promise.all([
          V2UserModel.updateOne(
            { _id: follower._id },
            { $inc: { followingCount: 1 } }
          ),
          V2UserModel.updateOne(
            { _id: following._id },
            { $inc: { followersCount: 1 } }
          )
        ]);
      }

      console.log(`Migrated/Updated follow: ${follower.username} -> ${following.username}`);
    } catch (error) {
      console.error('Failed to migrate follow relationship', error);
    }
  }
}

async function migratePins(v1Connection: mongoose.Connection, listIdMap: Map<string, string>) {
  console.log('Starting pin migration...');
  const V1PinModel = v1Connection.model<V1Pin>('Pin', new mongoose.Schema({}, { strict: false }));
  const V2PinModel = await getPinModel();
  const V2UserModel = await getUserModel();
  const V2ListModel = await getListModel();

  const pins = await V1PinModel.find({});
  console.log(`Found ${pins.length} pins to migrate`);

  for (const pin of pins) {
    try {
      const user = await V2UserModel.findOne({ clerkId: pin.userId });
      const newListId = listIdMap.get(pin.listId.toString());
      
      if (!newListId) {
        console.error(`Could not find new list ID for pin with old list ID: ${pin.listId}`);
        continue;
      }

      const list = await V2ListModel.findById(newListId);

      if (!user || !list) {
        console.error(`Could not find user or list for pin (User: ${pin.userId}, List: ${newListId})`);
        continue;
      }

      await V2PinModel.create({
        userId: user._id,
        listId: list._id,
        listInfo: {
          title: list.title,
          category: list.category,
          ownerUsername: list.owner.username
        }
      });

      // Update list's pin count
      await V2ListModel.updateOne(
        { _id: list._id },
        { $inc: { 'stats.pinCount': 1 } }
      );

      console.log(`Migrated pin for list: ${list.title}`);
    } catch (error) {
      console.error('Failed to migrate pin', error);
    }
  }
}

async function runMigration() {
  try {
    console.log('Starting migration process...');
    const { v1Connection, v2Connection } = await connectToDatabases();

    // Run migrations in sequence
    await migrateUsers(v1Connection);
    const listIdMap = await migrateLists(v1Connection);
    await migrateFollows(v1Connection);
    await migratePins(v1Connection, listIdMap);

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration(); 