import { connectToDatabase } from "@/lib/db/mongodb";
import { getListModel } from "@/lib/db/models-v2/list";

export interface PendingCollaboration {
  id: string;
  list: {
    id: string;
    title: string;
    owner: {
      username: string;
    };
  };
  role: string;
  status: string;
}

export async function getPendingCollaborations(userId: string): Promise<PendingCollaboration[]> {
  await connectToDatabase();
  const ListModel = await getListModel();
  
  const lists = await ListModel.find({
    'collaborators': {
      $elemMatch: {
        clerkId: userId,
        status: 'pending'
      }
    }
  }).lean();

  return lists.map(list => ({
    id: list._id.toString(),
    list: {
      id: list._id.toString(),
      title: list.title,
      owner: {
        username: list.owner.username
      }
    },
    role: list.collaborators.find(c => c.clerkId === userId)?.role || 'viewer',
    status: 'pending'
  }));
} 