import { clerkClient, auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { SubLayout } from "@/components/layout/sub-layout";
import { MainLayout } from "@/components/layout/main-layout";
import { UserList } from "@/components/users/user-list";
import { getEnhancedUsers } from "@/lib/actions/users";
import { connectToMongoDB } from "@/lib/db/client";
import { getFollowModel } from "@/lib/db/models-v2/follow";
import { PeopleTabs } from "@/components/users/people-tabs";
import { formatDisplayName } from "@/lib/utils";

interface PageProps {
  params: {
    username: string;
  };
}

export default async function UserFollowersPage({ params }: PageProps) {
  const { userId } = auth();
  // Remove @ if present and decode the username
  const username = decodeURIComponent(params.username).replace(/^@/, '');

  // Get user from Clerk first
  let profileUser;
  try {
    const users = await clerkClient.users.getUserList({
      username: [username]
    });
    profileUser = users[0];
  } catch (error) {
    console.error('Error fetching user from Clerk:', error);
    notFound();
  }

  if (!profileUser) {
    console.error(`User not found in Clerk: ${username}`);
    notFound();
  }

  await connectToMongoDB();
  const FollowModel = await getFollowModel();

  // Get all users following the profile user
  const follows = await FollowModel.find({
    followingId: profileUser.id,
    status: 'accepted'
  }).lean();

  // Get enhanced user data for all followers
  const users = await getEnhancedUsers({
    clerkId: { $in: follows.map(follow => follow.followerId) }
  });

  // Format display name
  const displayName = formatDisplayName(profileUser.firstName, profileUser.lastName, username);

  // Check if viewing own profile
  const isOwnProfile = userId === profileUser.id;

  const PageContent = (
    <div className="relative">
      <PeopleTabs username={username} />
      <div className="px-4 md:px-6 lg:px-8 pt-4">
        <div className="max-w-2xl mx-auto">
          <UserList users={users} />
        </div>
      </div>
    </div>
  );

  return isOwnProfile ? (
    <MainLayout>
      {PageContent}
    </MainLayout>
  ) : (
    <SubLayout title={displayName} subtext={`${follows.length} Followers`}>
      {PageContent}
    </SubLayout>
  );
} 