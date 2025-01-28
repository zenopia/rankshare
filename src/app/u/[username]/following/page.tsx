import { auth, currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Card } from "@/components/ui/card";
import { UserList } from "@/components/users/user-list";
import { getFollowing, getFollowersCount, getFollowingCount } from "@/lib/actions/users";
import { Tabs } from "@/components/users/profile-tabs";

interface FollowingPageProps {
  params: {
    username: string;
  };
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function FollowingPage({ params }: FollowingPageProps) {
  try {
    // Remove @ if present and decode the username
    const cleanUsername = decodeURIComponent(params.username).replace(/^@/, '');

    // Get current user for auth check
    const { userId } = auth();
    const user = await currentUser();

    if (!user || user.username !== cleanUsername) {
      notFound();
    }

    // Get following data
    const [following, followerCount, followingCount] = await Promise.all([
      getFollowing(user.id),
      getFollowersCount(user.id),
      getFollowingCount(user.id)
    ]);

    const displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username;
    
    return (
      <MainLayout>
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">{displayName}</h1>
                <p className="text-muted-foreground">@{user.username}</p>
              </div>
            </div>

            <Tabs 
              username={user.username}
              followerCount={followerCount}
              followingCount={followingCount}
              activeTab="following"
            />

            <div className="mt-6">
              <UserList users={following} profileUserId={user.id} />
            </div>
          </Card>
        </div>
      </MainLayout>
    );
  } catch (error) {
    console.error('Error loading following:', error);
    notFound();
  }
} 