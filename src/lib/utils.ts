import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ListDocument, List, ListCategory, ListPrivacy, ListItem } from "@/types/list";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Add MongoListItem type to handle MongoDB document structure
interface MongoListItem extends Omit<ListItem, 'id'> {
  _id?: { toString(): string };
}

export function serializeList(list: ListDocument): List {
  return {
    id: list._id.toString(),
    ownerId: list.ownerId,
    ownerName: list.ownerName,
    ownerImageUrl: list.ownerImageUrl,
    title: list.title ?? 'Untitled List',
    category: (list.category ?? 'other') as ListCategory,
    description: list.description ?? '',
    items: (list.items as MongoListItem[] ?? []).map(item => ({
      id: item._id?.toString() || crypto.randomUUID(),
      title: item.title,
      comment: item.comment,
      rank: item.rank,
    })),
    privacy: (list.privacy ?? 'public') as ListPrivacy,
    viewCount: list.viewCount ?? 0,
    createdAt: new Date(list.createdAt ?? Date.now()),
    updatedAt: new Date(list.updatedAt ?? Date.now()),
    lastEditedAt: list.lastEditedAt ? new Date(list.lastEditedAt) : undefined,
  };
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function serializeLists(docs: ListDocument[]): List[] {
  return docs.map(doc => serializeList(doc));
} 