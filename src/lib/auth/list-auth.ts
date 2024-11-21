import { ListModel } from "@/lib/db/models/list";
import dbConnect from "@/lib/db/mongodb";

export async function canEditList(listId: string, userId: string) {
  await dbConnect();
  
  const list = await ListModel.findOne({ 
    _id: listId,
    ownerId: userId
  });
  
  return !!list;
} 