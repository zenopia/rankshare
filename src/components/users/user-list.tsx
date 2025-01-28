"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

interface User {
  id: string;
  username: string;
  displayName: string;
  imageUrl: string;
  isFollowing: boolean;
}

interface UserListProps {
  users: User[];
  profileUserId: string;
}

export function UserList({ users, profileUserId }: UserListProps) {
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
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: followStates[userId] ? 'DELETE' : 'POST'
      });

      if (!response.ok) throw new Error();

      setFollowStates(prev => ({
        ...prev,
        [userId]: !prev[userId]
      }));

      toast.success(
        followStates[userId] 
          ? `Unfollowed ${username}`
          : `Following ${username}`
      );
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

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No users found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <div 
          key={user.id}
          className="flex items-center justify-between p-4 rounded-lg border"
        >
          <Link 
            href={`/u/${user.username}`}
            className="flex items-center gap-3 hover:opacity-80"
          >
            <Avatar>
              <AvatarImage src={user.imageUrl} alt={user.username} />
              <AvatarFallback>{user.username[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user.displayName}</p>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
            </div>
          </Link>

          {user.id !== profileUserId && (
            <Button
              variant={followStates[user.id] ? "outline" : "default"}
              size="sm"
              onClick={() => handleFollow(user.id, user.username)}
              disabled={loadingStates[user.id]}
            >
              {followStates[user.id] ? "Unfollow" : "Follow"}
            </Button>
          )}
        </div>
      ))}
    </div>
  );
} 