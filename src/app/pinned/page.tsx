import { auth } from "@clerk/nextjs/server";
import { ListModel } from "@/lib/db/models/list";
import { PinModel } from "@/lib/db/models/pin";
import dbConnect from "@/lib/db/mongodb";
import { ListCard } from "@/components/lists/list-card";
import { DashboardSearchForm } from "@/components/search/dashboard-search-form";
import type { List } from "@/types/list";
import type { MongoListDocument, MongoListFilter, MongoSortOptions } from "@/types/mongodb";
import type { SortOrder } from 'mongoose';
import type { ListCategory } from "@/types/list";

interface SearchParams {
  q?: string;
  category?: ListCategory;
  sort?: 'newest' | 'oldest' | 'most-viewed';
}

interface PinnedList extends List {
  hasUpdate: boolean;
}

export default async function PinnedListsPage({
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
  const filter: MongoListFilter = { 
    _id: { $in: pinnedListIds },
    privacy: 'public',
  };
  
  if (searchParams.q) {
    filter.$or = [
      { title: { $regex: searchParams.q, $options: 'i' } },
      { description: { $regex: searchParams.q, $options: 'i' } },
      { 'items.title': { $regex: searchParams.q, $options: 'i' } },
      { 'items.comment': { $regex: searchParams.q, $options: 'i' } },
    ];
  }

  if (searchParams.category) {
    filter.category = searchParams.category;
  }

  // Determine sort order
  const sort: MongoSortOptions = {};
  const sortOrder: SortOrder = -1;

  switch (searchParams.sort) {
    case 'oldest':
      sort.createdAt = 1;
      break;
    case 'most-viewed':
      sort.viewCount = sortOrder;
      break;
    default:
      sort.createdAt = sortOrder;
  }

  // Fetch lists
  const lists = await ListModel
    .find(filter)
    .sort(sort)
    .lean()
    .exec() as unknown as MongoListDocument[];

  // Add update status to lists
  const pinnedLists: PinnedList[] = lists.map(list => ({
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
        <h1 className="text-3xl font-bold">Pinned Lists</h1>
        <DashboardSearchForm 
          defaultValues={{
            q: searchParams.q,
            category: searchParams.category,
            sort: searchParams.sort,
          }}
        />
      </div>

      {pinnedLists.length > 0 ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {pinnedLists.map((list) => (
            <ListCard 
              key={list.id} 
              list={list}
              showUpdateBadge={list.hasUpdate}
              showPrivacyBadge
            />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <p className="text-muted-foreground">
            No pinned lists yet. Browse lists and pin them to save them here!
          </p>
        </div>
      )}
    </div>
  );
} 