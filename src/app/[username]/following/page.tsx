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
import { SearchInput } from "@/components/search/search-input";
import type { FilterQuery } from "mongoose";
import type { MongoUserDocument } from "@/types/mongo";

interface PageProps {
  params: {
    username: string;
  };
  searchParams: {
    q?: string;
  };
}

export default async function UserFollowingPage({ params, searchParams }: PageProps) {
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

  // Get all users being followed by the profile user to get the count and following status
  const follows = await FollowModel.find({
    followerId: profileUser.id,
    status: 'accepted'
  }).lean();

  // Build search filter based on whether there's a search query
  const filter: FilterQuery<MongoUserDocument> = searchParams.q ? {
    // When searching, look through all users
    $or: [
      { username: { $regex: searchParams.q, $options: 'i' } },
      { displayName: { $regex: searchParams.q, $options: 'i' } }
    ]
  } : {
    // When not searching, show only following users
    clerkId: { $in: follows.map(follow => follow.followingId) }
  };

  // Get users matching the filter
  const users = await getEnhancedUsers(filter);

  // Format display name
  const displayName = formatDisplayName(profileUser.firstName, profileUser.lastName, username);

  // Check if viewing own profile
  const isOwnProfile = userId === profileUser.id;

  const PageContent = (
    <div className="relative">
      <PeopleTabs username={username} />
      <div className="px-4 md:px-6 lg:px-8 pt-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <SearchInput 
            placeholder="Search people..." 
            defaultValue={searchParams.q}
          />
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
    <SubLayout title={displayName} subtext={`${follows.length} Following`}>
      {PageContent}
    </SubLayout>
  );
} 