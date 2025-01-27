import { auth } from "@clerk/nextjs/server";
import { getEnhancedLists } from "@/lib/actions/lists";
import { getPinModel } from "@/lib/db/models-v2/pin";
import { PinnedListsLayout } from "@/components/lists/pinned-lists-layout";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: { q?: string };
}

export default async function PinnedListsPage({ searchParams }: PageProps) {
  const { userId } = auth();
  if (!userId) {
    redirect("/sign-in?returnUrl=/pinned");
  }

  // Get pinned list IDs
  const pinModel = await getPinModel();
  const pins = await pinModel.find({ clerkId: userId }).lean();
  const listIds = pins.map(pin => pin.listId);

  // Get lists with search filter if needed
  const searchQuery = searchParams.q;
  const filter = searchQuery 
    ? { _id: { $in: listIds }, title: { $regex: searchQuery, $options: "i" } }
    : { _id: { $in: listIds } };

  const { lists } = await getEnhancedLists(filter);

  return (
    <PinnedListsLayout
      lists={lists}
      searchQuery={searchQuery}
    />
  );
} 