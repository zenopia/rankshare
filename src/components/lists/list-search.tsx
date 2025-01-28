"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebouncedCallback } from "use-debounce";

interface ListSearchProps {
  className?: string;
}

export function ListSearch({ className }: ListSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") || "");

  const createQueryString = (params: Record<string, string>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (!value) {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, value);
      }
    });
    return newSearchParams.toString();
  };

  const debounced = useDebouncedCallback((value: string) => {
    const queryString = createQueryString({ q: value });
    router.push(`?${queryString}`);
  }, 300);

  useEffect(() => {
    const currentQuery = searchParams.get("q");
    if (currentQuery !== value) {
      setValue(currentQuery || "");
    }
  }, [searchParams, value]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          debounced(e.target.value);
        }}
        className="pl-9"
        placeholder="Search lists..."
      />
    </div>
  );
} 