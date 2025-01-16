"use client";

import { UserProfileBase } from "@/components/users/user-profile-base";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useUsers } from "@/hooks/use-users";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CollaboratorCardProps {
  userId: string;
  username: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  linkToProfile?: boolean;
  canManageRoles?: boolean;
  isOwner?: boolean;
  onRoleChange?: (newRole: string) => void;
  onRemove?: () => void;
}

export function CollaboratorCard({ 
  userId, 
  username, 
  role, 
  linkToProfile = true,
  canManageRoles = false,
  isOwner = false,
  onRoleChange,
  onRemove
}: CollaboratorCardProps) {
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
      case 'admin':
        return 'destructive';
      case 'editor':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const roleDisplay = (
    canManageRoles && role !== 'owner' ? (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm"
            className={cn(
              "flex items-center gap-1 px-2 h-6 capitalize",
              "hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {role}
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onRoleChange?.('admin')}>
            Admin
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onRoleChange?.('editor')}>
            Editor
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onRoleChange?.('viewer')}>
            Viewer
          </DropdownMenuItem>
          {isOwner && (
            <DropdownMenuItem onClick={() => onRoleChange?.('owner')}>
              Transfer Ownership
            </DropdownMenuItem>
          )}
          <DropdownMenuItem 
            onClick={onRemove}
            className="text-destructive focus:text-destructive"
          >
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ) : (
      <Badge variant={getRoleBadgeVariant(role)} className="capitalize">
        {role}
      </Badge>
    )
  );

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
      <div onClick={(e) => e.preventDefault()}>
        {roleDisplay}
      </div>
    </div>
  );

  if (linkToProfile) {
    return <Link href={`/@${userData?.username || username}`}>{content}</Link>;
  }

  return content;
} 