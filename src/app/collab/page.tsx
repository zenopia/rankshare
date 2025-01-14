import { auth } from '@clerk/nextjs/server';
import { ListModel } from "@/lib/db/models/list";
import dbConnect from "@/lib/db/mongodb";
import { ListCard } from "@/components/lists/list-card";
import { ListSearchControls } from "@/components/lists/list-search-controls";
import { serializeLists } from '@/lib/utils';
import { HomeTabs } from "@/components/home/home-tabs";
import type { MongoListDocument, MongoListFilter, MongoSortOptions } from "@/types/mongodb";
import { ensureUserExists } from "@/lib/actions/user";
import type { ListCategory, OwnerFilter } from "@/types/list";
import { CreateListFAB } from "@/components/lists/create-list-fab";
import { MainLayout } from "@/components/layout/main-layout";

interface SearchParams {
  q?: string;
  category?: ListCategory;
  sort?: 'newest' | 'oldest' | 'most-viewed';
  owner?: OwnerFilter;
}

export const revalidate = 30; // Revalidate every 30 seconds

export default async function CollabPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { userId } = auth();
  if (!userId) return null;

  await dbConnect();
  await ensureUserExists();

  // Build filter to show lists that have collaborators where user is owner or collaborator
  let filter: MongoListFilter = {
    $and: [
      // Must have at least one accepted collaborator
      { 'collaborators.status': 'accepted' },
      // User must be owner or collaborator
      {
        $or: [
          { ownerId: userId },
          {
            'collaborators.userId': userId,
            'collaborators.status': 'accepted'
          }
        ]
      }
    ]
  };

  // Add search filter if query exists
  if (searchParams.q) {
    filter.$and?.push({
      $or: [
        { title: { $regex: searchParams.q, $options: 'i' } },
        { description: { $regex: searchParams.q, $options: 'i' } }
      ]
    });
  }

  // Add category filter if specified
  if (searchParams.category) {
    filter.category = searchParams.category;
  }

  // Add owner filter if specified
  if (searchParams.owner && searchParams.owner !== 'all') {
    if (searchParams.owner === 'mine') {
      // Show only lists where user is the owner
      filter = {
        $and: [
          { 'collaborators.status': 'accepted' },
          { ownerId: userId }
        ]
      };
    } else if (searchParams.owner === 'others') {
      // Show only lists where user is a collaborator but not the owner
      filter = {
        $and: [
          { 'collaborators.status': 'accepted' },
          {
            ownerId: { $ne: userId },
            'collaborators.userId': userId,
            'collaborators.status': 'accepted'
          }
        ]
      };
    }
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
    <MainLayout>
      <div className="relative">
        <HomeTabs />
        <div className="px-4 md:px-6 lg:px-8 pt-4 pb-20 sm:pb-8">
          <div className="space-y-8">
            <ListSearchControls 
              defaultQuery={searchParams.q}
              defaultCategory={searchParams.category}
              defaultSort={searchParams.sort}
              defaultOwner={searchParams.owner}
              showOwnerFilter={true}
              showPrivacyFilter={false}
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
                <p className="text-muted-foreground">No collaborative lists found.</p>
              </div>
            )}
          </div>
        </div>
        <CreateListFAB />
      </div>
    </MainLayout>
  );
} 