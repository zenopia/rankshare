import { FilterQuery } from 'mongoose';
import { auth } from "@clerk/nextjs/server";
import { MainLayout } from "@/components/layout/main-layout";
import { ListGrid } from "@/components/lists/list-grid";
import { ListTabsWrapper } from "@/components/lists/list-tabs-wrapper";
import { getEnhancedLists } from "@/lib/actions/lists";
import type { ListCategory } from "@/types/list";
import type { MongoListDocument } from "@/types/mongo";
import { CreateListFAB } from "@/components/lists/create-list-fab";

interface SearchParams {
  q?: string;
  category?: ListCategory;
  sort?: string;
}

interface PageProps {
  searchParams: SearchParams;
}

export default async function MyListsPage({ searchParams }: PageProps) {
  const { userId } = auth();
  if (!userId) {
    return null;
  }

  // Build filter
  const filter: FilterQuery<MongoListDocument> = {
    'owner.clerkId': userId
  };

  if (searchParams.category) {
    filter.category = searchParams.category;
  }

  // Get enhanced lists with owner data and last viewed timestamps
  const { lists, lastViewedMap } = await getEnhancedLists(filter);

  // Sort lists
  const sortedLists = [...lists].sort((a, b) => {
    switch (searchParams.sort) {
      case 'views':
        return (b.stats.viewCount || 0) - (a.stats.viewCount || 0);
      case 'pins':
        return (b.stats.pinCount || 0) - (a.stats.pinCount || 0);
      case 'copies':
        return (b.stats.copyCount || 0) - (a.stats.copyCount || 0);
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      default: // newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <MainLayout>
      <div className="relative">
        <ListTabsWrapper />
        <div className="px-4 md:px-6 lg:px-8 pt-4 pb-20 sm:pb-8">
          <div className="max-w-7xl mx-auto">
            <ListGrid 
              lists={sortedLists}
              searchParams={searchParams}
              lastViewedMap={lastViewedMap}
            />
          </div>
        </div>
        <CreateListFAB />
      </div>
    </MainLayout>
  );
} 