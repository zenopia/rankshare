"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { ListCategory, ListPrivacy } from "@/types/list";

interface FilterSheetProps {
  defaultCategory?: ListCategory;
  defaultSort?: string;
  defaultPrivacy?: ListPrivacy | 'all';
  showPrivacyFilter?: boolean;
}

export function FilterSheet({ 
  defaultCategory,
  defaultSort = 'newest',
  defaultPrivacy = 'all',
  showPrivacyFilter = false,
}: FilterSheetProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilters(key: string, value: string) {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    router.push(`?${params.toString()}`);
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Open filter options">
          <Filter className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="right"
        className="w-80"
      >
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>
            Filter and sort your lists by category, date, and privacy settings
          </SheetDescription>
        </SheetHeader>
        <div className="mt-8 space-y-8">
          {/* Category Filter */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Category</Label>
            <RadioGroup
              defaultValue={defaultCategory}
              onValueChange={(value) => updateFilters('category', value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="" id="category-all" />
                <Label htmlFor="category-all">All Categories</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="movies" id="category-movies" />
                <Label htmlFor="category-movies">Movies</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="books" id="category-books" />
                <Label htmlFor="category-books">Books</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="games" id="category-games" />
                <Label htmlFor="category-games">Games</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="music" id="category-music" />
                <Label htmlFor="category-music">Music</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="category-other" />
                <Label htmlFor="category-other">Other</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Sort Order */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Sort By</Label>
            <RadioGroup
              defaultValue={defaultSort}
              onValueChange={(value) => updateFilters('sort', value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="newest" id="sort-newest" />
                <Label htmlFor="sort-newest">Newest First</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="oldest" id="sort-oldest" />
                <Label htmlFor="sort-oldest">Oldest First</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="most-viewed" id="sort-views" />
                <Label htmlFor="sort-views">Most Viewed</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Privacy Filter - Only shown when enabled */}
          {showPrivacyFilter && (
            <div className="space-y-4">
              <Label className="text-sm font-medium">Privacy</Label>
              <RadioGroup
                defaultValue={defaultPrivacy}
                onValueChange={(value) => updateFilters('privacy', value)}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="privacy-all" />
                  <Label htmlFor="privacy-all">All Lists</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="public" id="privacy-public" />
                  <Label htmlFor="privacy-public">Public Only</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="private" id="privacy-private" />
                  <Label htmlFor="privacy-private">Private Only</Label>
                </div>
              </RadioGroup>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}