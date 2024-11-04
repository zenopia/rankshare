"use client";

import { useState, KeyboardEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { createListSchema, type CreateListSchema } from "@/lib/validations/list";
import { ListCategory, ListPrivacy, LIST_CATEGORIES, PRIVACY_OPTIONS } from "@/types/list";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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

export function ListForm({ initialData, mode = 'create' }: ListFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<{ id: string; title: string; comment?: string }[]>(
    initialData?.items || []
  );
  
  const form = useForm<CreateListSchema>({
    resolver: zodResolver(createListSchema),
    defaultValues: {
      title: initialData?.title || "",
      category: initialData?.category || "movies",
      description: initialData?.description || "",
      privacy: initialData?.privacy || "public",
    },
  });

  const onSubmit = async (data: CreateListSchema) => {
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

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data);
  });

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
      <form onSubmit={handleSubmit} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="My Top Movies..." {...field} />
              </FormControl>
              <FormMessage />
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
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {LIST_CATEGORIES.map(({ label, value }) => (
                      <SelectItem key={value} value={value}>
                        {label}
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select privacy setting" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PRIVACY_OPTIONS.map(({ label, value }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
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
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Add a description..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
        >
          {isSubmitting 
            ? (mode === 'edit' ? 'Updating...' : 'Creating...') 
            : (mode === 'edit' ? 'Update List' : 'Create List')}
        </Button>
      </form>
    </Form>
  );
} 