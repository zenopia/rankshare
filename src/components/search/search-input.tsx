"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useDebouncedCallback } from "use-debounce";

interface SearchInputProps {
  placeholder?: string;
  defaultValue?: string;
}

export function SearchInput({ placeholder = "Search...", defaultValue }: SearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }
    router.push(`?${params.toString()}`);
  }, 300);

  return (
    <Input 
      placeholder={placeholder}
      defaultValue={defaultValue}
      onChange={(e) => handleSearch(e.target.value)}
    />
  );
} 