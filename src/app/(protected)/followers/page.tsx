import { auth } from "@clerk/nextjs/server";
import { MainLayout } from "@/components/layout/main-layout";
import { PeopleTabs } from "@/components/users/people-tabs";
import { UserList } from "@/components/users/user-list";
import { getEnhancedUsers } from "@/lib/actions/users";
import { connectToMongoDB } from "@/lib/db/client";
import { getFollowModel } from "@/lib/db/models-v2/follow";

export default async function FollowersPage() {
  const { userId } = auth();
  if (!userId) {
    return null;
  }

  await connectToMongoDB();
  const FollowModel = await getFollowModel();

  // Get all users following the current user
  const follows = await FollowModel.find({
    followingId: userId,
    status: 'accepted'
  }).lean();

  // Get enhanced user data for all followers
  const users = await getEnhancedUsers({
    clerkId: { $in: follows.map(follow => follow.followerId) }
  });

  return (
    <MainLayout>
      <div className="relative">
        <PeopleTabs />
        <div className="px-4 md:px-6 lg:px-8 pt-4 pb-20 sm:pb-8">
          <div className="max-w-2xl mx-auto">
            <UserList users={users} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}