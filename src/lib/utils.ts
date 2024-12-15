import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ListDocument, List, ListCategory, ListPrivacy, ListItem } from "@/types/list";
import type { MongoDocument } from "@/types/mongodb";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Add MongoListItem type to handle MongoDB document structure
interface MongoListItem extends Omit<ListItem, 'id'> {
  _id?: { toString(): string };
}

export function serializeList(doc: ListDocument | (MongoDocument & Partial<List>)): List {
  return {
    id: doc._id.toString(),
    ownerId: doc.ownerId ?? '',
    ownerName: doc.ownerName ?? 'Anonymous',
    ownerImageUrl: doc.ownerImageUrl,
    title: doc.title ?? 'Untitled List',
    category: (doc.category ?? 'other') as ListCategory,
    description: doc.description ?? '',
    items: (doc.items as MongoListItem[] ?? []).map(item => ({
      id: item._id?.toString() || crypto.randomUUID(),
      title: item.title,
      comment: item.comment,
      rank: item.rank,
    })),
    privacy: (doc.privacy ?? 'public') as ListPrivacy,
    viewCount: doc.viewCount ?? 0,
    createdAt: new Date(doc.createdAt ?? Date.now()),
    updatedAt: new Date(doc.updatedAt ?? Date.now()),
    lastEditedAt: doc.lastEditedAt ? new Date(doc.lastEditedAt) : undefined,
  };
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function serializeLists(docs: (ListDocument | (MongoDocument & Partial<List>))[]): List[] {
  return docs.map(serializeList);
} 