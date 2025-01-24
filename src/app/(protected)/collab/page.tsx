import { auth } from "@clerk/nextjs/server";
import { MainLayout } from "@/components/layout/main-layout";
import { ListGrid } from "@/components/lists/list-grid";
import { ListTabs } from "@/components/lists/list-tabs";
import { getEnhancedLists } from "@/lib/actions/lists";
import type { ListCategory } from "@/types/list";
import type { MongoListDocument } from "@/types/mongo";
import { FilterQuery } from "mongoose";
import { CreateListFAB } from "@/components/lists/create-list-fab";

interface SearchParams {
  q?: string;
  category?: ListCategory;
  sort?: string;
}

interface PageProps {
  searchParams: SearchParams;
}

export default async function CollabPage({ searchParams }: PageProps) {
  const { userId } = auth();
  if (!userId) {
    return null;
  }

  // Build filter
  const filter: FilterQuery<MongoListDocument> = {
    collaborators: { $not: { $size: 0 } },
    $or: [
      { 'owner.clerkId': userId },
      {
        'collaborators.clerkId': userId,
        'collaborators.status': 'accepted'
      }
    ]
  };

  if (searchParams.category) {
    filter.category = searchParams.category;
  }

  // Build sort
  const sort: Record<string, 1 | -1> = {};
  switch (searchParams.sort) {
    case 'oldest':
      sort.createdAt = 1;
      break;
    case 'views':
      sort['stats.viewCount'] = -1;
      break;
    case 'pins':
      sort['stats.pinCount'] = -1;
      break;
    case 'newest':
      sort.createdAt = -1;
      break;
    default:
      sort.lastEditedAt = -1;
      sort.createdAt = -1; // fallback for items without lastEditedAt
  }

  // Get enhanced lists with owner data and last viewed timestamps
  const { lists, lastViewedMap } = await getEnhancedLists(filter, { sort });

  return (
    <MainLayout>
      <div className="relative">
        <ListTabs />
        <div className="px-4 md:px-6 lg:px-8 pt-4 pb-20 sm:pb-8">
          <div className="max-w-7xl mx-auto">
            <ListGrid 
              lists={lists}
              searchParams={searchParams}
              showPrivacyBadge
              lastViewedMap={lastViewedMap}
            />
          </div>
        </div>
        <CreateListFAB />
      </div>
    </MainLayout>
  );
} 