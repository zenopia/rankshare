"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { LIST_CATEGORIES, LIST_PRIVACY_OPTIONS } from "@/types/list";
import type { ListPrivacy } from "@/types/list";

interface FilterSheetProps {
  defaultCategory?: string;
  defaultSort?: string;
  defaultPrivacy?: ListPrivacy | 'all';
  showPrivacyFilter?: boolean;
}

export function FilterSheet({ 
  defaultCategory, 
  defaultSort,
  defaultPrivacy,
  showPrivacyFilter = false
}: FilterSheetProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const handleCategoryChange = (value: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (value === "all") {
      params.delete("category");
    } else {
      params.set("category", value);
    }
    router.push(`/search?${params.toString()}`);
    setIsOpen(false);
  };

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (value === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    router.push(`/search?${params.toString()}`);
    setIsOpen(false);
  };

  const handlePrivacyChange = (value: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (value === "all") {
      params.delete("privacy");
    } else {
      params.set("privacy", value);
    }
    router.push(`/search?${params.toString()}`);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="w-full sm:w-[120px]">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filter Lists</SheetTitle>
          <p className="text-sm text-muted-foreground">
            Filter and sort lists to find exactly what you&apos;re looking for.
          </p>
        </SheetHeader>
        <div className="mt-4 space-y-8">
          <div>
            <h4 className="mb-4 text-sm font-medium">Category</h4>
            <RadioGroup
              defaultValue={defaultCategory || "all"}
              onValueChange={handleCategoryChange}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all" className="text-sm">All Categories</Label>
              </div>
              {LIST_CATEGORIES.map((category) => (
                <div key={category.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={category.value} id={category.value} />
                  <Label htmlFor={category.value} className="text-sm">{category.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {showPrivacyFilter && (
            <div>
              <h4 className="mb-4 text-sm font-medium">Privacy</h4>
              <RadioGroup
                defaultValue={defaultPrivacy || "all"}
                onValueChange={handlePrivacyChange}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="privacy-all" />
                  <Label htmlFor="privacy-all" className="text-sm">All</Label>
                </div>
                {LIST_PRIVACY_OPTIONS.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`privacy-${option.value}`} />
                    <Label htmlFor={`privacy-${option.value}`} className="text-sm">{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          <div>
            <h4 className="mb-4 text-sm font-medium">Sort By</h4>
            <RadioGroup
              defaultValue={defaultSort || "newest"}
              onValueChange={handleSortChange}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="newest" id="newest" />
                <Label htmlFor="newest" className="text-sm">Newest</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="most-viewed" id="most-viewed" />
                <Label htmlFor="most-viewed" className="text-sm">Most Viewed</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}