import { MainLayout } from "@/components/layout/main-layout";
import { SearchTabs } from "@/components/search/search-tabs";
import { SearchInput } from "@/components/search/search-input";
import { UserList } from "@/components/users/user-list";
import { getEnhancedUsers } from "@/lib/actions/users";

interface SearchParams {
  q?: string;
}

interface PageProps {
  searchParams: SearchParams;
}

export default async function SearchPeoplePage({ searchParams }: PageProps) {
  // Build search filter
  const filter = searchParams.q ? {
    $or: [
      { username: { $regex: searchParams.q, $options: 'i' } },
      { displayName: { $regex: searchParams.q, $options: 'i' } }
    ]
  } : {};

  // Get enhanced users with follow status
  const users = await getEnhancedUsers(filter);

  return (
    <MainLayout>
      <div className="relative">
        <SearchTabs />
        <div className="px-4 md:px-6 lg:px-8 pt-4 pb-20 sm:pb-8">
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <SearchInput 
                  placeholder="Search people..." 
                  defaultValue={searchParams.q}
                />
              </div>
            </div>

            <div className="max-w-2xl mx-auto">
              <UserList users={users} />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 