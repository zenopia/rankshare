import { getEnhancedUsers } from "@/lib/actions/users";
import { getFollowModel } from "@/lib/db/models-v2/follow";
import { clerkClient } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { PeoplePageLayout } from "@/components/users/people-page-layout";
import type { Follow } from "@/types/follow";

interface PageProps {
  params: { username: string };
  searchParams: { q?: string };
}

export default async function UserFollowingPage({ params, searchParams }: PageProps) {
  const { username } = params;
  const searchQuery = searchParams.q;

  // Get profile user
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
    throw new Error("User not found");
  }

  // Get following
  const followModel = await getFollowModel();
  const query = { followerId: profileUser.id, status: 'accepted' };
  const following = await followModel
    .find(query)
    .select("followingId")
    .lean();
  const followingIds = following.map((f: Follow) => f.followingId);

  // Get enhanced user data with search filter if needed
  const filter = searchQuery 
    ? { clerkId: { $in: followingIds }, username: { $regex: searchQuery, $options: "i" } }
    : { clerkId: { $in: followingIds } };
  const users = await getEnhancedUsers(filter);

  // Get follow counts
  const followerCount = await followModel.countDocuments({ followingId: profileUser.id, status: 'accepted' });
  const followingCount = await followModel.countDocuments({ followerId: profileUser.id, status: 'accepted' });

  return (
    <PeoplePageLayout
      profileUserId={profileUser.id}
      displayName={profileUser.firstName}
      username={username}
      followerCount={followerCount}
      followingCount={followingCount}
      users={users}
      searchQuery={searchQuery}
    />
  );
} 