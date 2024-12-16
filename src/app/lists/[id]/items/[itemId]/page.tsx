import { notFound } from "next/navigation";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { ListModel } from "@/lib/db/models/list";
import { FollowModel } from "@/lib/db/models/follow";
import dbConnect from "@/lib/db/mongodb";
import { serializeList } from "@/lib/utils";
import { ItemView } from "@/components/items/item-view";
import type { ListDocument } from "@/types/list";
import type { MongoListDocument } from "@/types/mongodb";

interface ItemPageProps {
  params: {
    id: string;
    itemId: string;
  };
}

export default async function ItemPage({ params }: ItemPageProps) {
  try {
    await dbConnect();
    const { userId } = await auth();

    const list = await ListModel.findById(params.id).lean() as MongoListDocument;
    if (!list) {
      notFound();
    }

    const item = list.items.find(item => item.rank === parseInt(params.itemId));
    if (!item) {
      notFound();
    }

    // Serialize the item to remove MongoDB specific fields
    const serializedItem = {
      title: item.title,
      comment: item.comment,
      link: item.link,
      rank: item.rank,
      _id: item._id?.toString() || crypto.randomUUID() // Ensure _id is always a string
    };

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
      item={serializedItem} 
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