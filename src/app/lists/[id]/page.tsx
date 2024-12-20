import { auth, clerkClient } from '@clerk/nextjs/server';
import { notFound } from "next/navigation";
import { ListModel } from "@/lib/db/models/list";
import { PinModel } from "@/lib/db/models/pin";
import { FollowModel } from "@/lib/db/models/follow";
import dbConnect from "@/lib/db/mongodb";
import type { Pin } from "@/types/pin";
import { serializeList } from "@/lib/utils";
import { ensureUserExists } from "@/lib/actions/user";
import { ListView } from "@/components/lists/list-view";
import { MongoListDocument } from "@/types/mongodb";

interface ListPageProps {
  params: {
    id: string;
  };
}

export default async function ListPage({ params }: ListPageProps) {
  try {
    if (!params.id) {
      notFound();
    }

    await dbConnect();
    const { userId } = await auth();

    const list = await ListModel.findById(params.id)
      .lean()
      .exec() as unknown as MongoListDocument;
    
    if (!list) {
      notFound();
    }

    // Update view count
    await ListModel.findByIdAndUpdate(params.id, { $inc: { viewCount: 1 } });

    // Get pin if user is logged in
    let pin = null;
    let hasUpdate = false;
    if (userId) {
      pin = await PinModel.findOne({ 
        userId, 
        listId: params.id 
      }).lean() as Pin | null;

      // Check if list has been updated since last view
      hasUpdate = pin ? new Date(list.updatedAt) > new Date(pin.lastViewedAt) : false;
    }

    // Get the owner's Clerk user data
    const owner = list.ownerId ? await clerkClient.users.getUser(list.ownerId) : null;

    // Get counts and following status
    const [followStatus] = await Promise.all([
      userId ? FollowModel.findOne({ 
        followerId: userId,
        followingId: list.ownerId 
      }) : null
    ]);

    // Serialize the list data
    const serializedList = {
      ...serializeList(list),
      isOwner: userId === list.ownerId,
      isPinned: !!pin,
      ownerImageUrl: owner?.imageUrl,
      pinCount: list.totalPins,
      totalCopies: list.totalCopies,
      hasUpdate,
    };

    // Add to list view page when user is logged in
    if (userId) {
      await ensureUserExists();
    }

    return (
      <ListView 
        list={serializedList}
        isOwner={userId === serializedList.ownerId}
        isPinned={serializedList.isPinned}
        isFollowing={!!followStatus}
      >
        {/* Remove this section since UserProfileCard is already in ListView */}
      </ListView>
    );
  } catch (error) {
    notFound();
  }
} 