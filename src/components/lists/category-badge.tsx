import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ListCategory } from "@/types/list";

const categoryStyles: Record<ListCategory, { color: string }> = {
  "movies": { color: "bg-[var(--category-movies)] text-[var(--category-badge-text)]" },
  "tv-shows": { color: "bg-[var(--category-tv)] text-[var(--category-badge-text)]" },
  "books": { color: "bg-[var(--category-books)] text-[var(--category-badge-text)]" },
  "restaurants": { color: "bg-[var(--category-restaurants)] text-[var(--category-badge-text)]" },
  "recipes": { color: "bg-[var(--category-recipes)] text-[var(--category-badge-text)]" },
  "things-to-do": { color: "bg-[var(--category-activities)] text-[var(--category-badge-text)]" },
  "other": { color: "bg-[var(--category-other)] text-[var(--category-badge-text)]" },
  "all": { color: "bg-[var(--category-other)] text-[var(--category-badge-text)]" }
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