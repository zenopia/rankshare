"use server";

import { AuthService } from "@/lib/services/auth.service";
import { clerkClient, User } from "@clerk/clerk-sdk-node";
import { connectToMongoDB } from "@/lib/db/client";
import { getListModel } from "@/lib/db/models-v2/list";
import { getUserCacheModel } from "@/lib/db/models-v2/user-cache";
import { getListViewModel } from "@/lib/db/models-v2/list-view";
import { FilterQuery, Types, QueryOptions } from "mongoose";
import { EnhancedList, List, ListItem, ListCollaborator } from "@/types/list";
import { MongoListDocument } from "@/types/mongo";
import { connectToDatabase } from "@/lib/db";

interface ListViewDocument {
  listId: Types.ObjectId;
  clerkId: string;
  lastViewedAt: Date;
  accessType: 'pin' | 'owner' | 'collaborator';
}

export async function getEnhancedLists(
  query: FilterQuery<MongoListDocument> = {}, 
  options: QueryOptions<MongoListDocument> = {}
): Promise<{
  lists: EnhancedList[];
  lastViewedMap?: Record<string, Date>;
}> {
  const user = await AuthService.getCurrentUser();
  await connectToMongoDB();

  // Fetch lists based on query
  const ListModel = await getListModel();
  const lists = await ListModel.find(query, null, options).lean() as unknown as MongoListDocument[];

  // Get unique owner IDs
  const ownerIds = Array.from(new Set(lists.map(list => list.owner.clerkId)));

  // Fetch user data for all owners in one query
  const UserCacheModel = await getUserCacheModel();
  const CACHE_TTL = 1 * 60 * 60 * 1000; // 1 hour instead of 24 hours
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

  // Find which users need to be fetched from Clerk
  const cachedUserIds = new Set(userCaches.map(u => u.clerkId));
  const missingUserIds = ownerIds.filter(id => !cachedUserIds.has(id));

  // Fetch missing users from Clerk and update cache
  if (missingUserIds.length > 0) {
    const clerkUsers = await clerkClient.users.getUserList({
      userId: missingUserIds,
    });

    // Prepare bulk write operations for cache updates
    const bulkOps = clerkUsers.map((user: User) => ({
      updateOne: {
        filter: { clerkId: user.id },
        update: {
          $set: {
            clerkId: user.id,
            username: user.username || '',
            displayName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || '',
            imageUrl: user.imageUrl,
            lastSynced: new Date()
          }
        },
        upsert: true
      }
    }));

    // Update cache
    if (bulkOps.length > 0) {
      await UserCacheModel.bulkWrite(bulkOps);
    }

    // Add fresh users to userCaches
    const freshUsers = clerkUsers.map((user: User) => ({
      clerkId: user.id,
      username: user.username || '',
      displayName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || '',
      imageUrl: user.imageUrl,
      lastSynced: new Date()
    }));

    userCaches = [...userCaches, ...freshUsers];
  }

  // Create a map for quick lookup
  const userDataMap = new Map(
    userCaches.map(user => [user.clerkId, {
      displayName: user.displayName,
      imageUrl: user.imageUrl,
      username: user.username
    }])
  );

  // If authenticated, get list view data to create lastViewedMap
  let lastViewedMap: Record<string, Date> | undefined;
  if (user) {
    const ListViewModel = await getListViewModel();
    const listViews = await ListViewModel.find({
      clerkId: user.id,
      listId: { $in: lists.map(list => list._id) }
    }).lean() as unknown as ListViewDocument[];

    lastViewedMap = Object.fromEntries(
      listViews.map(view => [view.listId.toString(), view.lastViewedAt])
    );
  }

  // Enhance lists with owner data
  const enhancedLists = lists.map(list => {
    const userData = userDataMap.get(list.owner.clerkId);
    const baseList: List = {
      id: list._id.toString(),
      title: list.title,
      description: list.description,
      category: list.category as List['category'],
      privacy: list.privacy,
      listType: list.listType || 'bullets',
      owner: {
        id: list.owner.userId.toString(),
        clerkId: list.owner.clerkId,
        username: userData?.username || list.owner.username,
        joinedAt: list.owner.joinedAt?.toISOString() || new Date().toISOString()
      },
      items: list.items?.map(item => ({
        id: crypto.randomUUID(),
        title: item.title,
        comment: item.comment,
        rank: item.rank,
        properties: item.properties?.map(prop => ({
          id: crypto.randomUUID(),
          type: prop.type as 'text' | 'link',
          label: prop.label,
          value: prop.value
        }))
      } as ListItem)) || [],
      stats: list.stats || { viewCount: 0, pinCount: 0, copyCount: 0 },
      collaborators: list.collaborators?.map(collab => ({
        id: collab.userId?.toString() || crypto.randomUUID(),
        clerkId: collab.clerkId || '',
        username: collab.username || '',
        role: collab.role,
        status: collab.status,
        invitedAt: collab.invitedAt.toISOString(),
        acceptedAt: collab.acceptedAt?.toISOString()
      } as ListCollaborator)),
      lastEditedAt: list.editedAt?.toISOString(),
      createdAt: list.createdAt.toISOString(),
      updatedAt: list.updatedAt.toISOString(),
      editedAt: list.editedAt?.toISOString()
    };

    const enhanced: EnhancedList = {
      ...baseList,
      owner: {
        ...baseList.owner,
        displayName: userData?.displayName || list.owner.username,
        imageUrl: userData?.imageUrl || null
      }
    };

    return enhanced;
  });

  return {
    lists: enhancedLists,
    lastViewedMap
  };
}

export async function getPinnedLists(userId: string) {
  // Ensure database connection
  await connectToDatabase();

  // Get pinned lists for the user
  const ListViewModel = await getListViewModel();
  const listViews = await ListViewModel.find({ 
    clerkId: userId,
    accessType: 'pin'
  }).lean() as unknown as ListViewDocument[];
  const listIds = listViews.map(view => view.listId);

  return getEnhancedLists({
    _id: { $in: listIds }
  });
}

export async function getSharedLists(userId: string) {
  // Ensure database connection
  await connectToDatabase();

  // Get lists where:
  // 1. The user is a collaborator with accepted status OR
  // 2. The user is the owner AND the list has any collaborators
  const ListModel = await getListModel();
  
  // Debug: Log the query we're about to run
  const query = {
    $or: [
      {
        'collaborators.clerkId': userId,
        'collaborators.status': 'accepted'
      },
      {
        $and: [
          { 'owner.clerkId': userId },
          { collaborators: { $type: 'array', $ne: [] } }
        ]
      }
    ]
  };
  console.log('Shared Lists Query:', JSON.stringify(query, null, 2));
  console.log('User ID:', userId);

  // First get raw lists to check what's being returned from MongoDB
  const rawLists = await ListModel.find(query).lean();
  console.log('Raw Lists Count:', rawLists.length);
  if (rawLists.length === 0) {
    // If no lists found, let's check if the user exists and has any lists at all
    const userLists = await ListModel.find({ 'owner.clerkId': userId }).lean();
    console.log('User Total Lists:', userLists.length);
    console.log('User Lists with Collaborators:', userLists.filter(l => l.collaborators?.length > 0).length);
  } else {
    console.log('Raw Lists:', JSON.stringify(rawLists.map(l => ({
      id: l._id,
      title: l.title,
      owner: l.owner.clerkId,
      collaborators: l.collaborators?.length || 0
    })), null, 2));
  }

  return getEnhancedLists(query);
} 