"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { ListCategory } from "@/types/list";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import * as z from "zod";
import { Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { TiptapEditor } from "@/components/editor/tiptap-editor";
import { useAuth } from "@clerk/nextjs";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DraggableListItem } from "@/components/lists/draggable-list-item";

interface ListItem {
  id: string;
  title: string;
  comment?: string;
  rank: number;
  properties?: Array<{
    id: string;
    type?: 'text' | 'link';
    label: string;
    value: string;
  }>;
}

export interface ListFormProps {
  mode?: 'create' | 'edit';
  returnPath?: string;
  defaultValues?: {
    id: string;
    title: string;
    description?: string;
    category: ListCategory;
    privacy: 'public' | 'private';
    items: Array<{
      id: string;
      title: string;
      comment?: string;
      rank: number;
      properties?: Array<{
        id: string;
        type?: 'text' | 'link';
        label: string;
        value: string;
      }>;
    }>;
  };
}

const formSchema = z.object({
  title: z.string()
    .min(3, "Title must be at least 3 characters long")
    .max(100, "Title cannot exceed 100 characters"),
  category: z.enum([
    "movies",
    "tv-shows",
    "books",
    "restaurants",
    "recipes",
    "things-to-do",
    "other"
  ] as const),
  description: z.string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  privacy: z.enum(["public", "private"] as const),
});

type FormData = z.infer<typeof formSchema>;

const FORM_CATEGORIES = [
  "movies",
  "tv-shows",
  "books",
  "restaurants",
  "recipes",
  "things-to-do",
  "other"
] as const;

export function ListFormContent({ defaultValues, mode = 'create', returnPath }: ListFormProps) {
  const router = useRouter();
  const { userId } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState(() => {
    if (defaultValues?.items) {
      // Convert existing items to HTML list
      const itemsHtml = defaultValues.items
        .sort((a, b) => a.rank - b.rank)
        .map(item => `<li>${item.title}</li>`)
        .join('');
      return `<ol>${itemsHtml}</ol>`;
    }
    return '';
  });

  // Fetch username when component mounts
  useEffect(() => {
    const fetchUsername = async () => {
      if (!userId) return;
      
      try {
        const response = await fetch('/api/profile');
        const data = await response.json();
        if (response.ok && data.username) {
          setUsername(data.username);
        }
      } catch (error) {
        console.error('Error fetching username:', error);
      }
    };

    fetchUsername();
  }, [userId]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      category: (defaultValues?.category === 'all' ? 'movies' : defaultValues?.category) || "movies",
      description: defaultValues?.description || "",
      privacy: defaultValues?.privacy || "public",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    // Parse the editor content to get list items
    const parser = new DOMParser();
    const doc = parser.parseFromString(editorContent, 'text/html');
    const listItems = Array.from(doc.querySelectorAll('li'));
    
    if (listItems.length === 0) {
      toast.error("Please add at least one item to your list");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...data,
        items: listItems.map((item, index) => ({
          title: item.textContent || '',
          rank: index + 1,
        }))
      };

      const response = await fetch(
        mode === 'create' 
          ? '/api/lists' 
          : `/api/lists/${defaultValues?.id}`,
        {
          method: mode === 'create' ? 'POST' : 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to save list');
      }
      
      toast.success(
        mode === 'create' 
          ? "List created successfully!" 
          : "List updated successfully!"
      );

      if (returnPath) {
        router.push(returnPath);
      } else if (username) {
        const listPath = mode === 'create' 
          ? `/${username}/lists/${responseData.id}`
          : `/${username}/lists/${defaultValues?.id}`;
        router.push(listPath);
      }
      router.refresh();
    } catch (error) {
      console.error('Error saving list:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : "Failed to save list"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input 
                  placeholder="List title" 
                  className="text-xl font-medium h-12"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem className="flex-1">
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {FORM_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="privacy"
            render={({ field }) => (
              <FormItem>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Privacy" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input 
                  placeholder="Description (optional)" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">List Items</h3>
          </div>

          <div className="space-y-6">
            <div className="border rounded-lg p-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Type or paste your items below. Use numbers (1.) or bullets (-) to create a list.
                Press Enter to add new items. You can reorder items by dragging them.
              </p>
              <TiptapEditor
                content={editorContent}
                onChange={setEditorContent}
                placeholder="Start typing your list items..."
                className="min-h-[300px]"
              />
            </div>
          </div>
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'create' ? 'Create List' : 'Update List'}
        </Button>
      </form>
    </Form>
  );
} 