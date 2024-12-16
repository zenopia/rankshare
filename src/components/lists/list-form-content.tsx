"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { ListCategory, ListPrivacy, LIST_CATEGORIES, ItemProperty } from "@/types/list";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

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
  initialData?: {
    id: string;
    title: string;
    category: ListCategory;
    description?: string;
    privacy: ListPrivacy;
    items: { id: string; title: string; comment?: string; properties?: ItemProperty[] }[];
  };
  mode?: 'create' | 'edit';
}

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.enum([
    "movies",
    "tv-shows",
    "books",
    "restaurants",
    "recipes",
    "things-to-do",
    "other"
  ] as const),
  description: z.string(),
  privacy: z.enum(["public", "private"] as const),
});

type FormData = z.infer<typeof formSchema>;

export function ListFormContent({ initialData, mode = 'create' }: ListFormProps) {
  const router = useRouter();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<{ 
    id: string; 
    title: string; 
    comment?: string;
    properties?: ItemProperty[];
  }[]>(() => {
    console.log('Initializing items with:', initialData?.items);
    return initialData?.items?.map(item => ({
      id: item.id || crypto.randomUUID(),
      title: item.title,
      comment: item.comment,
      properties: item.properties?.map(prop => ({
        id: prop.id,
        type: prop.type,
        label: prop.label,
        value: prop.value
      })) || []
    })) || [];
  });
  const [isMounted, setIsMounted] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      category: (initialData?.category || "movies") as ListCategory,
      description: initialData?.description || "",
      privacy: initialData?.privacy || "public",
    },
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    console.log('Items in form:', items);
  }, [items]);

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      
      if (!user) {
        toast.error('You must be logged in to create a list');
        return;
      }

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
        properties: item.properties?.length ? item.properties : undefined,
        rank: index + 1,
      }));

      const ownerName = user.fullName || 
                       `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
                       user.username || 
                       'Anonymous';

      const listData = {
        title: data.title.trim(),
        category: data.category,
        description: data.description.trim(),
        privacy: data.privacy,
        items: formattedItems,
        ownerId: user.id,
        ownerName: ownerName,
        ownerImageUrl: user.imageUrl,
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
    setItems([...items, { 
      id: crypto.randomUUID(), 
      title: "", 
      comment: "", 
      properties: [] 
    }]);
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

  const updateItem = (
    index: number, 
    field: 'title' | 'comment' | 'properties', 
    value: string | ItemProperty[] | undefined
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/lists/${initialData?.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete list');
      }

      toast.success('List deleted successfully');
      router.push('/my-lists');
      router.refresh();
    } catch (error) {
      toast.error('Failed to delete list');
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger className="h-14">
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
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base text-muted-foreground">Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter list title" className="h-14" />
              </FormControl>
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base text-muted-foreground">Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Add a description..." 
                  {...field} 
                  className="min-h-[100px] resize-none"
                />
              </FormControl>
              <div className="text-xs text-muted-foreground text-right">
                {field.value?.length || 0}/300
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="privacy"
          render={({ field }) => (
            <div className="flex items-center gap-4 py-4 px-6 rounded-lg bg-muted/50">
              <FormItem className="flex-1 space-y-0">
                <div className="space-y-1">
                  <FormLabel className="text-base">Private</FormLabel>
                  <FormDescription>
                    Only you can see this list
                  </FormDescription>
                </div>
              </FormItem>
              <FormControl>
                <Switch
                  checked={field.value === 'private'}
                  onCheckedChange={(checked: boolean) => 
                    field.onChange(checked ? 'private' : 'public')
                  }
                />
              </FormControl>
            </div>
          )}
        />

        <div className="space-y-4">
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
            className="w-full h-14"
            onClick={addItem}
          >
            Add Item
          </Button>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className={cn(
              "w-full h-14",
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

          {mode === 'edit' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  className="w-full h-14"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete List
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your list.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </form>
    </Form>
  );
} 