import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Bell, ListChecks } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { User } from "@/types/list";

interface UserCardProps {
  user: User & { 
    hasNewLists?: boolean;
    lastListCreated?: Date;
    listCount: number;
  };
}

export function UserCard({ user }: UserCardProps) {
  return (
    <Link
      href={`/users/${user.clerkId}/lists`}
      className="block overflow-hidden rounded-lg border bg-card hover:border-primary"
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold leading-none tracking-tight">
              {user.username}
            </h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <ListChecks className="h-4 w-4" />
              {user.listCount} {user.listCount === 1 ? 'list' : 'lists'}
            </div>
          </div>
          {user.hasNewLists && (
            <Badge variant="success" className="flex items-center gap-1">
              <Bell className="h-3 w-3" />
              New Lists
            </Badge>
          )}
        </div>

        {user.lastListCreated && (
          <p className="mt-4 text-sm text-muted-foreground">
            Last list created {formatDistanceToNow(new Date(user.lastListCreated), { addSuffix: true })}
          </p>
        )}
      </div>
    </Link>
  );
} 