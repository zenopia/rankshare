import { List, ListItem } from "@/types/list";

interface ListViewTestProps {
  list: List;
  isOwner: boolean;
  isPinned: boolean;
  isFollowing: boolean;
}

export function ListViewTest({ 
  list, 
  isOwner, 
  isPinned,
  isFollowing
}: ListViewTestProps) {
  return (
    <div className="space-y-8">
      {/* Start with just the items section */}
      <div className="items-section space-y-4">
        <h2 className="text-xl font-semibold">Items</h2>
        {Array.isArray(list.items) && list.items.length > 0 ? (
          <ul className="space-y-2">
            {list.items.map((item: ListItem, index: number) => {
              const itemKey = `item-${item.id}-${index}`;
              return (
                <li key={itemKey} className="flex items-stretch rounded-lg border bg-card">
                  <div className="flex items-center justify-center min-w-[3rem] bg-muted rounded-l-lg">
                    <span className="text-base font-medium text-muted-foreground">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1 p-4">
                    <div className="font-medium">{item.title}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div>No items in this list</div>
        )}
      </div>
    </div>
  );
} 