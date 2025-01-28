"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LIST_CATEGORIES } from "@/types/list";
import type { ListCategory } from "@/types/list";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "updated", label: "Recently Updated" },
  { value: "popular", label: "Most Popular" },
] as const;

interface ListFiltersProps {
  className?: string;
}

export function ListFilters({ className }: ListFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const category = searchParams.get("category") || "all";
  const sort = searchParams.get("sort") || "newest";

  const createQueryString = (params: Record<string, string>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value === "all") {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, value);
      }
    });
    return newSearchParams.toString();
  };

  return (
    <div className="flex items-center gap-4">
      <Select
        value={category}
        onValueChange={(value) => {
          const queryString = createQueryString({ category: value });
          router.push(`?${queryString}`);
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {LIST_CATEGORIES.map((category) => (
            <SelectItem key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={sort}
        onValueChange={(value) => {
          const queryString = createQueryString({ sort: value });
          router.push(`?${queryString}`);
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 