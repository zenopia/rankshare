"use client";

import { List } from "@/types/list";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/date";
import Link from "next/link";

interface ListDetailLayoutProps {
  list: List;
  profileUserId: string;
  displayName: string;
  username: string;
}

export function ListDetailLayout({ 
  list,
  profileUserId,
  displayName,
  username 
}: ListDetailLayoutProps) {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{list.title}</h1>
              {list.description && (
                <p className="text-muted-foreground mt-2">
                  {list.description}
                </p>
              )}
              <div className="flex items-center space-x-4 mt-4 text-sm text-muted-foreground">
                <Link 
                  href={`/@${username}`}
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
          </div>
        </div>

        <div className="space-y-4">
          {!list.items || list.items.length === 0 ? (
            <p className="text-muted-foreground">No items in this list yet</p>
          ) : (
            list.items.map((item, index) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-muted-foreground">
                        {index + 1}.
                      </span>
                      <h2 className="font-semibold">{item.title}</h2>
                    </div>
                    {item.comment && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.comment}
                      </p>
                    )}
                    {item.properties?.map(prop => (
                      <div key={prop.id} className="mt-2">
                        <p className="text-sm text-muted-foreground">
                          {prop.label}:
                          {prop.type === 'link' ? (
                            <a 
                              href={prop.value}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 text-primary hover:underline"
                            >
                              {prop.value}
                            </a>
                          ) : (
                            <span className="ml-2">{prop.value}</span>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </Card>
    </div>
  );
} 