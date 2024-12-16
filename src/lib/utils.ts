import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ListDocument, List, ListCategory, MongoListItem } from "@/types/list";
import type { MongoListDocument } from "@/types/mongodb";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function serializeList(list: MongoListDocument | ListDocument): List {
  const serialized = {
    id: list._id.toString(),
    ownerId: list.ownerId,
    ownerName: list.ownerName,
    ownerImageUrl: list.ownerImageUrl,
    title: list.title ?? 'Untitled List',
    category: (list.category ?? 'other') as ListCategory,
    description: list.description ?? '',
    items: list.items.map((item: MongoListItem) => ({
      id: item._id?.toString() || crypto.randomUUID(),
      title: item.title,
      comment: item.comment,
      rank: item.rank,
    })),
    privacy: list.privacy,
    viewCount: list.viewCount,
    createdAt: new Date(list.createdAt),
    updatedAt: new Date(list.updatedAt),
    lastEditedAt: list.lastEditedAt ? new Date(list.lastEditedAt) : undefined,
  };
  
  return serialized;
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