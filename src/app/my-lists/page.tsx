import { auth, clerkClient } from "@clerk/nextjs/server";
import { getEnhancedLists } from "@/lib/actions/lists";
import { MyListsLayout } from "@/components/lists/my-lists-layout";
import { connectToDatabase } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function MyListsPage() {
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

  // Get lists owned by the user
  const { lists } = await getEnhancedLists({
    'owner.clerkId': userId
  });

  return (
    <MyListsLayout lists={lists} />
  );
} 