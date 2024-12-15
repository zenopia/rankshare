import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ListCategory } from "@/types/list";

const categoryStyles: Record<ListCategory, { color: string }> = {
  "movies": { color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200" },
  "tv-shows": { color: "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200" },
  "books": { color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
  "restaurants": { color: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200" },
  "recipes": { color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
  "things-to-do": { color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200" },
  "other": { color: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200" }
};

interface CategoryBadgeProps {
  category: ListCategory;
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const categoryStyle = categoryStyles[category]?.color || categoryStyles.other.color;

  return (
    <Badge 
      variant="secondary" 
      className={cn(
        "font-medium text-xs capitalize",
        categoryStyle,
        className
      )}
    >
      {category.replace('-', ' ')}
    </Badge>
  );
}

export { categoryStyles }; 