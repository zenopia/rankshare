import { notFound } from "next/navigation";
import { ListView } from "@/components/lists/list-view";
import { ListModel } from "@/lib/db/models/list";
import dbConnect from "@/lib/db/mongodb";
import { auth } from "@clerk/nextjs/server";
import type { List, ListDocument } from "@/types/list";
import { PinModel } from "@/lib/db/models/pin";
import type { IPin } from "@/lib/db/models/pin";

export default async function ListPage({ params }: { params: { id: string } }) {
  try {
    await dbConnect();
    
    const rawList = await ListModel.findById(params.id).lean() as ListDocument | null;
    
    if (!rawList) {
      notFound();
    }

    // Serialize the MongoDB document to a plain object
    const list: List = {
      id: rawList._id.toString(),
      ownerId: rawList.ownerId,
      ownerName: rawList.ownerName,
      title: rawList.title,
      category: rawList.category,
      description: rawList.description,
      items: rawList.items.map(item => ({
        title: item.title,
        rank: item.rank,
        comment: item.comment,
      })),
      privacy: rawList.privacy,
      viewCount: rawList.viewCount,
      createdAt: new Date(rawList.createdAt),
      updatedAt: new Date(rawList.updatedAt),
    };

    // Get the current user if they're logged in
    const { userId } = await auth();
    const isOwner = userId === list.ownerId;

    // Increment view count if the viewer is not the owner
    if (!isOwner) {
      await ListModel.findByIdAndUpdate(params.id, {
        $inc: { viewCount: 1 }
      });
      list.viewCount += 1;
    }

    const pin = userId ? await PinModel.findOne({ 
      userId, 
      listId: params.id 
    }).lean() as IPin | null : null;

    const isPinned = !!pin;
    const hasUpdate = pin ? list.updatedAt > new Date(pin.lastViewedAt) : false;

    // Update lastViewedAt if pinned
    if (pin) {
      await PinModel.updateOne(
        { _id: pin._id },
        { $set: { lastViewedAt: new Date() } }
      );
    }

    return (
      <main className="container mx-auto py-8 px-4">
        <ListView 
          list={list}
          isOwner={isOwner} 
          isPinned={isPinned}
          hasUpdate={hasUpdate}
        />
      </main>
    );
  } catch (error) {
    console.error('Error loading list:', error);
    notFound();
  }
} 