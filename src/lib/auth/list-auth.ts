import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { getListModel } from "@/lib/db/models-v2/list";
import { connectToMongoDB } from "@/lib/db/client";
import { MongoListDocument } from "@/types/mongo";

export async function getAuthorizedList(listId: string): Promise<MongoListDocument> {
  const { userId } = auth();
  if (!userId) {
    notFound();
  }

  await connectToMongoDB();
  const ListModel = await getListModel();

  const list = await ListModel.findById(listId).lean() as unknown as MongoListDocument;
  if (!list) {
    notFound();
  }

  // Check if user is owner or collaborator
  const isOwner = list.owner.clerkId === userId;
  const isCollaborator = list.collaborators?.some(c => c.clerkId === userId && c.status === 'accepted');
  
  if (!isOwner && !isCollaborator) {
    notFound();
  }

  return list;
}

export async function getAuthorizedListForView(listId: string): Promise<MongoListDocument> {
  const { userId } = auth();

  await connectToMongoDB();
  const ListModel = await getListModel();

  const list = await ListModel.findById(listId).lean() as unknown as MongoListDocument;
  if (!list) {
    notFound();
  }

  // Public and unlisted lists can be viewed by anyone
  if (list.privacy === 'public' || list.privacy === 'unlisted') {
    return list;
  }

  // Private lists can only be viewed by owner or collaborators
  if (!userId) {
    notFound();
  }

  const isOwner = list.owner.clerkId === userId;
  const isCollaborator = list.collaborators?.some(c => c.clerkId === userId && c.status === 'accepted');
  
  if (!isOwner && !isCollaborator) {
    notFound();
  }

  return list;
} 