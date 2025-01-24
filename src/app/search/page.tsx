import { MainLayout } from "@/components/layout/main-layout";
import { ListGrid } from "@/components/lists/list-grid";
import { SearchTabs } from "@/components/search/search-tabs";
import { SearchInput } from "@/components/search/search-input";
import { FilterSheet } from "@/components/search/filter-sheet";
import { getEnhancedLists } from "@/lib/actions/lists";
import type { ListCategory } from "@/types/list";
import { PeopleResults } from "@/components/search/people-results";

interface SearchParams {
  q?: string;
  category?: ListCategory;
  sort?: string;
  tab?: string;
}

interface PageProps {
  searchParams: SearchParams;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const currentTab = searchParams.tab || 'lists';

  // Build base query for lists
  const baseQuery = {
    privacy: 'public'
  };

  // Add search filter if query exists
  const searchFilter = searchParams.q ? {
    $or: [
      { title: { $regex: searchParams.q, $options: 'i' } },
      { description: { $regex: searchParams.q, $options: 'i' } }
    ]
  } : {};

  // Add category filter if specified
  const categoryFilter = searchParams.category ? {
    category: searchParams.category
  } : {};

  // Combine all filters
  const filter = {
    ...baseQuery,
    ...searchFilter,
    ...categoryFilter
  };

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
        <SearchTabs />
        <div className="px-4 md:px-6 lg:px-8 pt-4 pb-20 sm:pb-8">
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <SearchInput 
                  placeholder="Search lists..." 
                  defaultValue={searchParams.q}
                />
              </div>
              {currentTab === 'lists' && (
                <FilterSheet 
                  defaultCategory={searchParams.category}
                  defaultSort={searchParams.sort}
                />
              )}
            </div>

            {currentTab === 'lists' ? (
              <ListGrid 
                lists={sortedLists}
                searchParams={searchParams}
                showPrivacyBadge
                lastViewedMap={lastViewedMap}
              />
            ) : (
              <PeopleResults />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 