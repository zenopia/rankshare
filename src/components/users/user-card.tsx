import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { User } from "@/types/list";

interface UserCardProps {
  user: User & { 
    hasNewLists?: boolean;
    lastListCreated?: Date;
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
            <p className="text-sm text-muted-foreground">
              {user.email}
            </p>
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