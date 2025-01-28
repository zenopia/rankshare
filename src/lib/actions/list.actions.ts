import { connectToDatabase } from "@/lib/db/mongodb";
import { getListModel } from "@/lib/models/list.model";

export async function getUserLists(userId: string) {
  try {
    console.log('Getting lists for user:', userId);
    await connectToDatabase();
    const ListModel = await getListModel();
    console.log('List Model initialized');
    
    const query = { 
      'owner.clerkId': userId,
      isDeleted: { $ne: true }
    };
    console.log('Query:', query);
    
    const lists = await ListModel.find(query)
      .sort({ updatedAt: -1 })
      .lean();
    console.log('Found lists:', lists.length);
    
    return lists;
  } catch (error) {
    console.error("Error loading user lists:", error);
    return [];
  }
}

export async function getListById(listId: string) {
  try {
    await connectToDatabase();
    const ListModel = await getListModel();
    
    const list = await ListModel.findOne({
      _id: listId,
      isDeleted: { $ne: true }
    }).lean();
    
    return list;
  } catch (error) {
    console.error("Error loading list:", error);
    return null;
  }
}

export async function getCollaboratingLists(userId: string) {
  try {
    await connectToDatabase();
    const ListModel = await getListModel();
    
    const lists = await ListModel.find({
      'collaborators': {
        $elemMatch: {
          clerkId: userId,
          status: 'accepted'
        }
      },
      isDeleted: { $ne: true }
    })
    .sort({ updatedAt: -1 })
    .lean();
    
    return lists;
  } catch (error) {
    console.error("Error loading collaborating lists:", error);
    return [];
  }
}

export async function getPinnedLists(userId: string) {
  try {
    await connectToDatabase();
    const ListModel = await getListModel();
    
    const lists = await ListModel.find({
      pinnedBy: userId,
      isDeleted: { $ne: true }
    })
    .sort({ pinnedAt: -1 })
    .lean();
    
    return lists;
  } catch (error) {
    console.error("Error loading pinned lists:", error);
    return [];
  }
} 