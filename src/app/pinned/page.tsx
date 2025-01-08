import { auth } from "@clerk/nextjs/server";
import { ListModel } from "@/lib/db/models/list";
import { PinModel } from "@/lib/db/models/pin";
import dbConnect from "@/lib/db/mongodb";
import { ListCard } from "@/components/lists/list-card";
import type { List } from "@/types/list";
import type { MongoListDocument, MongoListFilter, MongoSortOptions } from "@/types/mongodb";
import type { SortOrder } from 'mongoose';
import type { ListCategory } from "@/types/list";
import { HomeTabs } from "@/components/home/home-tabs";

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
    title: list.title,
    category: list.category,
    description: list.description || '',
    items: list.items.map(item => ({
      id: item._id?.toString() || crypto.randomUUID(),
      title: item.title,
      comment: item.comment,
      rank: item.rank
    })),
    privacy: list.privacy,
    viewCount: list.viewCount,
    createdAt: list.createdAt,
    updatedAt: list.updatedAt,
    hasUpdate: false
  }));

  return (
    <div>
      <HomeTabs />
      
      <div className="px-4 md:px-6 lg:px-8 pt-4 pb-20 sm:pb-8">
        <div className="space-y-8">
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
        </div>
      </div>
    </div>
  );
} 