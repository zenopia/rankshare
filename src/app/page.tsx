import { ListCard } from "@/components/lists/list-card";
import { ListModel } from "@/lib/db/models/list";
import { PinModel } from "@/lib/db/models/pin";
import dbConnect from "@/lib/db/mongodb";
import Link from "next/link";
import { auth } from "@clerk/nextjs";
import type { MongoListDocument } from "@/types/mongodb";

export default async function HomePage() {
  let recentLists: Array<{
    id: string;
    ownerId: string;
    ownerName: string;
    title: string;
    category: string;
    description: string;
    items: any[];
    privacy: string;
    viewCount: number;
    createdAt: Date;
    updatedAt: Date;
    hasUpdate: boolean;
  }> = [];
  const { userId } = await auth();

  try {
    await dbConnect();

    // Get recent public lists
    const lists = await ListModel
      .find({ privacy: "public" })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()
      .exec() as MongoListDocument[];

    // If user is logged in, get their pins to check for updates
    let pins = [];
    if (userId) {
      pins = await PinModel.find({ userId }).lean();
    }

    // Add update status to lists
    recentLists = lists.map(list => ({
      id: list._id.toString(),
      ownerId: list.ownerId || '',
      ownerName: list.ownerName || 'Anonymous',
      title: list.title || '',
      category: list.category || 'movies',
      description: list.description || '',
      items: list.items || [],
      privacy: list.privacy || 'public',
      viewCount: list.viewCount || 0,
      createdAt: new Date(list.createdAt),
      updatedAt: new Date(list.updatedAt),
      hasUpdate: userId ? pins.some(pin => 
        pin.listId === list._id.toString() && 
        new Date(list.updatedAt) > new Date(pin.lastViewedAt)
      ) : false,
    }));
  } catch (error) {
    console.error('Failed to fetch lists:', error);
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Recent Lists</h1>
        <Link 
          href="/lists/create"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md"
        >
          Create List
        </Link>
      </div>

      {recentLists.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recentLists.map((list) => (
            <ListCard 
              key={list.id} 
              list={list}
              showUpdateBadge={list.hasUpdate}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">
          No lists found. Be the first to create one!
        </p>
      )}
    </div>
  );
}
