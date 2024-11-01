import Link from "next/link";
import { List } from "@/types/list";
import { formatDistanceToNow } from "date-fns";
import { Eye, Lock, Bell } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ListCardProps {
  list: List;
  searchQuery?: string;
  hasUpdate?: boolean;
}

export function ListCard({ list, searchQuery, hasUpdate }: ListCardProps) {
  // Find matching items if there's a search query
  const matchingItems = searchQuery 
    ? list.items.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.comment?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : list.items.slice(0, 3); // Show first 3 items if no search

  return (
    <Link 
      href={`/lists/${list.id}`}
      className="block p-4 sm:p-6 bg-sky-50/50 rounded-lg shadow-sm hover:shadow-md transition-shadow relative"
    >
      {hasUpdate && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute top-2 right-2">
                <Bell className="h-4 w-4 text-primary" />
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>This list has been updated since your last view</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
        <div>
          <h3 className="text-lg font-semibold">{list.title}</h3>
          <p className="text-sm text-muted-foreground">
            {list.items.length} items • {list.category}
          </p>
        </div>
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(list.createdAt), { addSuffix: true })}
        </span>
      </div>
      
      {list.description && (
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
          {list.description}
        </p>
      )}

      <div className="mt-4">
        <p className="text-sm text-muted-foreground">
          {searchQuery ? 'Matching items: ' : 'Top 3: '}
          {matchingItems.map(item => item.title).join(", ")}
        </p>
      </div>

      <div className="mt-4 pt-4 border-t flex justify-between items-center text-sm text-muted-foreground">
        <span className="font-medium">{list.ownerName}</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {list.viewCount}
          </span>
          {list.privacy === 'private' && (
            <span className="flex items-center">
              <Lock className="h-4 w-4" />
            </span>
          )}
        </div>
      </div>
    </Link>
  );
} 