"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { ListCategory, ListPrivacy, LIST_CATEGORIES, LIST_PRIVACY_OPTIONS } from "@/types/list";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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
import { Textarea } from "@/components/ui/textarea";
import { DraggableListItem } from "@/components/lists/draggable-list-item";

export interface ListFormProps {
  initialData?: {
    id: string;
    title: string;
    category: ListCategory;
    description?: string;
    privacy: ListPrivacy;
    items: { id: string; title: string; comment?: string }[];
  };
  mode?: 'create' | 'edit';
}

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.enum(["movies", "books", "recipies", "things to do", "other", "tv-shows", "restaurants"] as const),
  description: z.string(),
  privacy: z.enum(["public", "private"] as const),
});

type FormData = z.infer<typeof formSchema>;

export function ListFormContent({ initialData, mode = 'create' }: ListFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<{ id: string; title: string; comment?: string }[]>(
    initialData?.items || []
  );
  const [isMounted, setIsMounted] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      category: initialData?.category || "movies",
      description: initialData?.description || "",
      privacy: initialData?.privacy || "public",
    },
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      
      if (items.length === 0) {
        toast.error('Add at least one item to your list');
        return;
      }

      const emptyItems = items.filter(item => !item.title.trim());
      if (emptyItems.length > 0) {
        toast.error('All items must have a title');
        return;
      }

      const formattedItems = items.map((item, index) => ({
        title: item.title.trim(),
        comment: item.comment?.trim() || undefined,
        rank: index + 1,
      }));

      const listData = {
        title: data.title.trim(),
        category: data.category,
        description: data.description.trim(),
        privacy: data.privacy,
        items: formattedItems,
      };

      const toastId = toast.loading(
        mode === 'edit' 
          ? 'Updating your list...' 
          : 'Creating your list...'
      );

      const url = mode === 'edit' && initialData 
        ? `/api/lists/${initialData.id}`
        : '/api/lists';

      const method = mode === 'edit' ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(listData),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || `Failed to ${mode} list`);
      }
      
      toast.success(
        `List ${mode === 'edit' ? 'updated' : 'created'} successfully!`, 
        { id: toastId }
      );
      
      router.push('/my-lists');
      router.refresh();
    } catch (error) {
      console.error(`Form submission error:`, error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : `Failed to ${mode} list. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);

    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { id: crypto.randomUUID(), title: "", comment: "" }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (items[index].title.trim()) {
        addItem();
        setTimeout(() => {
          const inputs = document.querySelectorAll<HTMLInputElement>('input[placeholder="Item title"]');
          const newInput = inputs[inputs.length - 1];
          newInput?.focus();
        }, 0);
      }
    }
  };

  const updateItem = (index: number, field: 'title' | 'comment', value: string) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-4">
        <div className="grid gap-6 sm:gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base sm:text-sm">Title</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter list title" />
                </FormControl>
                <FormMessage className="text-sm" />
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
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
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
                <FormMessage />
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
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select privacy setting" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {LIST_PRIVACY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
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
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Add a description..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Items</h3>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="items">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {items.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided) => (
                        <DraggableListItem
                          item={item}
                          index={index}
                          provided={provided}
                          removeItem={removeItem}
                          handleKeyDown={handleKeyDown}
                          updateItem={updateItem}
                        />
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={addItem}
          >
            Add Item
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className={cn(
              "w-full sm:w-auto",
              isSubmitting && "opacity-70 cursor-not-allowed"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === 'edit' ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              mode === 'edit' ? 'Update List' : 'Create List'
            )}
          </Button>

          {isSubmitting && (
            <p className="text-sm text-muted-foreground">
              This may take a few moments...
            </p>
          )}
        </div>
      </form>
    </Form>
  );
} 