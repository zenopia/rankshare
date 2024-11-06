import { auth } from '@clerk/nextjs/server';
import { FollowModel } from "@/lib/db/models/follow";
import { UserModel } from "@/lib/db/models/user";
import { ListModel } from "@/lib/db/models/list";
import dbConnect from "@/lib/db/mongodb";
import { UserCard } from "@/components/users/user-card";
import { SearchInput } from "@/components/search/search-input";
import type { User } from "@/types/user";
import type { MongoListDocument } from "@/types/mongodb";

interface SearchParams {
  q?: string;
}

interface UserWithStats extends User {
  hasNewLists: boolean;
  lastListCreated?: Date;
  listCount: number;
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
  const follows = await FollowModel.find({ followingId: userId }).lean();
  const followerIds = follows.map(follow => follow.followerId);

  // Get followers and their stats
  const followers = await Promise.all(
    followerIds.map(async (followerId) => {
      const user = await UserModel.findOne({ clerkId: followerId }).lean() as User | null;
      if (!user) return null;

      // Get user's latest public list and count
      const [latestList, listCount] = await Promise.all([
        ListModel
          .findOne({ 
            ownerId: followerId,
            privacy: 'public',
          })
          .sort({ createdAt: -1 })
          .lean() as Promise<MongoListDocument | null>,
        ListModel.countDocuments({
          ownerId: followerId,
          privacy: 'public',
        })
      ]);

      const follower: UserWithStats = {
        ...user,
        hasNewLists: false,
        lastListCreated: latestList?.createdAt,
        listCount,
      };

      return follower;
    })
  );

  // Filter out null values and apply search
  const filteredUsers = followers
    .filter((user): user is UserWithStats => 
      user !== null && 
      (!searchParams.q || 
        user.username.toLowerCase().includes(searchParams.q.toLowerCase()))
    );

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Followers</h1>
        <div className="max-w-md">
          <SearchInput 
            placeholder="Search followers..." 
            defaultValue={searchParams.q}
          />
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <UserCard 
              key={user.clerkId} 
              user={user}
            />
          ))
        ) : (
          <div className="text-center">
            <p className="text-muted-foreground">
              {searchParams.q 
                ? "No followers found matching your search."
                : "You don't have any followers yet. Share your lists to get noticed!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}