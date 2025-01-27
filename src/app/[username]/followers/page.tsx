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

export default async function UserFollowersPage({ params, searchParams }: PageProps) {
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

  // Get followers
  const followModel = await getFollowModel();
  const filter = searchQuery ? { username: { $regex: searchQuery, $options: "i" } } : {};
  const followers = await followModel
    .find({ followingId: profileUser.id, ...filter })
    .select("followerId")
    .lean();
  const followerIds = followers.map((f: Follow) => f.followerId);

  // Get enhanced user data
  const users = await getEnhancedUsers(followerIds);

  // Get follow counts
  const followerCount = await followModel.countDocuments({ followingId: profileUser.id });
  const followingCount = await followModel.countDocuments({ followerId: profileUser.id });

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