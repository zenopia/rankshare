import { auth } from "@clerk/nextjs/server";
import { MainLayout } from "@/components/layout/main-layout";
import { PeopleTabs } from "@/components/users/people-tabs";
import { UserList } from "@/components/users/user-list";
import { getFollowModel } from "@/lib/db/models-v2/follow";
import { getUserModel } from "@/lib/db/models-v2/user";
import { connectToMongoDB } from "@/lib/db/client";

export default async function FollowingPage() {
  const { userId } = auth();
  if (!userId) {
    return null;
  }

  await connectToMongoDB();
  const FollowModel = await getFollowModel();
  const UserModel = await getUserModel();

  // Get all users being followed
  const follows = await FollowModel.find({
    followerId: userId,
    status: 'accepted'
  }).lean();

  // Get user details for each followed user
  const users = await Promise.all(
    follows.map(async (follow) => {
      const user = await UserModel.findOne({
        clerkId: follow.followingId
      }).lean();
      return { user };
    })
  );

  // Filter out any null values and serialize
  const validUsers = users
    .filter((result): result is NonNullable<typeof result> & { user: NonNullable<typeof result['user']> } => 
      Boolean(result.user))
    .map(({ user }) => ({
      id: user._id.toString(),
      clerkId: user.clerkId,
      username: user.username,
      displayName: user.displayName,
      isFollowing: true // Current user is following them
    }));

  return (
    <MainLayout>
      <div className="relative">
        <PeopleTabs />
        <div className="px-4 md:px-6 lg:px-8 pt-4 pb-20 sm:pb-8">
          <div className="max-w-2xl mx-auto">
            <UserList users={validUsers} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 