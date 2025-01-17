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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  defaultValues?: {
    id: string;
    title: string;
    description?: string;
    category: ListCategory;
    privacy: 'public' | 'private';
    items: ListItem[];
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

export function ListFormContent({ defaultValues, mode = 'create' }: ListFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<ListItem[]>(() => {
    const existingItems = defaultValues?.items || [];
    return existingItems.map((item, index) => ({
      ...item,
      rank: index + 1,
      properties: (item.properties || []).map(prop => ({
        ...prop,
        id: prop.id || Math.random().toString(36).substr(2, 9)
      }))
    }));
  });
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [quickAddText, setQuickAddText] = useState('');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      category: defaultValues?.category || "movies",
      description: defaultValues?.description || "",
      privacy: defaultValues?.privacy || "public",
    },
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (items.length === 0) {
      toast.error("Please add at least one item to your list");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...data,
        items: items.map((item, index) => ({
          title: item.title,
          rank: index + 1,
          comment: item.comment,
          properties: item.properties?.map(prop => ({
            type: prop.type || 'text',
            label: prop.label,
            value: prop.value
          }))
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

      router.push(`/lists/${responseData.id}`);
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

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reorderedItems = Array.from(items);
    const [removed] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, removed);

    const oldRanks = items.reduce((acc, item) => {
      acc[item.id] = item.rank;
      return acc;
    }, {} as Record<string, number>);

    const updatedItems = reorderedItems.map((item, index) => ({
      ...item,
      rank: index + 1
    }));

    const finalItems = updatedItems.map(item => {
      if (oldRanks[item.id] !== item.rank) {
        return { ...item };
      }
      return item;
    });

    setItems(finalItems);
  };

  const addItem = (title: string = "") => {
    const newItem: ListItem = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      rank: items.length + 1,
      properties: [] as Array<{
        id: string;
        type?: 'text' | 'link';
        label: string;
        value: string;
      }>
    };

    setItems([...items, newItem]);
  };

  const quickAddItems = (text: string) => {
    if (!text.trim()) return;
    
    const newItems: ListItem[] = text
      .split('\n')
      .filter(line => line.trim())
      .map((line, index) => ({
        id: Math.random().toString(36).substr(2, 9),
        title: line.trim(),
        rank: items.length + index + 1,
        properties: []
      }));

    setItems([...items, ...newItems]);
    setQuickAddText('');
    setQuickAddOpen(false);
  };

  const updateItem = (id: string, updates: Partial<ListItem>) => {
    if (updates.properties) {
      updates.properties = updates.properties.map(prop => ({
        ...prop,
        id: prop.id || Math.random().toString(36).substr(2, 9)
      }));
    }

    setItems(items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const removeItem = (id: string) => {
    const itemIndex = items.findIndex(item => item.id === id);
    const oldRanks = items.reduce((acc, item) => {
      acc[item.id] = item.rank;
      return acc;
    }, {} as Record<string, number>);

    const filteredItems = items
      .filter(item => item.id !== id)
      .map((item, index) => ({
        ...item,
        rank: index + 1
      }));

    const updatedItems = filteredItems.map(item => {
      if (oldRanks[item.id] !== item.rank) {
        return { ...item };
      }
      return item;
    });

    setItems(updatedItems);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="List title"
                    className="text-lg font-medium h-12"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between gap-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="movies">Movies</SelectItem>
                      <SelectItem value="tv-shows">TV Shows</SelectItem>
                      <SelectItem value="books">Books</SelectItem>
                      <SelectItem value="restaurants">Restaurants</SelectItem>
                      <SelectItem value="recipes">Recipes</SelectItem>
                      <SelectItem value="things-to-do">Things to Do</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
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
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
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
                  <Textarea
                    placeholder="Description (optional)"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium">Items</h3>
            <div className="flex gap-2">
              <Sheet open={quickAddOpen} onOpenChange={setQuickAddOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    Quick Add
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[50vh]">
                  <SheetHeader>
                    <SheetTitle>Quick Add Items</SheetTitle>
                    <SheetDescription>
                      Enter one item per line
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-4 space-y-4">
                    <Textarea
                      className="min-h-[200px]"
                      placeholder={`Item 1
Item 2
Item 3`}
                      value={quickAddText}
                      onChange={(e) => setQuickAddText(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setQuickAddOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => quickAddItems(quickAddText)}
                        disabled={!quickAddText.trim()}
                      >
                        Add Items
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addItem()}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>
          </div>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="items">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {items.map((item, index) => (
                    <Draggable
                      key={item.id}
                      draggableId={item.id}
                      index={index}
                    >
                      {(provided, _snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                        >
                          <DraggableListItem
                            item={item}
                            dragHandleProps={provided.dragHandleProps}
                            onUpdate={(updates) => updateItem(item.id, updates)}
                            onRemove={() => removeItem(item.id)}
                            disabled={isSubmitting}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
              {mode === 'edit' && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={isSubmitting}
                  onClick={async () => {
                    if (!defaultValues?.id) return;
                    if (!confirm('Are you sure you want to delete this list? This action cannot be undone.')) return;

                    setIsSubmitting(true);
                    try {
                      const response = await fetch(`/api/lists/${defaultValues.id}`, {
                        method: 'DELETE'
                      });

                      if (!response.ok) {
                        throw new Error('Failed to delete list');
                      }

                      toast.success('List deleted successfully');
                      router.push('/my-lists');
                      router.refresh();
                    } catch (error) {
                      console.error('Error deleting list:', error);
                      toast.error('Failed to delete list');
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                >
                  Delete List
                </Button>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || items.length === 0}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : mode === 'create' ? (
                'Create List'
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
} 