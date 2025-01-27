import { auth } from "@clerk/nextjs/server";
import { getEnhancedLists } from "@/lib/actions/lists";
import { getCollaboratorModel } from "@/lib/db/models/collaborator";
import { CollabListsLayout } from "@/components/lists/collab-lists-layout";
import type { Collaborator } from "@/types/collaborator";

export default async function CollabListsPage() {
  const { userId } = auth();
  if (!userId) return null;

  // Get lists where user is a collaborator
  const collabModel = await getCollaboratorModel();
  const collabs = await collabModel.find({ 
    clerkId: userId,
    status: 'accepted'
  }).lean();
  const listIds = collabs.map(collab => (collab as unknown as Collaborator).listId);

  // Get lists
  const { lists } = await getEnhancedLists({
    _id: { $in: listIds }
  });

  return (
    <CollabListsLayout lists={lists} />
  );
} 