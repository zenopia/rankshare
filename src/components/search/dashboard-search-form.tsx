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
import { LIST_CATEGORIES } from "@/types/list";

const searchSchema = z.object({
  q: z.string().optional(),
  category: z.enum(['movies', 'tv-shows', 'books', 'restaurants', 'all']).optional(),
  sort: z.enum(['newest', 'oldest', 'most-viewed']).optional(),
  privacy: z.enum(['all', 'public', 'private']).optional(),
});

type SearchSchema = z.infer<typeof searchSchema>;

interface SearchFormProps {
  defaultValues?: {
    q?: string;
    category?: string;
    sort?: string;
    privacy?: string;
  };
}

export function DashboardSearchForm({ defaultValues }: SearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const form = useForm<SearchSchema>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      q: defaultValues?.q || "",
      category: (defaultValues?.category || 'all') as any,
      sort: defaultValues?.sort as any || "newest",
      privacy: defaultValues?.privacy as any || "all",
    },
  });

  const onSubmit = (data: SearchSchema) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (data.q) params.set("q", data.q);
    else params.delete("q");
    
    if (data.category && data.category !== 'all') params.set("category", data.category);
    else params.delete("category");
    
    if (data.sort) params.set("sort", data.sort);
    else params.delete("sort");
    
    if (data.privacy && data.privacy !== "all") params.set("privacy", data.privacy);
    else params.delete("privacy");

    router.push(`?${params.toString()}`);
  };

  const sortOptions = [
    { label: "Newest", value: "newest" },
    { label: "Oldest", value: "oldest" },
    { label: "Most Viewed", value: "most-viewed" },
  ];

  const privacyOptions = [
    { label: "All", value: "all" },
    { label: "Public", value: "public" },
    { label: "Private", value: "private" },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          <FormField
            control={form.control}
            name="q"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
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
                    <SelectItem value="all">All categories</SelectItem>
                    {LIST_CATEGORIES.map(({ label, value }) => (
                      <SelectItem key={value} value={value}>
                        {label}
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
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sortOptions.map(({ label, value }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="privacy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Privacy</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {privacyOptions.map(({ label, value }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit">
            Apply Filters
          </Button>
        </div>
      </form>
    </Form>
  );
} 