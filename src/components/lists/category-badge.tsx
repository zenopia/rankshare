import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ListCategory } from "@/types/list";

const categoryColors: Record<ListCategory, { bg: string; text: string }> = {
  movies: { bg: "bg-red-100", text: "text-red-700" },
  tv: { bg: "bg-blue-100", text: "text-blue-700" },
  books: { bg: "bg-yellow-100", text: "text-yellow-700" },
  games: { bg: "bg-purple-100", text: "text-purple-700" },
  music: { bg: "bg-pink-100", text: "text-pink-700" },
  food: { bg: "bg-orange-100", text: "text-orange-700" },
  places: { bg: "bg-green-100", text: "text-green-700" },
  products: { bg: "bg-indigo-100", text: "text-indigo-700" },
  other: { bg: "bg-gray-100", text: "text-gray-700" },
};

interface CategoryBadgeProps {
  category: ListCategory;
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const colors = categoryColors[category];

  return (
    <Badge
      variant="secondary"
      className={cn(
        "font-normal",
        colors.bg,
        colors.text,
        "border-0",
        className
      )}
    >
      {category.charAt(0).toUpperCase() + category.slice(1)}
    </Badge>
  );
}

export { categoryColors }; 