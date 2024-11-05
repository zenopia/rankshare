import { auth } from "@clerk/nextjs/server";
import { ListModel } from "@/lib/db/models/list";
import { PinModel } from "@/lib/db/models/pin";
import dbConnect from "@/lib/db/mongodb";
import { ListCard } from "@/components/lists/list-card";
import { DashboardSearchForm } from "@/components/search/dashboard-search-form";
import type { List, ListCategory } from "@/types/list";
import type { MongoListDocument } from "@/types/mongodb";

interface SearchParams {
  q?: string;
  category?: ListCategory;
  sort?: 'newest' | 'oldest' | 'most-viewed';
}

interface SavedList extends List {
  hasUpdate: boolean;
}

export default async function SavedPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { userId } = await auth();
  if (!userId) return null;

  await dbConnect();

  // Get user's pins with last viewed time
  const pins = await PinModel.find({ userId }).lean();
  const pinnedListIds = pins.map(pin => pin.listId);

  // Build filter
  const filter: any = { 
    _id: { $in: pinnedListIds }
  };
  
  if (searchParams.q) {
    filter.$or = [
      { title: { $regex: searchParams.q, $options: 'i' } },
      { 'items.title': { $regex: searchParams.q, $options: 'i' } },
      { 'items.comment': { $regex: searchParams.q, $options: 'i' } },
    ];
  }

  if (searchParams.category) {
    filter.category = searchParams.category;
  }

  // Fetch lists
  const lists = await ListModel
    .find(filter)
    .sort({ createdAt: -1 })
    .lean()
    .exec() as unknown as MongoListDocument[];

  // Add update status to lists
  const savedLists: SavedList[] = lists.map(list => ({
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
    hasUpdate: pins.some(pin => 
      pin.listId === list._id.toString() && 
      new Date(list.updatedAt) > new Date(pin.lastViewedAt)
    ),
  }));

  return (
    <div className="container py-8">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold">Saved Lists</h1>
        <DashboardSearchForm 
          defaultValues={{
            q: searchParams.q,
            category: searchParams.category,
            sort: searchParams.sort,
          }}
        />
      </div>

      {savedLists.length > 0 ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {savedLists.map((list) => (
            <ListCard 
              key={list.id} 
              list={list}
              showPrivacyBadge
              showUpdateBadge={list.hasUpdate}
            />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <p className="text-muted-foreground">
            No saved lists yet. Browse lists and save them here!
          </p>
        </div>
      )}
    </div>
  );
} 