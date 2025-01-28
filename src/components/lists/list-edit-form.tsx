"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateList, deleteList } from "@/lib/actions/lists";
import { LIST_CATEGORIES, PRIVACY_OPTIONS } from "@/types/list";
import type { List, ListCategory, ListPrivacy } from "@/types/list";

interface ListEditFormProps {
  list: List;
  onSuccess?: () => void;
}

export function ListEditForm({ list, onSuccess }: ListEditFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [description, setDescription] = useState(list.description || "");
  const [category, setCategory] = useState<ListCategory>(list.category);
  const [privacy, setPrivacy] = useState<ListPrivacy>(list.privacy);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updatedList = await updateList(list.id, {
        title,
        description: description || null,
        category,
        privacy,
      });

      if (!updatedList) {
        throw new Error("Failed to update list");
      }

      toast.success("List updated successfully");
      onSuccess?.();
      router.refresh();
    } catch (error) {
      console.error("Error updating list:", error);
      toast.error("Failed to update list");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this list?")) {
      return;
    }

    setIsDeleting(true);

    try {
      const success = await deleteList(list.id);
      if (!success) {
        throw new Error("Failed to delete list");
      }

      toast.success("List deleted successfully");
      router.push(`/@${list.owner.username}`);
      router.refresh();
    } catch (error) {
      console.error("Error deleting list:", error);
      toast.error("Failed to delete list");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            Title
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            minLength={1}
            maxLength={100}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            disabled={isLoading}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">
              Category
            </label>
            <Select
              value={category}
              onValueChange={(value: ListCategory) => setCategory(value)}
              disabled={isLoading}
            >
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LIST_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="privacy" className="text-sm font-medium">
              Privacy
            </label>
            <Select
              value={privacy}
              onValueChange={(value: ListPrivacy) => setPrivacy(value)}
              disabled={isLoading}
            >
              <SelectTrigger id="privacy">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIVACY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading || isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete List"}
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