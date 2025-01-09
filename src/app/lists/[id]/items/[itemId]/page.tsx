import { notFound } from "next/navigation";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { ListModel } from "@/lib/db/models/list";
import { FollowModel } from "@/lib/db/models/follow";
import dbConnect from "@/lib/db/mongodb";
import { serializeList } from "@/lib/utils";
import { ItemView } from "@/components/items/item-view";
import type { ListDocument } from "@/types/list";
import type { MongoListDocument } from "@/types/mongodb";
import { SubLayout } from "@/components/layout/sub-layout";

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
      properties: item.properties,
      rank: item.rank,
      _id: item._id?.toString() || crypto.randomUUID()
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

    return (
      <SubLayout title="Item">
        <div className="px-4 md:px-6 lg:px-8 py-8">
          <ItemView 
            list={serializedList}
            item={serializedItem}
            isOwner={isOwner}
            isFollowing={!!followStatus}
            ownerUsername={owner?.username ?? undefined}
            ownerName={fullName || owner?.username || serializedList.ownerName}
          />
        </div>
      </SubLayout>
    );
    
  } catch (error) {
    console.error('Error fetching list item:', error);
    notFound();
  }
} 