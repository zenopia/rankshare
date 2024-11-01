import { auth } from "@clerk/nextjs/server";
import { ListModel } from "@/lib/db/models/list";
import { PinModel } from "@/lib/db/models/pin";
import dbConnect from "@/lib/db/mongodb";
import { ListCard } from "@/components/lists/list-card";
import type { List } from "@/types/list";

export default async function SavedPage() {
  const { userId } = await auth();
  let pinnedLists: (List & { hasUpdate?: boolean })[] = [];

  if (userId) {
    try {
      await dbConnect();
      
      // Get all pins for the user
      const pins = await PinModel.find({ userId }).lean();
      
      // Get all pinned lists
      const lists = await ListModel
        .find({
          _id: { $in: pins.map(pin => pin.listId) }
        })
        .lean();

      // Map lists with update status
      pinnedLists = lists.map(list => {
        const pin = pins.find(p => p.listId === list._id.toString());
        const hasUpdate = pin ? new Date(list.updatedAt) > new Date(pin.lastViewedAt) : false;

        return {
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
          viewCount: list.viewCount,
          hasUpdate,
        };
      });
    } catch (error) {
      console.error('Error fetching pinned lists:', error);
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">Pinned Lists</h1>
      
      {pinnedLists.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pinnedLists.map((list) => (
            <ListCard 
              key={list.id} 
              list={list}
              hasUpdate={list.hasUpdate}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">
          No pinned lists yet. Find a list you like and pin it!
        </p>
      )}
    </div>
  );
} 