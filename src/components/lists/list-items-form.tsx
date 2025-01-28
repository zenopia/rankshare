"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GripVertical, Trash2, Plus } from "lucide-react";
import { updateListItems } from "@/lib/actions/lists";
import type { List } from "@/types/list";

interface ListItem {
  id?: string;
  title: string;
  description: string | null;
  url: string | null;
  position: number;
}

interface ListItemsFormProps {
  list: List;
  onSuccess?: () => void;
}

export function ListItemsForm({ list, onSuccess }: ListItemsFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<ListItem[]>(
    list.items.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      url: item.url,
      position: item.position,
    }))
  );

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        title: "",
        description: null,
        url: null,
        position: prev.length,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof ListItem,
    value: string
  ) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value || null,
            }
          : item
      )
    );
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);

    // Update positions
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      position: index,
    }));

    setItems(updatedItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updatedList = await updateListItems(list.id, items);

      if (!updatedList) {
        throw new Error("Failed to update list items");
      }

      toast.success("List items updated successfully");
      onSuccess?.();
      router.refresh();
    } catch (error) {
      console.error("Error updating list items:", error);
      toast.error("Failed to update list items");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="items">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {items.map((item, index) => (
                  <Draggable
                    key={item.id || `new-${index}`}
                    draggableId={item.id || `new-${index}`}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="rounded-lg border bg-card p-4"
                      >
                        <div className="flex items-start gap-4">
                          <div
                            {...provided.dragHandleProps}
                            className="mt-3 cursor-move text-muted-foreground"
                          >
                            <GripVertical className="h-5 w-5" />
                          </div>

                          <div className="flex-1 space-y-4">
                            <Input
                              value={item.title}
                              onChange={(e) =>
                                handleItemChange(index, "title", e.target.value)
                              }
                              placeholder="Item title"
                              required
                              disabled={isLoading}
                            />

                            <Textarea
                              value={item.description || ""}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "description",
                                  e.target.value
                                )
                              }
                              placeholder="Item description (optional)"
                              disabled={isLoading}
                            />

                            <Input
                              value={item.url || ""}
                              onChange={(e) =>
                                handleItemChange(index, "url", e.target.value)
                              }
                              placeholder="Item URL (optional)"
                              type="url"
                              disabled={isLoading}
                            />
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(index)}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleAddItem}
            disabled={isLoading}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>

          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
} 