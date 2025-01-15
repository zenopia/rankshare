"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { LIST_CATEGORIES } from "@/types/list";
import type { ListCategory } from "@/types/list";

interface FilterSheetProps {
  defaultCategory?: ListCategory;
  defaultSort?: string;
  defaultPrivacy?: 'public' | 'private' | 'all';
  defaultOwner?: 'all' | 'owned' | 'collaborated';
  showPrivacyFilter?: boolean;
  showOwnerFilter?: boolean;
}

const PRIVACY_OPTIONS = [
  { value: 'all', label: 'All Lists' },
  { value: 'public', label: 'Public Lists' },
  { value: 'private', label: 'Private Lists' }
] as const;

const OWNER_FILTER_OPTIONS = [
  { value: 'all', label: 'All Lists' },
  { value: 'owned', label: 'My Lists' },
  { value: 'collaborated', label: 'Collaborated Lists' }
] as const;

export function FilterSheet({ 
  defaultCategory, 
  defaultSort,
  defaultPrivacy,
  showPrivacyFilter = false,
  showOwnerFilter = false
}: FilterSheetProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const handleCategoryChange = (value: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (value === "all") {
      params.delete("category");
    } else {
      params.set("category", value);
    }
    router.push(`${pathname}?${params.toString()}`);
    setIsOpen(false);
  };

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (value === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    router.push(`${pathname}?${params.toString()}`);
    setIsOpen(false);
  };

  const handlePrivacyChange = (value: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (value === "all") {
      params.delete("privacy");
    } else {
      params.set("privacy", value);
    }
    router.push(`${pathname}?${params.toString()}`);
    setIsOpen(false);
  };

  const handleOwnerChange = (value: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (value === "all") {
      params.delete("owner");
    } else {
      params.set("owner", value);
    }
    router.push(`${pathname}?${params.toString()}`);
    setIsOpen(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-sm z-50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Filter Button */}
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full sm:w-[120px]"
        onClick={() => setIsOpen(true)}
      >
        <Filter className="mr-2 h-4 w-4" />
        Filter
      </Button>

      {/* Filter Sheet */}
      <div 
        className={cn(
          "fixed right-0 top-0 z-50 h-full w-[300px] bg-background p-6 shadow-lg transition-transform duration-300 ease-in-out",
          "border-l",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">Filter Lists</h2>
              <p className="text-sm text-muted-foreground">
                Filter and sort lists to find exactly what you&apos;re looking for.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          <div className="space-y-8">
            <div>
              <h4 className="mb-4 text-sm font-medium">Category</h4>
              <RadioGroup
                defaultValue={defaultCategory || "all"}
                onValueChange={handleCategoryChange}
                className="space-y-3"
              >
                <div key="all" className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className="text-sm">All Categories</Label>
                </div>
                {LIST_CATEGORIES.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <RadioGroupItem value={category} id={category} />
                    <Label htmlFor={category} className="text-sm">
                      {category === 'tv-shows' ? 'TV Shows' : 
                       category === 'things-to-do' ? 'Things to do' :
                       category.charAt(0).toUpperCase() + category.slice(1)}
                    </Label>
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
                  {PRIVACY_OPTIONS.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`privacy-${option.value}`} />
                      <Label htmlFor={`privacy-${option.value}`} className="text-sm">{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {showOwnerFilter && (
              <div>
                <h4 className="mb-4 text-sm font-medium">Owner</h4>
                <RadioGroup
                  defaultValue="all"
                  onValueChange={handleOwnerChange}
                  className="space-y-3"
                >
                  {OWNER_FILTER_OPTIONS.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`owner-${option.value}`} />
                      <Label htmlFor={`owner-${option.value}`} className="text-sm">{option.label}</Label>
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
                <div key="newest" className="flex items-center space-x-2">
                  <RadioGroupItem value="newest" id="newest" />
                  <Label htmlFor="newest" className="text-sm">Newest First</Label>
                </div>
                <div key="oldest" className="flex items-center space-x-2">
                  <RadioGroupItem value="oldest" id="oldest" />
                  <Label htmlFor="oldest" className="text-sm">Oldest First</Label>
                </div>
                <div key="most-viewed" className="flex items-center space-x-2">
                  <RadioGroupItem value="most-viewed" id="most-viewed" />
                  <Label htmlFor="most-viewed" className="text-sm">Most Viewed</Label>
                </div>
                <div key="least-viewed" className="flex items-center space-x-2">
                  <RadioGroupItem value="least-viewed" id="least-viewed" />
                  <Label htmlFor="least-viewed" className="text-sm">Least Viewed</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}