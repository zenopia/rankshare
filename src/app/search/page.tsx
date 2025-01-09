import { SearchInput } from "@/components/search/search-input";
import { SearchResults } from "@/components/search/search-results";
import { SearchTabs } from "@/components/search/search-tabs";
import { CreateListFAB } from "@/components/lists/create-list-fab";
import { FilterSheet } from "@/components/search/filter-sheet";
import type { ListCategory } from "@/types/list";
import { MainLayout } from "@/components/layout/main-layout";

interface SearchParams {
  q?: string;
  category?: ListCategory;
  sort?: string;
  tab?: string;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const currentTab = searchParams.tab || 'lists';

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

            <SearchResults />
          </div>

          <CreateListFAB />
        </div>
      </div>
    </MainLayout>
  );
} 