"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DragDropContext, Droppable, Draggable, DropResult, DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import { ListCategory } from "@/types/list";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import * as z from "zod";
import { Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { Switch } from "@/components/ui/switch";

export interface ListFormProps {
  mode?: 'create' | 'edit';
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

interface DraggableListItemProps {
  item: {
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
  };
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  onUpdate: (updates: Partial<{
    title: string;
    comment?: string;
    rank: number;
    properties?: Array<{
      id: string;
      type?: 'text' | 'link';
      label: string;
      value: string;
    }>;
  }>) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export function ListFormContent({ defaultValues, mode = 'create' }: ListFormProps) {
  const router = useRouter();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<Array<{
    id: string;
    title: string;
    comment?: string;
    rank: number;
    properties?: Array<{
      type?: 'text' | 'link';
      label: string;
      value: string;
    }>;
  }>>(() => defaultValues?.items || []);
  const [isMounted, setIsMounted] = useState(false);

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

  const onSubmit = async (data: FormData) => {
    if (items.length === 0) {
      toast.error("Please add at least one item to your list");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...data,
        items: items.map((item, index) => ({
          ...item,
          rank: index + 1
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

      if (!response.ok) {
        throw new Error('Failed to save list');
      }

      const list = await response.json();
      
      toast.success(
        mode === 'create' 
          ? "List created successfully!" 
          : "List updated successfully!"
      );

      router.push(`/lists/${list.id}`);
      router.refresh();
    } catch (error) {
      console.error('Error saving list:', error);
      toast.error(
        mode === 'create'
          ? "Failed to create list"
          : "Failed to update list"
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

    setItems(reorderedItems);
  };

  const addItem = () => {
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      title: "",
      comment: "",
      rank: items.length + 1,
      properties: []
    };

    setItems([...items, newItem]);
  };

  const updateItem = (id: string, updates: Partial<typeof items[0]>) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleDelete = async () => {
    if (!defaultValues?.id) return;

    try {
      const response = await fetch(`/api/lists/${defaultValues.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete list');
      }

      toast.success("List deleted successfully!");
      router.push('/my-lists');
      router.refresh();
    } catch (error) {
      console.error('Error deleting list:', error);
      toast.error("Failed to delete list");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="My Awesome List" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="movies">Movies</SelectItem>
                    <SelectItem value="tv-shows">TV Shows</SelectItem>
                    <SelectItem value="books">Books</SelectItem>
                    <SelectItem value="restaurants">Restaurants</SelectItem>
                    <SelectItem value="recipes">Recipes</SelectItem>
                    <SelectItem value="things-to-do">Things to do</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
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
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Tell us about your list..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="privacy"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Private List
                  </FormLabel>
                  <FormDescription>
                    Only you and collaborators can see this list
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value === "private"}
                    onCheckedChange={(checked) =>
                      field.onChange(checked ? "private" : "public")
                    }
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Items</h2>
            <Button
              type="button"
              variant="outline"
              onClick={addItem}
              disabled={isSubmitting}
            >
              Add Item
            </Button>
          </div>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="items">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {items.map((item, index) => (
                    <Draggable
                      key={item.id}
                      draggableId={item.id}
                      index={index}
                    >
                      {(provided) => (
                        <DraggableListItem
                          item={item}
                          dragHandleProps={provided.dragHandleProps}
                          onUpdate={(updates: Partial<typeof item>) => updateItem(item.id, updates)}
                          onRemove={() => removeItem(item.id)}
                          disabled={isSubmitting}
                        />
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <div className="flex items-center justify-between pt-6">
          <div className="flex items-center gap-4">
            {mode === 'edit' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your
                      list and remove it from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {mode === 'create' ? 'Create List' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 