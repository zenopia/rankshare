import { Eye, Bookmark, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";

interface ListStatsProps {
  viewCount: number;
  pinCount: number;
  itemCount: number;
  className?: string;
}

export function ListStats({
  viewCount,
  pinCount,
  itemCount,
  className,
}: ListStatsProps) {
  return (
    <div className={cn("flex items-center gap-3 text-muted-foreground", className)}>
      <div className="flex items-center gap-1">
        <Eye className="h-4 w-4" />
        <span className="text-xs">{viewCount}</span>
      </div>
      <div className="flex items-center gap-1">
        <Bookmark className="h-4 w-4" />
        <span className="text-xs">{pinCount}</span>
      </div>
      <div className="flex items-center gap-1">
        <ListChecks className="h-4 w-4" />
        <span className="text-xs">{itemCount}</span>
      </div>
    </div>
  );
} 