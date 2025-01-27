import { auth } from "@clerk/nextjs/server";
import { getEnhancedLists } from "@/lib/actions/lists";
import { MyListsLayout } from "@/components/lists/my-lists-layout";

interface PageProps {
  searchParams: { q?: string };
}

export default async function MyListsPage({ searchParams }: PageProps) {
  const { userId } = auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }

  const searchQuery = searchParams.q;
  const filter = searchQuery 
    ? { ownerId: userId, title: { $regex: searchQuery, $options: "i" } }
    : { ownerId: userId };

  const { lists } = await getEnhancedLists(filter);

  return (
    <MyListsLayout
      lists={lists}
      searchQuery={searchQuery}
    />
  );
} 