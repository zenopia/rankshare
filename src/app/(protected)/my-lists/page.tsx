import { auth } from "@clerk/nextjs/server";
import { getEnhancedLists } from "@/lib/actions/lists";
import { MyListsLayout } from "@/components/lists/my-lists-layout";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: { q?: string };
}

export default async function MyListsPage({ searchParams }: PageProps) {
  const { userId } = auth();
  if (!userId) {
    redirect("/sign-in?returnUrl=/my-lists");
  }

  const searchQuery = searchParams.q;
  const filter = searchQuery 
    ? { owner: { clerkId: userId }, title: { $regex: searchQuery, $options: "i" } }
    : { owner: { clerkId: userId } };

  const { lists } = await getEnhancedLists(filter);

  return (
    <MyListsLayout
      lists={lists}
      searchQuery={searchQuery}
    />
  );
} 