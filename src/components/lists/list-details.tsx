"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { CategoryBadge } from "@/components/lists/category-badge";
import { PrivacyBadge } from "@/components/lists/privacy-badge";
import { ListStats } from "@/components/lists/list-stats";
import { PinButton } from "@/components/lists/pin-button";
import { formatDateTime } from "@/lib/utils/date";
import { ShareDialog } from "@/components/lists/share-dialog";
import type { EnhancedList, ListPrivacy } from "@/types/list";

interface ListDetailsProps {
  list: EnhancedList;
  isPinned?: boolean;
  onPinSuccess?: () => void;
  onPrivacyChange?: (privacy: ListPrivacy) => void;
}

export function ListDetails({
  list,
  isPinned = false,
  onPinSuccess,
  onPrivacyChange,
}: ListDetailsProps) {
  const router = useRouter();

  if (!list || !list.owner) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold">{list.title || 'Untitled List'}</h1>
                <PrivacyBadge privacy={list.privacy} />
                <CategoryBadge category={list.category} />
              </div>
              <p className="text-muted-foreground">
                {list.description || "No description"}
              </p>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>By @{list.owner.username || 'unknown'}</span>
              <span>
                Created {formatDateTime(list.createdAt)}
              </span>
              <span>
                Updated {formatDateTime(list.updatedAt)}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <ShareDialog
              listId={list.id}
              title={list.title || 'Untitled List'}
              privacy={list.privacy}
              onPrivacyChange={onPrivacyChange}
            />
            {list.privacy === "unlisted" && (
              <div className="text-sm text-muted-foreground flex items-center">
                <span className="px-2">·</span>
                <span>Only accessible via link</span>
              </div>
            )}
            <PinButton
              listId={list.id}
              initialIsPinned={isPinned}
              onSuccess={onPinSuccess}
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t pt-6">
          <ListStats
            viewCount={list.stats?.viewCount || 0}
            pinCount={list.stats?.pinCount || 0}
            itemCount={list.stats?.itemCount || 0}
            className="text-base"
          />
          {list.collaborators?.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {list.collaborators.length} collaborator{list.collaborators.length !== 1 && "s"}
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Items</h2>
          {!list.items?.length ? (
            <p className="text-sm text-muted-foreground">No items in this list</p>
          ) : (
            <div className="space-y-4">
              {list.items
                .sort((a, b) => (a.position || 0) - (b.position || 0))
                .map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 rounded-lg border p-4"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                      {item.position || 0}
                    </div>
                    <div className="flex-1 space-y-1">
                      <h3 className="font-medium">{item.title || 'Untitled Item'}</h3>
                      {item.description && (
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      )}
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {item.url}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
} 