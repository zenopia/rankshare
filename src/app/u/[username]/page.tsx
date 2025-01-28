import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { UserProfile } from "@/components/users/user-profile";
import { getFollowersCount, getFollowingCount, getIsFollowing } from "@/lib/actions/users";

interface UserProfilePageProps {
  params: {
    username: string;
  };
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  try {
    // Remove @ if present and decode the username
    const cleanUsername = decodeURIComponent(params.username).replace(/^@/, '');

    // Get the profile user from Clerk
    const users = await clerkClient.users.getUserList({
      username: [cleanUsername]
    });
    const profileUser = users[0];

    if (!profileUser || !profileUser.username) {
      notFound();
    }

    // Get current user for auth check and follow status
    const { userId } = auth();

    // Get user stats
    const [followerCount, followingCount, isFollowingUser] = await Promise.all([
      getFollowersCount(profileUser.id),
      getFollowingCount(profileUser.id),
      userId ? getIsFollowing(profileUser.id) : false
    ]);

    return (
      <MainLayout>
        <UserProfile 
          userId={profileUser.id}
          username={profileUser.username}
          displayName={`${profileUser.firstName || ''} ${profileUser.lastName || ''}`.trim() || profileUser.username}
          imageUrl={profileUser.imageUrl}
          followerCount={followerCount}
          followingCount={followingCount}
          isFollowing={isFollowingUser}
          isOwnProfile={userId === profileUser.id}
        />
      </MainLayout>
    );
  } catch (error) {
    console.error('Error loading user profile:', error);
    notFound();
  }
} 