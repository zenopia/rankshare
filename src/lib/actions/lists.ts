"use server";

import { auth } from "@clerk/nextjs/server";
import { clerkClient, User } from "@clerk/clerk-sdk-node";
import { connectToMongoDB } from "@/lib/db/client";
import { getListModel } from "@/lib/db/models-v2/list";
import { getUserCacheModel } from "@/lib/db/models-v2/user-cache";
import { getPinModel } from "@/lib/db/models-v2/pin";
import { FilterQuery, Types, QueryOptions } from "mongoose";
import { EnhancedList, List, ListItem, ListCollaborator, ListOwner } from "@/types/list";
import { MongoListDocument, MongoListCollaborator } from "@/types/mongo";
import { connectToDatabase } from "@/lib/db";
import { Model } from "mongoose";
import { revalidatePath } from "next/cache";
import { ListCategory, ListPrivacy } from "@/types/list";
import { 
  createListEditedNotification, 
  createListDeletedNotification,
  createListSharedNotification 
} from "@/lib/services/notification-service";

interface MongoPinDocument {
  listId: Types.ObjectId;
  clerkId: string;
  lastViewedAt: Date;
}

function transformMongoListToList(mongoList: MongoListDocument): List {
  return {
    id: mongoList._id.toString(),
    title: mongoList.title,
    description: mongoList.description || null,
    category: mongoList.category,
    privacy: mongoList.privacy,
    owner: {
      clerkId: mongoList.owner.clerkId,
      username: mongoList.owner.username,
    },
    items: mongoList.items?.map(item => ({
      id: item._id.toString(),
      title: item.title,
      description: item.comment || null,
      url: item.properties?.find(p => p.type === "link")?.value || null,
      position: item.rank
    })) || [],
    stats: {
      viewCount: mongoList.stats?.viewCount || 0,
      pinCount: mongoList.stats?.pinCount || 0,
      itemCount: mongoList.items?.length || 0
    },
    collaborators: mongoList.collaborators?.map(collab => ({
      clerkId: collab.clerkId,
      username: collab.username,
      role: collab.role,
      status: collab.status
    })) || [],
    createdAt: mongoList.createdAt.toISOString(),
    updatedAt: mongoList.updatedAt.toISOString(),
    ...(mongoList.pinnedAt && { pinnedAt: mongoList.pinnedAt.toISOString() })
  };
}

function transformMongoListToEnhancedList(
  mongoList: MongoListDocument,
  userData?: { displayName: string; imageUrl: string | null; username: string } | null
): EnhancedList {
  const baseList = transformMongoListToList(mongoList);
  return {
    ...baseList,
    owner: {
      id: mongoList.owner.userId.toString(),
      clerkId: mongoList.owner.clerkId,
      username: mongoList.owner.username || '',
      joinedAt: mongoList.owner.joinedAt.toISOString(),
      displayName: userData?.displayName || mongoList.owner.username || '',
      imageUrl: userData?.imageUrl || null
    }
  };
}

export async function getEnhancedLists(
  query: FilterQuery<MongoListDocument> = {}, 
  options: QueryOptions<MongoListDocument> = {}
): Promise<{
  lists: EnhancedList[];
  lastViewedMap?: Record<string, Date>;
}> {
  try {
    const { userId } = auth();
    await connectToMongoDB();

    // Fetch lists based on query
    const ListModel = await getListModel();
    const lists = await ListModel.find(query, null, options).lean() as unknown as MongoListDocument[];

    // Get unique owner IDs
    const ownerIds = Array.from(new Set(lists.map(list => list.owner.clerkId)));

    // Fetch user data for all owners in one query
    const UserCacheModel = await getUserCacheModel();
    const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
    let userCaches = await UserCacheModel.find({
      clerkId: { $in: ownerIds },
      lastSynced: { $gt: new Date(Date.now() - CACHE_TTL) }
    }).lean() as Array<{
      clerkId: string;
      username: string;
      displayName: string;
      imageUrl: string | null;
      lastSynced: Date;
    }>;

    // Create a map for quick lookup
    const userDataMap = new Map(
      userCaches.map(user => [user.clerkId, {
        displayName: user.displayName || '',
        imageUrl: user.imageUrl,
        username: user.username || ''
      }])
    );

    // If authenticated, get pin data to create lastViewedMap
    let lastViewedMap: Record<string, Date> | undefined;
    if (userId) {
      const PinModel = await getPinModel();
      const pins = await PinModel.find({
        clerkId: userId,
        listId: { $in: lists.map(list => list._id) }
      }).lean() as unknown as MongoPinDocument[];

      lastViewedMap = Object.fromEntries(
        pins.map(pin => [pin.listId.toString(), pin.lastViewedAt])
      );
    }

    // Enhance lists with owner data
    const enhancedLists = lists.map(list => 
      transformMongoListToEnhancedList(list, userDataMap.get(list.owner.clerkId))
    );

    return {
      lists: enhancedLists,
      lastViewedMap
    };
  } catch (error) {
    console.error('Error in getEnhancedLists:', error);
    return {
      lists: [],
      lastViewedMap: {}
    };
  }
}

export async function getPinnedLists(userId: string) {
  // Ensure database connection
  await connectToMongoDB();

  // Get pinned lists for the user
  const pinModel = await getPinModel();
  const pins = await pinModel.find({ clerkId: userId }).lean() as unknown as MongoPinDocument[];
  const listIds = pins.map(pin => pin.listId);

  return getEnhancedLists({
    _id: { $in: listIds }
  });
}

export async function getPublicLists(userId: string): Promise<List[]> {
  await connectToMongoDB();
  const ListModel = await getListModel();
  
  const lists = await ListModel.find({ 
    'owner.clerkId': userId,
    privacy: 'public',
    isDeleted: { $ne: true }
  })
  .sort({ updatedAt: -1 })
  .lean() as unknown as MongoListDocument[];
  
  return lists.map(transformMongoListToList);
}

export async function getListById(listId: string): Promise<List | null> {
  await connectToMongoDB();
  const ListModel = await getListModel();
  
  const list = await ListModel.findOne({ 
    _id: listId,
    isDeleted: { $ne: true }
  }).lean() as unknown as MongoListDocument | null;
  
  if (!list) return null;
  
  return transformMongoListToList(list);
}

export async function getList(listId: string): Promise<EnhancedList | null> {
  try {
    await connectToDatabase();
    const ListModel = await getListModel();
    
    const list = await ListModel.findById(listId).lean<MongoListDocument>();
    
    if (!list) {
      return null;
    }

    // Get enhanced owner info from Clerk
    const owner = await clerkClient.users.getUser(list.owner.clerkId);
    
    return transformMongoListToEnhancedList(list, {
      displayName: `${owner.firstName || ''} ${owner.lastName || ''}`.trim() || owner.username || '',
      imageUrl: owner.imageUrl,
      username: owner.username || ''
    });
  } catch (error) {
    console.error("Error getting list:", error);
    return null;
  }
}

interface UpdateListInput {
  title: string;
  description: string | null;
  category: ListCategory;
  privacy: ListPrivacy;
}

interface UpdateListItemInput {
  id?: string;
  title: string;
  description: string | null;
  url: string | null;
  position: number;
}

export async function updateList(
  listId: string, 
  data: UpdateListInput
): Promise<EnhancedList | null> {
  try {
    const { userId } = auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    await connectToDatabase();
    const ListModel = await getListModel();
    
    // Find list and verify ownership/permissions
    const list = await ListModel.findById(listId).lean<MongoListDocument>();
    if (!list) {
      throw new Error("List not found");
    }
    
    if (list.owner.clerkId !== userId && 
        !list.collaborators.some(c => 
          c.clerkId === userId && 
          c.status === "accepted" && 
          c.role === "editor"
        )) {
      throw new Error("Unauthorized");
    }

    // Update list
    const updatedList = await ListModel.findByIdAndUpdate(
      listId,
      {
        $set: {
          title: data.title,
          description: data.description,
          category: data.category,
          privacy: data.privacy,
        }
      },
      { new: true }
    ).lean<MongoListDocument>();

    if (!updatedList) {
      throw new Error("Failed to update list");
    }

    // Get enhanced owner info
    const owner = await clerkClient.users.getUser(updatedList.owner.clerkId);
    const actorUser = await clerkClient.users.getUser(userId);
    const actorName = `${actorUser.firstName || ''} ${actorUser.lastName || ''}`.trim() || actorUser.username || '';
    
    // Notify collaborators about the update
    if (updatedList.collaborators?.length) {
      const collaboratorIds = updatedList.collaborators
        .filter(c => c.status === "accepted" && c.clerkId !== userId)
        .map(c => c.clerkId);

      await Promise.all(
        collaboratorIds.map(collaboratorId =>
          createListEditedNotification(
            collaboratorId,
            actorName,
            updatedList.title,
            updatedList._id.toString()
          )
        )
      );
    }

    return transformMongoListToEnhancedList(updatedList, {
      displayName: `${owner.firstName || ''} ${owner.lastName || ''}`.trim() || owner.username || '',
      imageUrl: owner.imageUrl,
      username: owner.username || ''
    });
  } catch (error) {
    console.error("Error updating list:", error);
    return null;
  }
}

export async function updateListItems(
  listId: string,
  items: UpdateListItemInput[]
): Promise<EnhancedList | null> {
  try {
    const { userId } = auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    await connectToDatabase();
    const ListModel = await getListModel();
    
    // Find list and verify ownership/permissions
    const list = await ListModel.findById(listId).lean<MongoListDocument>();
    if (!list) {
      throw new Error("List not found");
    }
    
    if (list.owner.clerkId !== userId && 
        !list.collaborators.some(c => 
          c.clerkId === userId && 
          c.status === "accepted" && 
          c.role === "editor"
        )) {
      throw new Error("Unauthorized");
    }

    // Transform items to match schema
    const transformedItems = items.map(item => ({
      ...(item.id && { _id: new Types.ObjectId(item.id) }),
      title: item.title,
      comment: item.description,
      rank: item.position,
      properties: item.url ? [{
        type: "link",
        label: "URL",
        value: item.url
      }] : []
    }));

    // Update list items
    const updatedList = await ListModel.findByIdAndUpdate(
      listId,
      {
        $set: {
          items: transformedItems,
          'stats.itemCount': transformedItems.length
        }
      },
      { new: true }
    ).lean<MongoListDocument>();

    if (!updatedList) {
      throw new Error("Failed to update list items");
    }

    // Get enhanced owner info
    const owner = await clerkClient.users.getUser(updatedList.owner.clerkId);
    
    return transformMongoListToEnhancedList(updatedList, {
      displayName: `${owner.firstName || ''} ${owner.lastName || ''}`.trim() || owner.username || '',
      imageUrl: owner.imageUrl,
      username: owner.username || ''
    });
  } catch (error) {
    console.error("Error updating list items:", error);
    return null;
  }
}

export async function deleteList(listId: string): Promise<boolean> {
  try {
    const { userId } = auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    await connectToDatabase();
    const ListModel = await getListModel();
    
    // Find list and verify ownership
    const list = await ListModel.findById(listId).lean<MongoListDocument>();
    if (!list) {
      throw new Error("List not found");
    }
    
    if (list.owner.clerkId !== userId) {
      throw new Error("Unauthorized");
    }

    // Get actor info for notification
    const actorUser = await clerkClient.users.getUser(userId);
    const actorName = `${actorUser.firstName || ''} ${actorUser.lastName || ''}`.trim() || actorUser.username || '';

    // Notify collaborators about the deletion
    if (list.collaborators?.length) {
      const collaboratorIds = list.collaborators
        .filter(c => c.status === "accepted")
        .map(c => c.clerkId);

      await Promise.all(
        collaboratorIds.map(collaboratorId =>
          createListDeletedNotification(
            collaboratorId,
            actorName,
            list.title
          )
        )
      );
    }

    // Soft delete the list
    await ListModel.findByIdAndUpdate(listId, {
      $set: {
        isDeleted: true
      }
    });

    return true;
  } catch (error) {
    console.error("Error deleting list:", error);
    return false;
  }
}

export async function copyList(listId: string, options?: { title?: string }) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  await connectToMongoDB();
  const List = await getListModel() as Model<MongoListDocument>;

  // Get the source list
  const sourceList = await List.findById(listId).lean<MongoListDocument>();
  if (!sourceList) throw new Error("List not found");

  // Check if list is public or user has access
  if (sourceList.privacy === "private" && 
      sourceList.owner.clerkId !== userId && 
      !sourceList.collaborators?.some(c => c.clerkId === userId && c.status === "accepted")) {
    throw new Error("Not authorized to copy this list");
  }

  // Get user details
  const user = await clerkClient.users.getUser(userId);

  // Create new list
  const newList = await List.create({
    title: options?.title || `${sourceList.title} (Copy)`,
    description: sourceList.description,
    category: sourceList.category as ListCategory,
    privacy: "private" as ListPrivacy,
    owner: {
      clerkId: userId,
      username: user.username || "",
      joinedAt: new Date()
    },
    items: sourceList.items.map(item => ({
      ...item,
      _id: new Types.ObjectId()
    })),
    stats: {
      viewCount: 0,
      pinCount: 0,
      itemCount: sourceList.items.length
    },
    collaborators: [] as MongoListCollaborator[],
    createdAt: new Date(),
    updatedAt: new Date(),
    editedAt: new Date()
  });

  // Update source list stats
  await List.findByIdAndUpdate(listId, {
    $inc: { "stats.copyCount": 1 }
  });

  revalidatePath(`/lists/${newList._id}`);
  return newList;
}

export async function generateShareLink(listId: string) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  await connectToMongoDB();
  const List = await getListModel() as Model<MongoListDocument>;

  // Get the list
  const list = await List.findById(listId).lean<MongoListDocument>();
  if (!list) throw new Error("List not found");

  // Check if user has permission to share
  if (list.owner.clerkId !== userId && 
      !list.collaborators?.some(c => 
        c.clerkId === userId && 
        c.status === "accepted"
      )) {
    throw new Error("Not authorized to share this list");
  }

  // Get actor info for notification
  const actorUser = await clerkClient.users.getUser(userId);
  const actorName = `${actorUser.firstName || ''} ${actorUser.lastName || ''}`.trim() || actorUser.username || '';

  // If the list is private, update it to unlisted
  if (list.privacy === "private") {
    await List.findByIdAndUpdate(listId, {
      $set: { privacy: "unlisted" as ListPrivacy }
    });

    // Notify collaborators about the list being shared
    if (list.collaborators?.length) {
      const collaboratorIds = list.collaborators
        .filter(c => c.status === "accepted" && c.clerkId !== userId)
        .map(c => c.clerkId);

      await Promise.all(
        collaboratorIds.map(collaboratorId =>
          createListSharedNotification(
            collaboratorId,
            actorName,
            list.title,
            list._id.toString()
          )
        )
      );
    }
  }

  // Return the share URL
  return `/lists/${listId}`;
}

export async function getRecentLists(userId: string) {
  return getEnhancedLists({
    $or: [
      { 'owner.clerkId': userId },
      { 'collaborators.clerkId': userId }
    ],
    isDeleted: { $ne: true }
  }, {
    sort: { updatedAt: -1 },
    limit: 6
  });
} 