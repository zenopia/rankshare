import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getEnhancedLists } from "@/lib/actions/lists";
import { CollabListsLayout } from "@/components/lists/collab-lists-layout";
import { getCollaboratorModel } from "@/lib/db/models/collaborator";
import { Collaborator } from "@/types/collaborator";
import { connectToDatabase } from "@/lib/db";

export default async function UserCollabListsPage({
  params: { username }
}: {
  params: { username: string }
}) {
  const { userId } = auth();

  // Redirect to sign in if not authenticated
  if (!userId) {
    redirect('/sign-in');
  }

  try {
    // Get user data
    const user = await clerkClient.users.getUser(userId);
    
    // Verify this is the user's own collab lists
    const cleanUsername = username.replace(/^@/, '');
    if (user.username !== cleanUsername) {
      redirect('/');
    }

    // Get lists where user is a collaborator
    await connectToDatabase();
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
  } catch (error) {
    console.error('Error loading collab lists page:', error);
    redirect('/sign-in');
  }
} 