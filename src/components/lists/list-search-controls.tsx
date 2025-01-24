"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LIST_CATEGORIES, type ListCategory } from "@/types/list";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/search/search-input";
import { useEffect, useRef, useState } from "react";

interface ListSearchControlsProps {
  defaultCategory?: ListCategory;
  defaultSort?: string;
  showSearch?: boolean;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'views', label: 'Most Views' },
  { value: 'pins', label: 'Most Pins' },
];

export function ListSearchControls({ defaultCategory, defaultSort, showSearch = false }: ListSearchControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Show search initially if there's a search term in URL
  useEffect(() => {
    if (searchParams.get('q') && showSearch) {
      setIsSearchVisible(true);
    }
  }, [searchParams, showSearch]);

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

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
    if (!isSearchVisible) {
      // Focus the search input on next render
      setTimeout(() => {
        searchInputRef.current?.querySelector('input')?.focus();
      }, 0);
    }
  };

  return (
    <div>
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <Select
            defaultValue={defaultCategory}
            onValueChange={onCategoryChange}
          >
            <SelectTrigger className="w-full">
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
        </div>

        <div className="flex-1">
          <Select
            defaultValue={defaultSort}
            onValueChange={onSortChange}
          >
            <SelectTrigger className="w-full">
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

        {showSearch && (
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSearch}
            className="h-10 w-10 border-2 shrink-0"
            aria-label="Toggle search"
          >
            <Search className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showSearch && (
        <div 
          className={`
            overflow-hidden transition-[height,margin] duration-300 ease-in-out
            ${isSearchVisible ? 'h-14 mt-2' : 'h-0 mt-0'}
          `}
        >
          <div className="h-14" ref={searchInputRef}>
            <SearchInput 
              placeholder="Search lists..." 
              defaultValue={searchParams.get('q') ?? ''}
            />
          </div>
        </div>
      )}
    </div>
  );
} 