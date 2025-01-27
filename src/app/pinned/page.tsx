import { auth } from "@clerk/nextjs/server";
import { getEnhancedLists } from "@/lib/actions/lists";
import { getPinModel } from "@/lib/db/models-v2/pin";
import { PinnedListsLayout } from "@/components/lists/pinned-lists-layout";

export default async function PinnedListsPage() {
  const { userId } = auth();
  if (!userId) return null;

  // Get pinned list IDs
  const pinModel = await getPinModel();
  const pins = await pinModel.find({ clerkId: userId }).lean();
  const listIds = pins.map(pin => pin.listId);

  // Get lists
  const { lists } = await getEnhancedLists({
    _id: { $in: listIds }
  });

  return (
    <PinnedListsLayout lists={lists} />
  );
} 