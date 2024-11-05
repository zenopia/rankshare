"use client";

import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";
import { LIST_CATEGORIES, PRIVACY_OPTIONS, ListCategory, ListPrivacyFilter } from "@/types/list";
import { useRouter, useSearchParams } from "next/navigation";

interface FilterSheetProps {
  defaultCategory?: ListCategory;
  defaultSort?: string;
  defaultPrivacy?: ListPrivacyFilter;
  showPrivacyFilter?: boolean;
}

export function FilterSheet({ 
  defaultCategory,
  defaultSort,
  defaultPrivacy,
  showPrivacyFilter = false,
}: FilterSheetProps = {}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const handleFilterChange = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`?${params.toString()}`);
    setOpen(false);
  };

  const FilterContent = () => (
    <div className="grid gap-6 py-4">
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Categories</h3>
        <div className="grid grid-cols-2 gap-2">
          {LIST_CATEGORIES.map((category) => (
            <Button
              key={category.value}
              variant={defaultCategory === category.value ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange('category', category.value)}
              className="justify-start"
            >
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      {showPrivacyFilter && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Privacy</h3>
          <div className="grid grid-cols-2 gap-2">
            {PRIVACY_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={defaultPrivacy === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange('privacy', option.value)}
                className="justify-start"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-sm font-medium">Sort</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={defaultSort === 'newest' ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange('sort', 'newest')}
            className="justify-start"
          >
            Newest
          </Button>
          <Button
            variant={defaultSort === 'most-viewed' ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange('sort', 'most-viewed')}
            className="justify-start"
          >
            Most Viewed
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="default"
          className="w-full md:w-auto"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent 
        side={isMobile ? "bottom" : "right"} 
        className={isMobile ? "h-fit max-h-[85vh]" : "w-[300px] sm:w-[400px]"}
      >
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className={isMobile ? "mt-auto" : ""}>
          <FilterContent />
        </div>
      </SheetContent>
    </Sheet>
  );
} 