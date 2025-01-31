import { getEnhancedUsers } from "@/lib/actions/users";
import { getFollowModel } from "@/lib/db/models-v2/follow";
import { clerkClient, auth } from "@clerk/nextjs/server";
import type { User } from "@clerk/backend";
import { notFound, redirect } from "next/navigation";
import { PeoplePageLayout } from "@/components/users/people-page-layout";
import type { Follow } from "@/types/follow";
import { getUserModel } from "@/lib/db/models-v2/user";

interface PageProps {
  params: { username: string };
  searchParams: { q?: string };
}

export default async function UserFollowingPage({ params, searchParams }: PageProps) {
  // Remove @ if present and decode the username
  const username = decodeURIComponent(params.username).replace(/^@/, '');
  const searchQuery = searchParams.q;
  const { userId } = auth();

  // Require authentication
  if (!userId) {
    const returnUrl = `/profile/${params.username}/following${searchParams.q ? `?q=${searchParams.q}` : ''}`;
    redirect(`/sign-in?returnUrl=${encodeURIComponent(returnUrl)}`);
  }

  // Get profile user
  let profileUser: User | undefined;
  try {
    // If we have a userId, first check if this is the current user's page
    if (userId) {
      const currentUser = await clerkClient.users.getUser(userId);
      if (currentUser.username?.toLowerCase() === username.toLowerCase()) {
        profileUser = currentUser;
      }
    }

    // If not the current user or no userId, search for the user
    if (!profileUser) {
      // Try exact username match first
      const users = await clerkClient.users.getUserList({
        username: [username]
      });
      
      profileUser = users.find(
        (user: User) => user.username?.toLowerCase() === username.toLowerCase()
      );

      // If still not found, try broader search
      if (!profileUser) {
        console.log('No exact match found, trying broader search for username:', username);
        const allUsers = await clerkClient.users.getUserList();
        profileUser = allUsers.find(
          (user: User) => user.username?.toLowerCase() === username.toLowerCase()
        );
      }
    }

    if (!profileUser) {
      console.log('No user found with username:', username);
      notFound();
    }
  } catch (error) {
    console.error('Error fetching user from Clerk:', error);
    notFound();
  }

  // Get following IDs for the profile user
  const followModel = await getFollowModel();
  const following = await followModel
    .find({ followerId: profileUser.id, status: 'accepted' })
    .select("followingId")
    .lean();
  const followingIds = following.map((f: Follow) => f.followingId);

  // Get all users that match the search query
  const userModel = await getUserModel();
  const filter = searchQuery 
    ? { 
        $or: [
          { username: { $regex: searchQuery, $options: "i" } },
          { displayName: { $regex: searchQuery, $options: "i" } }
        ]
      }
    : {};
  
  // Get enhanced user data
  const users = await getEnhancedUsers(filter);

  // Filter users to show only those being followed if there's no search query
  const filteredUsers = searchQuery 
    ? users.map(user => ({
        ...user,
        isFollowing: followingIds.includes(user.clerkId)
      }))
    : users.filter(user => followingIds.includes(user.clerkId));

  // Get follow counts
  const followerCount = await followModel.countDocuments({ followingId: profileUser.id, status: 'accepted' });
  const followingCount = await followModel.countDocuments({ followerId: profileUser.id, status: 'accepted' });

  // Get display name with fallback to username
  const displayName = profileUser.firstName || profileUser.username || username;

  return (
    <PeoplePageLayout
      profileUserId={profileUser.id}
      displayName={displayName}
      username={username}
      followerCount={followerCount}
      followingCount={followingCount}
      users={filteredUsers}
      searchQuery={searchQuery}
    />
  );
} 