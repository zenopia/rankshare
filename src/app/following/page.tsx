import { auth, clerkClient } from "@clerk/nextjs/server";
import { ListModel } from "@/lib/db/models/list";
import { FollowModel } from "@/lib/db/models/follow";
import { UserModel } from "@/lib/db/models/user";
import dbConnect from "@/lib/db/mongodb";
import { SearchInput } from "@/components/search/search-input";
import type { User } from "@/types/list";
import type { MongoListDocument } from "@/types/mongodb";
import { UserProfileCard } from "@/components/users/user-profile-card";

interface SearchParams {
  q?: string;
}

interface UserWithStats extends User {
  hasNewLists: boolean;
  lastListCreated?: Date;
  listCount: number;
  firstName?: string;
  imageUrl?: string;
  fullName?: string;
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

  // Get following users and their stats
  const following = await Promise.all(
    followingIds.map(async (followingId) => {
      // Get Clerk user data
      const clerkUser = await clerkClient.users.getUser(followingId);
      const user = await UserModel.findOne({ clerkId: followingId }).lean() as User | null;
      if (!user || !clerkUser) return null;

      // Get user's latest public list and count
      const [latestList, listCount] = await Promise.all([
        ListModel
          .findOne({ 
            ownerId: followingId,
            privacy: 'public',
          })
          .sort({ createdAt: -1 })
          .lean() as Promise<MongoListDocument | null>,
        ListModel.countDocuments({
          ownerId: followingId,
          privacy: 'public',
        })
      ]);

      const followingUser: UserWithStats = {
        ...user,
        firstName: clerkUser.firstName,
        imageUrl: clerkUser.imageUrl,
        username: clerkUser.username,
        fullName: `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim(),
        hasNewLists: false,
        lastListCreated: latestList?.createdAt,
        listCount,
      };

      return followingUser;
    })
  );

  // Filter out null values and apply search
  const filteredUsers = following
    .filter((user): user is UserWithStats => 
      user !== null && 
      (!searchParams.q || 
        user.username.toLowerCase().includes(searchParams.q.toLowerCase()))
    );

  return (
    <div className="container py-8">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold">Following</h1>
        <div className="max-w-md">
          <SearchInput 
            placeholder="Search following..." 
            defaultValue={searchParams.q}
          />
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <UserProfileCard 
              key={user.clerkId}
              userId={user.clerkId}
              isFollowing={true}
              hideFollow={false}
              listCount={user.listCount}
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
  );
} 