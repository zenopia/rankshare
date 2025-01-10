import { auth } from '@clerk/nextjs/server';
import { FollowModel } from "@/lib/db/models/follow";
import dbConnect from "@/lib/db/mongodb";
import { SearchInput } from "@/components/search/search-input";
import { UserCard } from "@/components/users/user-card";
import type { FollowDocument } from "@/types/mongodb";
import { UserTabs } from "@/components/users/user-tabs";
import { MainLayout } from "@/components/layout/main-layout";

interface SearchParams {
  q?: string;
}

export default async function FollowersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { userId } = await auth();
  if (!userId) return null;

  await dbConnect();

  // Get users following the current user
  const follows = await FollowModel.find({ followingId: userId }).lean() as FollowDocument[];
  const followerIds = follows.map(follow => follow.followerId);

  // Check if current user follows back each follower
  const followBackStatuses = await Promise.all(
    followerIds.map(followerId => 
      FollowModel.findOne({
        followerId: userId,
        followingId: followerId
      }).lean()
    )
  );

  // Combine follower IDs with their follow-back status
  const followers = followerIds.map((followerId, index) => ({
    id: followerId,
    isFollowing: !!followBackStatuses[index]
  }));

  return (
    <MainLayout>
      <div className="relative">
        <UserTabs />
        <div className="px-4 md:px-6 lg:px-8 pt-4 pb-20 sm:pb-8">
          <div className="space-y-8">
            <div className="max-w-md">
              <SearchInput 
                placeholder="Search followers..." 
                defaultValue={searchParams.q}
              />
            </div>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {followers.length > 0 ? (
                followers.map((follower) => (
                  <UserCard 
                    key={follower.id}
                    userId={follower.id}
                    isFollowing={follower.isFollowing}
                    hideFollow={false}
                  />
                ))
              ) : (
                <div className="col-span-full text-center">
                  <p className="text-muted-foreground">
                    You don&apos;t have any followers yet. Share your lists to get noticed!
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