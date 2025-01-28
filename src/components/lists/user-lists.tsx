import { Card } from "@/components/ui/card";
import { ListGrid } from "@/components/lists/list-grid";
import type { EnhancedList } from "@/types/list";

interface UserListsProps {
  userId: string;
  username: string;
  displayName: string;
  lists: EnhancedList[];
}

export function UserLists({ userId, username, displayName, lists }: UserListsProps) {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{displayName}</h1>
            <p className="text-muted-foreground">@{username}</p>
          </div>
        </div>

        <div className="mt-6">
          {lists.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No lists found</p>
            </div>
          ) : (
            <ListGrid lists={lists} />
          )}
        </div>
      </Card>
    </div>
  );
} 