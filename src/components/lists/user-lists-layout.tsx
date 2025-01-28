"use client";

import { List } from "@/types/list";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/date";
import Link from "next/link";

interface UserListsLayoutProps {
  profileUserId: string;
  displayName: string;
  username: string;
  lists: List[];
}

export function UserListsLayout({ 
  profileUserId,
  displayName,
  username,
  lists 
}: UserListsLayoutProps) {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{displayName}&apos;s Lists</h1>
            <p className="text-muted-foreground">@{username}</p>
          </div>
        </div>

        <div className="space-y-4">
          {lists.length === 0 ? (
            <p className="text-muted-foreground">No public lists yet</p>
          ) : (
            lists.map(list => (
              <Link 
                key={list.id}
                href={`/@${username}/lists/${list.id}`}
                className="block"
              >
                <Card className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="font-semibold">{list.title}</h2>
                      {list.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {list.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                        <span>{list.items?.length || 0} items</span>
                        <span>•</span>
                        <span>{list.stats.viewCount} views</span>
                        <span>•</span>
                        <span>Updated {formatDate(list.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))
          )}
        </div>
      </Card>
    </div>
  );
} 