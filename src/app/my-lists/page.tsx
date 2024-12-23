import { auth } from '@clerk/nextjs/server';
import { ListModel } from "@/lib/db/models/list";
import dbConnect from "@/lib/db/mongodb";
import { ListCard } from "@/components/lists/list-card";
import { ListSearchControls } from "@/components/lists/list-search-controls";
import { serializeLists } from '@/lib/utils';
import type { MongoListDocument, MongoListFilter, MongoSortOptions } from "@/types/mongodb";
import { ensureUserExists } from "@/lib/actions/user";
import type { ListCategory, ListPrivacy } from "@/types/list";

interface SearchParams {
  q?: string;
  category?: ListCategory;
  sort?: 'newest' | 'oldest' | 'most-viewed';
  privacy?: ListPrivacy | 'all';
}

export const revalidate = 30; // Revalidate every 30 seconds

export default async function MyListsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { userId } = auth();

  await dbConnect();
  await ensureUserExists();

  // Build filter
  const filter: MongoListFilter = { ownerId: userId };

  if (searchParams.q) {
    filter.$or = [
      { title: { $regex: searchParams.q, $options: 'i' } },
      { description: { $regex: searchParams.q, $options: 'i' } },
    ];
  }

  if (searchParams.category) {
    filter.category = searchParams.category;
  }

  if (searchParams.privacy && searchParams.privacy !== 'all') {
    filter.privacy = searchParams.privacy;
  }

  // Build sort
  const sort: MongoSortOptions = {};
  const sortOrder = -1;

  switch (searchParams.sort) {
    case 'oldest':
      sort.createdAt = 1;
      break;
    case 'most-viewed':
      sort.viewCount = sortOrder;
      break;
    case 'newest':
    default:
      sort.createdAt = sortOrder;
  }

  const lists = await ListModel
    .find(filter)
    .sort(sort)
    .lean() as MongoListDocument[];

  const serializedLists = serializeLists(lists);

  return (
    <div className="container py-8">
      <div className="space-y-2 mb-6">
        <h1 className="text-3xl font-bold">My Lists</h1>
        <p className="text-muted-foreground">
          Manage and organize your created lists
        </p>
      </div>

      <ListSearchControls 
        defaultQuery={searchParams.q}
        defaultCategory={searchParams.category}
        defaultSort={searchParams.sort}
        defaultPrivacy={searchParams.privacy}
      />

      {serializedLists.length > 0 ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {serializedLists.map((list) => (
            <ListCard 
              key={list.id} 
              list={list}
              showPrivacyBadge
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No lists found.</p>
        </div>
      )}
    </div>
  );
} 