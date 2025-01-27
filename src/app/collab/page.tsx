import { auth, clerkClient } from "@clerk/nextjs/server";
import { getEnhancedLists } from "@/lib/actions/lists";
import { CollabListsLayout } from "@/components/lists/collab-lists-layout";
import { getCollaboratorModel } from "@/lib/db/models/collaborator";
import { Collaborator } from "@/types/collaborator";
import { connectToDatabase } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function CollabListsPage() {
  const { userId } = auth();

  // Redirect to sign in if not authenticated
  if (!userId) {
    redirect("/sign-in");
  }

  // Get user data
  let user;
  try {
    user = await clerkClient.users.getUser(userId);
  } catch (error) {
    console.error('Error fetching user from Clerk:', error);
    redirect("/sign-in");
  }

  if (!user) {
    redirect("/sign-in");
  }

  // Ensure database connection
  await connectToDatabase();

  // Get lists where user is a collaborator
  const collaboratorModel = await getCollaboratorModel();
  const collabs = await collaboratorModel.find({ clerkId: userId });
  const listIds = collabs.map(collab => (collab as unknown as Collaborator).listId);

  const { lists } = await getEnhancedLists({
    _id: { $in: listIds }
  });

  return (
    <CollabListsLayout lists={lists} />
  );
} 