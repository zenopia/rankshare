import { notFound } from "next/navigation";
import { ListView } from "@/components/lists/list-view";
import { ListModel } from "@/lib/db/models/list";
import dbConnect from "@/lib/db/mongodb";
import { auth } from "@clerk/nextjs/server";
import type { List } from "@/types/list";
import { PinModel } from "@/lib/db/models/pin";

interface ListPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function ListPage({ params }: ListPageProps) {
  try {
    const resolvedParams = await params;
    await dbConnect();
    
    const list = await ListModel.findById(resolvedParams.id).lean() as unknown as List & { _id: string };
    
    if (!list) {
      notFound();
    }

    // Get the current user if they're logged in
    const { userId } = await auth();
    const isOwner = userId === list.ownerId;

    // Increment view count if the viewer is not the owner
    if (!isOwner) {
      await ListModel.findByIdAndUpdate(resolvedParams.id, {
        $inc: { viewCount: 1 }
      });
      list.viewCount += 1; // Update the local list object
    }

    // Create a clean object without MongoDB-specific properties
    const cleanList: List = {
      id: list._id.toString(),
      ownerId: list.ownerId,
      ownerName: list.ownerName || 'Anonymous',
      title: list.title,
      category: list.category,
      description: list.description,
      items: list.items,
      privacy: list.privacy,
      createdAt: list.createdAt,
      updatedAt: list.updatedAt,
      viewCount: list.viewCount
    };

    const pin = userId ? await PinModel.findOne({ 
      userId, 
      listId: resolvedParams.id 
    }).lean() : null;

    const isPinned = !!pin;
    const hasUpdate = pin ? new Date(list.updatedAt) > new Date(pin.lastViewedAt) : false;

    // Update lastViewedAt if pinned
    if (pin) {
      await PinModel.updateOne(
        { _id: pin._id },
        { $set: { lastViewedAt: new Date() } }
      );
    }

    return (
      <main className="container py-8">
        <ListView 
          list={cleanList} 
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