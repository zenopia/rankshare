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
import { ChevronDown, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { usePathname } from "next/navigation";

export interface CollaboratorCardProps {
  userId: string;
  username?: string;
  email?: string;
  imageUrl?: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  status?: 'pending' | 'accepted' | 'rejected';
  clerkId?: string;
  acceptedDate?: string;
  linkToProfile?: boolean;
  canManageRoles?: boolean;
  isOwner?: boolean;
  currentUserRole?: 'owner' | 'admin' | 'editor' | 'viewer';
  onRoleChange?: (newRole: string) => void;
  onRemove?: () => void;
  onResendInvite?: () => void;
  onCancelInvite?: () => void;
  onAcceptInvite?: () => void;
  onRejectInvite?: () => void;
  className?: string;
}

export function CollaboratorCard({ 
  userId, 
  username, 
  email,
  imageUrl,
  role,
  clerkId,
  linkToProfile = true,
  canManageRoles = false,
  isOwner = false,
  currentUserRole,
  onRoleChange,
  onRemove,
  onResendInvite,
  onCancelInvite,
  onAcceptInvite,
  onRejectInvite,
  className
}: CollaboratorCardProps) {
  const isEmailInvite = !clerkId;
  const { data: users, isLoading } = useUsers(isEmailInvite ? [] : [userId]);
  const userData = isEmailInvite ? null : users?.[0];
  const pathname = usePathname();
  const relativePath = pathname.startsWith('/') ? pathname.slice(1) : pathname;
  const usernameWithAt = username ? (username.startsWith('@') ? username : `@${username}`) : '';

  if (isLoading && !imageUrl) {
    return (
      <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-3 w-16 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  const [firstName, lastName] = userData?.displayName?.split(' ') || [null, null];

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'admin':
        return 'secondary';
      case 'editor':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const roleDisplay = (
    (canManageRoles || currentUserRole) && role !== 'owner' ? (
      <DropdownMenu modal={false}>
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
        <DropdownMenuContent align="end" className="z-[150]">
          {canManageRoles && (
            <>
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
            </>
          )}
          {/* Always show remove option for collaborators to remove themselves */}
          <DropdownMenuItem
            onClick={onRemove}
            className="text-destructive focus:text-destructive"
          >
            {currentUserRole && !canManageRoles ? "Leave List" : "Remove"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ) : (
      <div className="flex items-center gap-2">
        <Badge variant={getRoleBadgeVariant(role)} className="capitalize">
          {role}
        </Badge>
      </div>
    )
  );

  const content = (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        {isEmailInvite ? (
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-muted">
                <Mail className="h-4 w-4 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate max-w-[200px]">
                {email}
              </span>
              <Badge variant="secondary" className="mt-0.5 text-xs w-fit">
                Pending Invite
              </Badge>
            </div>
          </div>
        ) : (
          <UserProfileBase
            username={username || userData?.username || ''}
            firstName={firstName}
            lastName={lastName}
            imageUrl={imageUrl || userData?.imageUrl}
            variant="compact"
            hideFollow={true}
            linkToProfile={false}
          />
        )}
      </div>
      <div onClick={(e) => e.preventDefault()}>
        {roleDisplay}
      </div>
    </div>
  );

  if (status === 'accepted') {
    return (
      <Link href={`/${usernameWithAt}?from=${relativePath}`}>
        {content}
      </Link>
    );
  }

  return content;
} 