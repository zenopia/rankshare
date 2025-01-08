import { SearchInput } from "@/components/search/search-input";
import { SearchResults } from "@/components/search/search-results";
import { SearchTabs } from "@/components/search/search-tabs";
import { CreateListFAB } from "@/components/lists/create-list-fab";

interface SearchParams {
  q?: string;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const searchQuery = searchParams.q || "";

  return (
    <div>
      <SearchTabs />
      
      <div className="px-4 md:px-6 lg:px-8 pt-4 pb-20 sm:pb-8">
        <div className="space-y-8">
          <div className="max-w-md">
            <SearchInput 
              placeholder="Search lists and people..." 
              defaultValue={searchQuery}
            />
          </div>

          <SearchResults />
        </div>

        <CreateListFAB />
      </div>
    </div>
  );
} 