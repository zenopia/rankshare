import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ListCategory } from "@/types/list";

const categoryStyles: Record<ListCategory, { color: string }> = {
  "movies": { color: "bg-indigo-500 text-white dark:bg-indigo-500 dark:text-white" },
  "tv-shows": { color: "bg-violet-500 text-white dark:bg-violet-500 dark:text-white" },
  "books": { color: "bg-stone-500 text-white dark:bg-stone-500 dark:text-white" },
  "restaurants": { color: "bg-rose-500 text-white dark:bg-rose-500 dark:text-white" },
  "recipes": { color: "bg-orange-500 text-white dark:bg-orange-500 dark:text-white" },
  "things-to-do": { color: "bg-emerald-500 text-white dark:bg-emerald-500 dark:text-white" },
  "other": { color: "bg-slate-500 text-white dark:bg-slate-500 dark:text-white" },
  "all": { color: "bg-gray-500 text-white dark:bg-gray-500 dark:text-white" }
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