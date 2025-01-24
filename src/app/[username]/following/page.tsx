import { clerkClient } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { SubLayout } from "@/components/layout/sub-layout";
import { UserList } from "@/components/users/user-list";
import { getEnhancedUsers } from "@/lib/actions/users";
import { connectToMongoDB } from "@/lib/db/client";
import { getFollowModel } from "@/lib/db/models-v2/follow";

interface PageProps {
  params: {
    username: string;
  };
}

export default async function UserFollowingPage({ params }: PageProps) {
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

  // Get all users being followed by the profile user
  const follows = await FollowModel.find({
    followerId: profileUser.id,
    status: 'accepted'
  }).lean();

  // Get enhanced user data for all followed users
  const users = await getEnhancedUsers({
    clerkId: { $in: follows.map(follow => follow.followingId) }
  });

  return (
    <SubLayout title={`${username}'s Following`}>
      <div className="px-4 md:px-6 lg:px-8 pt-4 pb-20 sm:pb-8">
        <div className="max-w-2xl mx-auto">
          <UserList users={users} />
        </div>
      </div>
    </SubLayout>
  );
} 