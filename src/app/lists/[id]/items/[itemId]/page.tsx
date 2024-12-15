import { notFound } from "next/navigation";
import { ListModel } from "@/lib/db/models/list";
import { FollowModel } from "@/lib/db/models/follow";
import dbConnect from "@/lib/db/mongodb";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { serializeList } from "@/lib/utils";
import type { ListDocument } from "@/types/list";
import type { MongoListDocument } from "@/types/mongodb";
import { ItemView } from "@/components/items/item-view";

interface ListItemPageProps {
  params: {
    id: string;
    itemId: string;
  };
}

export default async function ListItemPage({ params }: ListItemPageProps) {
  try {
    await dbConnect();
    const { userId } = await auth();

    const list = await ListModel.findById(params.id).lean() as MongoListDocument;
    if (!list) {
      notFound();
    }

    const itemRank = parseInt(params.itemId);
    const item = list.items?.find((item: { rank: number; title: string; comment?: string }) => 
      item.rank === itemRank
    );
    if (!item) {
      notFound();
    }

    // Get follow status
    const followStatus = userId ? await FollowModel.findOne({ 
      followerId: userId,
      followingId: list.ownerId 
    }) : null;

    // Get the owner's Clerk user data
    const owner = list.ownerId ? await clerkClient.users.getUser(list.ownerId) : null;
    const fullName = owner ? `${owner.firstName ?? ''} ${owner.lastName ?? ''}`.trim() : '';

    const serializedList = serializeList(list as ListDocument);
    const isOwner = userId === serializedList.ownerId;

    return <ItemView 
      list={{
        ...serializedList,
        ownerImageUrl: owner?.imageUrl ?? undefined
      }}
      item={item} 
      isOwner={isOwner}
      isFollowing={!!followStatus}
      ownerUsername={owner?.username ?? undefined}
      ownerName={fullName || owner?.username || serializedList.ownerName}
    />;
    
  } catch (error) {
    console.error('Error fetching list item:', error);
    notFound();
  }
} 