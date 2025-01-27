import { auth } from "@clerk/nextjs/server";
import { getEnhancedLists } from "@/lib/actions/lists";
import { PinnedListsLayout } from "@/components/lists/pinned-lists-layout";
import { getPinModel } from "@/lib/db/models/pin";
import { connectToDatabase } from "@/lib/db";
import type { Document } from "mongoose";

interface PinDocument extends Document {
  listId: string;
  clerkId: string;
}

export default async function PinnedListsPage() {
  const { userId } = auth();

  // Ensure database connection
  await connectToDatabase();

  // Get pinned lists for the user
  const pinModel = await getPinModel();
  const pins = await pinModel.find({ clerkId: userId || '' });
  const listIds = pins.map((pin: PinDocument) => pin.listId);

  const { lists } = await getEnhancedLists({
    _id: { $in: listIds }
  });

  return (
    <PinnedListsLayout lists={lists} />
  );
} 