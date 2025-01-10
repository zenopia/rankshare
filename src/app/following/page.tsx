import { auth } from '@clerk/nextjs/server';
import { FollowModel } from "@/lib/db/models/follow";
import dbConnect from "@/lib/db/mongodb";
import { SearchInput } from "@/components/search/search-input";
import { UserCard } from "@/components/users/user-card";
import { UserTabs } from "@/components/users/user-tabs";
import { MainLayout } from "@/components/layout/main-layout";

interface SearchParams {
  q?: string;
}

export default async function FollowingPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { userId } = await auth();
  if (!userId) return null;

  await dbConnect();

  // Get users that the current user follows
  const follows = await FollowModel.find({ followerId: userId }).lean();
  const followingIds = follows.map(follow => follow.followingId);

  // Filter users based on search query
  const filteredUsers = followingIds.filter(id => {
    if (!searchParams.q) return true;
    return id.toLowerCase().includes(searchParams.q.toLowerCase());
  });

  return (
    <MainLayout>
      <div className="relative">
        <UserTabs />
        <div className="px-4 md:px-6 lg:px-8 pt-4 pb-20 sm:pb-8">
          <div className="space-y-8">
            <div className="max-w-md">
              <SearchInput 
                placeholder="Search following..." 
                defaultValue={searchParams.q}
              />
            </div>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((followingId) => (
                  <UserCard 
                    key={followingId}
                    userId={followingId}
                    isFollowing={true}
                    hideFollow={false}
                  />
                ))
              ) : (
                <div className="col-span-full text-center">
                  <p className="text-muted-foreground">
                    {searchParams.q 
                      ? "No users found matching your search."
                      : "You're not following anyone yet. Find users to follow!"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 