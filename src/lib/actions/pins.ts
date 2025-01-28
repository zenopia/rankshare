import { connectToDatabase } from "@/lib/db";
import { PinnedListModel } from "@/lib/db/models-v2/pinned-list";
import { Types } from "mongoose";

export async function getIsPinned(userId: string, listId: string): Promise<boolean> {
  try {
    await connectToDatabase();
    
    const pinnedList = await PinnedListModel.findOne({
      userId,
      listId: new Types.ObjectId(listId),
    }).lean();
    
    return !!pinnedList;
  } catch (error) {
    console.error("Error checking if list is pinned:", error);
    return false;
  }
}

export async function pinList(userId: string, listId: string): Promise<boolean> {
  try {
    await connectToDatabase();
    
    const existingPin = await PinnedListModel.findOne({
      userId,
      listId: new Types.ObjectId(listId),
    });

    if (existingPin) {
      return true;
    }

    await PinnedListModel.create({
      userId,
      listId: new Types.ObjectId(listId),
      pinnedAt: new Date(),
    });

    return true;
  } catch (error) {
    console.error("Error pinning list:", error);
    return false;
  }
}

export async function unpinList(userId: string, listId: string): Promise<boolean> {
  try {
    await connectToDatabase();
    
    await PinnedListModel.findOneAndDelete({
      userId,
      listId: new Types.ObjectId(listId),
    });

    return true;
  } catch (error) {
    console.error("Error unpinning list:", error);
    return false;
  }
} 