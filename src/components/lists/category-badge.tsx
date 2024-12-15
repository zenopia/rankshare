import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ListCategory } from "@/types/list";

const categoryStyles: Record<ListCategory, { color: string }> = {
  movies: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  "tv-shows": { color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
  books: { color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
  restaurants: { color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  recipes: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  "things-to-do": { color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200" },
  other: { color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200" }
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