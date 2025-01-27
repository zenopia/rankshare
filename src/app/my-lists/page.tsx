import { auth, clerkClient } from "@clerk/nextjs/server";
import { getEnhancedLists } from "@/lib/actions/lists";
import { MyListsLayout } from "@/components/lists/my-lists-layout";
import { connectToDatabase } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function MyListsPage() {
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

  // Get lists owned by the user
  const { lists } = await getEnhancedLists({
    'owner.clerkId': userId
  });

  return (
    <MyListsLayout lists={lists} />
  );
} 