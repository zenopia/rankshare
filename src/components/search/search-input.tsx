"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useEffect, useState } from "react";

interface SearchInputProps {
  placeholder?: string;
  defaultValue?: string;
}

export function SearchInput({ placeholder = "Search...", defaultValue = "" }: SearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue);
  const debouncedValue = useDebounce(value, 500);

  useEffect(() => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    if (debouncedValue) {
      params.set("q", debouncedValue);
    } else {
      params.delete("q");
    }
    router.push(`?${params.toString()}`);
  }, [debouncedValue, router, searchParams]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pl-10 h-12 sm:h-10 text-base sm:text-sm"
      />
    </div>
  );
} 