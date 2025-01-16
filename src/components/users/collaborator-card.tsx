"use client";

import { UserProfileBase } from "@/components/users/user-profile-base";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useUsers } from "@/hooks/use-users";

export interface CollaboratorCardProps {
  userId: string;
  username: string;
  role: 'owner' | 'editor' | 'viewer';
  linkToProfile?: boolean;
}

export function CollaboratorCard({ userId, username, role, linkToProfile = true }: CollaboratorCardProps) {
  const { data: users, isLoading } = useUsers([userId]);
  const userData = users?.[0];

  if (isLoading) {
    return (
      <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-3 w-16 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <div className="h-6 w-16 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  const [firstName, lastName] = userData?.displayName.split(' ') || [null, null];

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'editor':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const content = (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <UserProfileBase
          userId={userId}
          username={userData?.username || username}
          firstName={firstName}
          lastName={lastName}
          imageUrl={userData?.imageUrl}
          variant="compact"
          hideFollow={true}
          linkToProfile={false}
        />
      </div>
      <Badge variant={getRoleBadgeVariant(role)} className="capitalize">
        {role}
      </Badge>
    </div>
  );

  if (linkToProfile) {
    return <Link href={`/@${userData?.username || username}`}>{content}</Link>;
  }

  return content;
} 