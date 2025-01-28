"use client";

import { EnhancedUser, followUser, unfollowUser } from "@/lib/actions/users-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface PeoplePageLayoutProps {
  profileUserId: string;
  displayName: string;
  username: string;
  followerCount: number;
  followingCount: number;
  users: EnhancedUser[];
}

export function PeoplePageLayout({ 
  profileUserId,
  displayName,
  username,
  followerCount,
  followingCount,
  users 
}: PeoplePageLayoutProps) {
  const pathname = usePathname();
  const isFollowersTab = pathname.endsWith('/followers');
  const [followStates, setFollowStates] = useState<Record<string, boolean>>(
    Object.fromEntries(users.map(user => [user.id, user.isFollowing]))
  );
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const handleFollow = async (userId: string, username: string) => {
    if (loadingStates[userId]) return;
    
    setLoadingStates(prev => ({
      ...prev,
      [userId]: true
    }));

    try {
      if (followStates[userId]) {
        await unfollowUser(userId);
        toast.success(`Unfollowed ${username}`);
      } else {
        await followUser(userId);
        toast.success(`Following ${username}`);
      }
      setFollowStates(prev => ({
        ...prev,
        [userId]: !prev[userId]
      }));
    } catch (error) {
      console.error('Error following/unfollowing:', error);
      toast.error('Failed to update follow status');
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        [userId]: false
      }));
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{displayName}</h1>
            <p className="text-muted-foreground">@{username}</p>
          </div>
        </div>

        <Tabs defaultValue={isFollowersTab ? "followers" : "following"}>
          <TabsList className="w-full">
            <TabsTrigger 
              value="followers" 
              className="flex-1"
              asChild
            >
              <Link href={`/@${username}/followers`}>
                Followers
                <span className="ml-1 text-muted-foreground">
                  {followerCount}
                </span>
              </Link>
            </TabsTrigger>
            <TabsTrigger 
              value="following" 
              className="flex-1"
              asChild
            >
              <Link href={`/@${username}/following`}>
                Following
                <span className="ml-1 text-muted-foreground">
                  {followingCount}
                </span>
              </Link>
            </TabsTrigger>
          </TabsList>
          <TabsContent value={isFollowersTab ? "followers" : "following"}>
            <div className="space-y-4 mt-4">
              {users.map(user => (
                <div key={user.id} className="flex items-center justify-between">
                  <Link 
                    href={`/@${user.username}`}
                    className="flex items-center space-x-3"
                  >
                    <Avatar>
                      <AvatarImage src={user.imageUrl || undefined} alt={user.displayName} />
                      <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.displayName}</p>
                      <p className="text-sm text-muted-foreground">
                        @{user.username}
                      </p>
                    </div>
                  </Link>
                  {user.id !== profileUserId && (
                    <Button
                      variant={followStates[user.id] ? "secondary" : "default"}
                      onClick={() => handleFollow(user.id, user.username)}
                      disabled={loadingStates[user.id]}
                    >
                      {loadingStates[user.id] ? "Loading..." : followStates[user.id] ? "Following" : "Follow"}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
} 