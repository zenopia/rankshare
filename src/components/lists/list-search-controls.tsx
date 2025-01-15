"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { ListCategory } from "@/types/list";
import { LIST_CATEGORIES } from "@/types/list";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ListSearchControlsProps {
  defaultCategory?: ListCategory;
  defaultSort?: string;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'most-viewed', label: 'Most Viewed' },
  { value: 'most-pinned', label: 'Most Pinned' },
];

export function ListSearchControls({ defaultCategory, defaultSort }: ListSearchControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const onCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category && category !== 'all') {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    router.push(`?${params.toString()}`);
  };

  const onSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (sort) {
      params.set('sort', sort);
    } else {
      params.delete('sort');
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex gap-4">
      <Select
        defaultValue={defaultCategory}
        onValueChange={onCategoryChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {LIST_CATEGORIES.map((category) => (
            <SelectItem key={category} value={category}>
              {category === 'tv-shows' ? 'TV Shows' : 
               category === 'things-to-do' ? 'Things to do' :
               category.charAt(0).toUpperCase() + category.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        defaultValue={defaultSort}
        onValueChange={onSortChange}
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