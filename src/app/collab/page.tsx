import { auth, clerkClient } from "@clerk/nextjs/server";
import { getEnhancedLists } from "@/lib/actions/lists";
import { CollabListsLayout } from "@/components/lists/collab-lists-layout";
import { getCollaboratorModel } from "@/lib/db/models/collaborator";
import { Collaborator } from "@/types/collaborator";
import { connectToDatabase } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function CollabListsPage() {
  const { userId } = auth();

  // Get user data
  let user;
  try {
    if (!userId) {
      notFound();
    }
    user = await clerkClient.users.getUser(userId);
  } catch (error) {
    console.error('Error fetching user from Clerk:', error);
    notFound();
  }

  if (!user) {
    notFound();
  }

  // Ensure database connection
  await connectToDatabase();

  // Get lists where user is a collaborator
  const collaboratorModel = await getCollaboratorModel();
  const collabs = await collaboratorModel.find({ clerkId: userId });
  const listIds = collabs.map(collab => (collab as unknown as Collaborator).listId);

  // Get lists that have collaborators where either:
  // 1. User is the owner and the list has collaborators
  // 2. User is a collaborator on the list
  const { lists } = await getEnhancedLists({
    $and: [
      // Must have at least one collaborator
      { 'collaborators.0': { $exists: true } },
      // And either user is owner or user is a collaborator
      {
        $or: [
          { 'owner.clerkId': userId },
          { _id: { $in: listIds } }
        ]
      }
    ]
  });

  return (
    <CollabListsLayout 
      lists={lists} 
      initialUser={{
        id: user.id,
        username: user.username,
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || null,
        imageUrl: user.imageUrl,
      }}
    />
  );
} 