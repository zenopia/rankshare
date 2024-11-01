"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ListCategory } from "@/types/list";

const searchSchema = z.object({
  q: z.string().optional(),
  category: z.enum(['movies', 'tv-shows', 'books', 'restaurants']).optional(),
  sort: z.enum(['newest', 'most-viewed']).optional(),
});

type SearchSchema = z.infer<typeof searchSchema>;

const categories: { label: string; value: ListCategory }[] = [
  { label: "Movies", value: "movies" },
  { label: "TV Shows", value: "tv-shows" },
  { label: "Books", value: "books" },
  { label: "Restaurants", value: "restaurants" },
];

interface SearchFormProps {
  defaultValues?: {
    q?: string;
    category?: string;
    sort?: string;
  };
}

export function SearchForm({ defaultValues }: SearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const form = useForm<SearchSchema>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      q: defaultValues?.q || "",
      category: defaultValues?.category as ListCategory | undefined,
      sort: defaultValues?.sort as "newest" | "most-viewed" | undefined,
    },
  });

  function onSubmit(data: SearchSchema) {
    const params = new URLSearchParams(searchParams);
    
    if (data.q) params.set("q", data.q);
    else params.delete("q");
    
    if (data.category) params.set("category", data.category);
    else params.delete("category");
    
    if (data.sort) params.set("sort", data.sort);
    else params.delete("sort");

    router.push(`/search?${params.toString()}`);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
          <FormField
            control={form.control}
            name="q"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Search</FormLabel>
                <FormControl>
                  <Input placeholder="Search lists..." {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sort"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sort by</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="most-viewed">Most Viewed</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        <Button type="submit">Search</Button>
      </form>
    </Form>
  );
} 