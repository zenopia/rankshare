import { MainLayout } from "@/components/layout/main-layout";
import { ListGrid } from "@/components/lists/list-grid";
import { SearchTabs } from "@/components/search/search-tabs";
import { getEnhancedLists } from "@/lib/actions/lists";
import type { ListCategory } from "@/types/list";

interface SearchParams {
  q?: string;
  category?: ListCategory;
  sort?: string;
}

interface PageProps {
  searchParams: SearchParams;
}

export default async function SearchListsPage({ searchParams }: PageProps) {
  // Build filter
  const filter = {
    privacy: 'public',
    ...(searchParams.q ? {
      $text: { $search: searchParams.q }
    } : {}),
    ...(searchParams.category ? { category: searchParams.category } : {})
  };

  // Get enhanced lists with owner data and last viewed timestamps
  const { lists: unsortedLists, lastViewedMap } = await getEnhancedLists(filter, {
    ...(searchParams.q ? {
      score: { $meta: 'textScore' },
      sort: { score: { $meta: 'textScore' } }
    } : {})
  });

  // Only apply manual sort if no search query (text search already sorts by relevance)
  const lists = searchParams.q ? unsortedLists : [...unsortedLists].sort((a, b) => {
    switch (searchParams.sort) {
      case 'views':
        return (b.stats.viewCount || 0) - (a.stats.viewCount || 0);
      case 'pins':
        return (b.stats.pinCount || 0) - (a.stats.pinCount || 0);
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      default: // newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <MainLayout>
      <div className="relative">
        <SearchTabs />
        <div className="px-4 md:px-6 lg:px-8 pt-4 pb-20 sm:pb-8">
          <div className="max-w-7xl mx-auto">
            <ListGrid 
              lists={lists}
              searchParams={searchParams}
              showPrivacyBadge
              lastViewedMap={lastViewedMap}
              showSearch
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 