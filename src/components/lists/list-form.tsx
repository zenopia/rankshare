"use client";

import { useState, KeyboardEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { ListCategory, ListPrivacy, LIST_CATEGORIES, PRIVACY_OPTIONS } from "@/types/list";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import * as z from "zod";

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
import { X } from "lucide-react";

interface DragEndResult {
  destination?: {
    droppableId: string;
    index: number;
  } | null;
  source: {
    droppableId: string;
    index: number;
  };
  draggableId: string;
  type: string;
}

interface ListFormProps {
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
  category: z.enum(["movies", "books", "music", "games", "other", "tv-shows", "restaurants"] as const),
  description: z.string(),
  privacy: z.enum(["public", "private"] as const),
});

type FormData = z.infer<typeof formSchema>;

export function ListForm({ initialData, mode = 'create' }: ListFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<{ id: string; title: string; comment?: string }[]>(
    initialData?.items || []
  );
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      category: initialData?.category || "movies",
      description: initialData?.description || "",
      privacy: initialData?.privacy || "public",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      
      if (items.length === 0) {
        toast.error('Add at least one item to your list');
        return;
      }

      const formattedItems = items.map((item, index) => ({
        title: item.title,
        comment: item.comment || undefined,
        rank: index + 1,
      }));

      const listData = {
        title: data.title,
        category: data.category,
        description: data.description,
        privacy: data.privacy,
        items: formattedItems,
      };

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
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Failed to ${mode} list`);
      }
      
      toast.success(`List ${mode === 'edit' ? 'updated' : 'created'} successfully!`);
      router.push('/my-lists');
      router.refresh();
    } catch (error) {
      console.error(`Form submission error:`, error);
      toast.error(error instanceof Error ? error.message : `Failed to ${mode} list. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addItem = () => {
    setItems([...items, { id: crypto.randomUUID(), title: "", comment: "" }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const onDragEnd = (result: DragEndResult) => {
    if (!result.destination) return;

    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);

    setItems(newItems);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (items[index].title.trim()) {
        addItem();
        // Focus the new input after a short delay to allow for DOM update
        setTimeout(() => {
          const inputs = document.querySelectorAll<HTMLInputElement>('input[placeholder="Item title"]');
          const newInput = inputs[inputs.length - 1];
          newInput?.focus();
        }, 0);
      }
    }
  };

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
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select privacy setting" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PRIVACY_OPTIONS.map((option) => (
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
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="flex items-center gap-2 bg-white p-4 rounded-lg shadow-sm"
                        >
                          <span className="text-sm text-gray-500">{index + 1}</span>
                          <Input
                            placeholder="Item title"
                            value={item.title}
                            onChange={(e) => {
                              const newItems = [...items];
                              newItems[index].title = e.target.value;
                              setItems(newItems);
                            }}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                          />
                          <Input
                            placeholder="Comment (optional)"
                            value={item.comment}
                            onChange={(e) => {
                              const newItems = [...items];
                              newItems[index].comment = e.target.value;
                              setItems(newItems);
                            }}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={addItem}
                  >
                    Add Item
                  </Button>
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting 
            ? (mode === 'edit' ? 'Updating...' : 'Creating...') 
            : (mode === 'edit' ? 'Update List' : 'Create List')}
        </Button>
      </form>
    </Form>
  );
} 