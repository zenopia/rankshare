"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ListCategory, LIST_CATEGORIES } from "@/types/list";

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

const formSchema = z.object({
  q: z.string().optional(),
  category: z.enum(['movies', 'books', 'music', 'games', 'other', 'tv-shows', 'restaurants'] as const).optional(),
  sort: z.enum(["newest", "most-viewed"]).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface SearchFormProps {
  defaultValues?: {
    q?: string;
    category?: ListCategory;
    sort?: "newest" | "most-viewed";
  };
}

export function SearchForm({ defaultValues }: SearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      q: defaultValues?.q || "",
      category: defaultValues?.category,
      sort: defaultValues?.sort,
    },
  });

  function onSubmit(data: FormData) {
    const params = new URLSearchParams(searchParams.toString());
    
    if (data.q) {
      params.set("q", data.q);
    } else {
      params.delete("q");
    }

    if (data.category) {
      params.set("category", data.category);
    } else {
      params.delete("category");
    }

    if (data.sort) {
      params.set("sort", data.sort);
    } else {
      params.delete("sort");
    }

    router.push(`?${params.toString()}`);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="q"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Search</FormLabel>
              <FormControl>
                <Input placeholder="Search lists..." {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
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
                    {LIST_CATEGORIES.map((category) => (
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
                <FormLabel>Sort</FormLabel>
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
      </form>
    </Form>
  );
} 