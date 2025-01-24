"use server";

import { auth } from "@clerk/nextjs/server";
import { connectToMongoDB } from "@/lib/db/client";
import { getListModel } from "@/lib/db/models-v2/list";
import { getUserCacheModel } from "@/lib/db/models-v2/user-cache";
import { getPinModel } from "@/lib/db/models-v2/pin";
import { MongoListDocument } from "@/types/mongo";
import { List } from "@/types/list";
import { serializeList } from "@/lib/utils";

export interface EnhancedList extends List {
  owner: List['owner'] & {
    displayName: string;
    imageUrl: string | null;
  };
}

export async function getEnhancedLists(lists: MongoListDocument[]): Promise<{
  enhancedLists: EnhancedList[];
  lastViewedMap: Record<string, Date>;
}> {
  const { userId } = auth();
  
  // Get all unique owner IDs
  const ownerIds = Array.from(new Set(lists.map(list => list.owner.clerkId)));
  
  // Fetch user data for all owners in one query
  const UserCacheModel = await getUserCacheModel();
  const ownerData = await UserCacheModel.find({
    clerkId: { $in: ownerIds }
  }).lean();
  
  // Create a map for quick lookup
  const ownerDataMap = ownerData.reduce((acc, owner) => {
    acc[owner.clerkId] = owner;
    return acc;
  }, {} as Record<string, any>);

  // If authenticated, get pin data
  let lastViewedMap: Record<string, Date> = {};
  if (userId) {
    const PinModel = await getPinModel();
    const pins = await PinModel.find({
      clerkId: userId,
      listId: { $in: lists.map(list => list._id) }
    }).lean();

    lastViewedMap = pins.reduce((acc, pin) => {
      acc[pin.listId.toString()] = pin.lastViewedAt;
      return acc;
    }, {} as Record<string, Date>);
  }

  // Enhance lists with owner data
  const enhancedLists = lists.map(list => {
    const serialized = serializeList(list);
    const owner = ownerDataMap[list.owner.clerkId];
    
    return {
      ...serialized,
      owner: {
        ...serialized.owner,
        displayName: owner?.displayName || serialized.owner.username,
        imageUrl: owner?.imageUrl || null
      }
    };
  });

  return {
    enhancedLists,
    lastViewedMap
  };
} 