"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { EnhancedList } from "@/types/list";

interface ListDetailProps {
  list: EnhancedList;
  profileUserId: string;
  displayName: string;
  username: string;
  isOwnList: boolean;
}

export function ListDetail({ 
  list, 
  profileUserId, 
  displayName, 
  username,
  isOwnList 
}: ListDetailProps) {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{list.title}</h1>
              <Badge variant="outline" className="capitalize">
                {list.privacy}
              </Badge>
            </div>
            {list.description && (
              <p className="mt-2 text-muted-foreground">
                {list.description}
              </p>
            )}
            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
              <Link 
                href={`/u/${username}`}
                className="hover:underline"
              >
                {displayName}
              </Link>
              <span>•</span>
              <span>{list.items?.length || 0} items</span>
              <span>•</span>
              <span>{list.stats.viewCount} views</span>
              <span>•</span>
              <span>Updated {formatDate(list.updatedAt)}</span>
            </div>
          </div>

          {isOwnList && (
            <Button asChild variant="outline">
              <Link href={`/u/${username}/lists/${list.id}/edit`}>
                Edit List
              </Link>
            </Button>
          )}
        </div>

        <div className="mt-8">
          {!list.items || list.items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No items in this list yet</p>
              {isOwnList && (
                <Button asChild className="mt-4">
                  <Link href={`/u/${username}/lists/${list.id}/edit`}>
                    Add Items
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {list.items.map((item, index) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-medium">{item.title}</h3>
                      {item.description && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      )}
                    </div>
                    {item.url && (
                      <Button asChild variant="outline" size="sm">
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          Visit
                        </a>
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
} 