import { auth } from "@clerk/nextjs/server";
import { getEnhancedLists } from "@/lib/actions/lists";
import { MyListsLayout } from "@/components/lists/my-lists-layout";
import { connectToDatabase } from "@/lib/db";

export default async function MyListsPage() {
  const { userId } = auth();

  // Ensure database connection
  await connectToDatabase();

  // Get lists owned by the user
  const { lists } = await getEnhancedLists({
    'owner.clerkId': userId || ''
  });

  return (
    <MyListsLayout lists={lists} />
  );
} 