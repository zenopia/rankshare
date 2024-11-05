import { auth } from "@clerk/nextjs";
import { ListModel } from "@/lib/db/models/list";
import dbConnect from "@/lib/db/mongodb";
import { ListCard } from "@/components/lists/list-card";
import { DashboardSearchForm } from "@/components/search/dashboard-search-form";
import type { List } from "@/types/list";
import type { SortOrder } from 'mongoose';
import { serializeLists } from '@/lib/utils';
import type { MongoListDocument } from "@/types/mongodb";

interface SearchParams {
  q?: string;
  category?: string;
  sort?: 'newest' | 'oldest' | 'most-viewed';
  privacy?: 'all' | 'public' | 'private';
}

export default async function MyListsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { userId } = await auth();
  if (!userId) return null;

  await dbConnect();

  // Build filter
  const filter: any = { ownerId: userId };
  
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

  if (searchParams.privacy && searchParams.privacy !== 'all') {
    filter.privacy = searchParams.privacy;
  }

  // Determine sort order
  const sortOptions: Record<string, Record<string, SortOrder>> = {
    'newest': { createdAt: -1 },
    'oldest': { createdAt: 1 },
    'most-viewed': { viewCount: -1, createdAt: -1 },
  };

  const sort = sortOptions[searchParams.sort || 'newest'];

  // Fetch lists
  const lists = await ListModel
    .find(filter)
    .sort(sort)
    .lean()
    .exec() as unknown as MongoListDocument[];

  const serializedLists = serializeLists(lists);

  return (
    <div className="container py-8">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold">My Lists</h1>
        <DashboardSearchForm 
          defaultValues={{
            q: searchParams.q,
            category: searchParams.category,
            sort: searchParams.sort,
            privacy: searchParams.privacy,
          }}
        />
      </div>

      {serializedLists.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {serializedLists.map((list: List) => (
            <ListCard 
              key={list.id} 
              list={list}
              showPrivacyBadge
            />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <p className="text-muted-foreground">
            No lists found. Try adjusting your filters or create a new list.
          </p>
        </div>
      )}
    </div>
  );
} 