import { auth } from '@clerk/nextjs/server';
import { FollowModel } from "@/lib/db/models/follow";
import { ListModel } from "@/lib/db/models/list";
import dbConnect from "@/lib/db/mongodb";
import { SearchInput } from "@/components/search/search-input";
import { UserProfileCard } from "@/components/users/user-profile-card";
import type { FollowDocument } from "@/types/mongodb";
import { UserTabs } from "@/components/users/user-tabs";

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

  // Get followers and their stats
  const followers = await Promise.all(
    followerIds.map(async (followerId: string) => {
      const listCount = await ListModel.countDocuments({
        ownerId: followerId,
        privacy: 'public',
      });

      return { id: followerId, listCount };
    })
  );

  return (
    <div>
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
              followers.map((follower: { id: string; listCount: number }) => (
                <UserProfileCard 
                  key={follower.id}
                  userId={follower.id}
                  isFollowing={false}
                  hideFollow={false}
                  listCount={follower.listCount}
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
  );
}