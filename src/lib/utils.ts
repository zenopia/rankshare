import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { List, ListDocument } from '@/types/list';
import type { MongoDocument } from '@/types/mongodb';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function serializeList(doc: ListDocument | (MongoDocument & Partial<List>)): List {
  const list = doc.toJSON ? doc.toJSON() : doc;
  return {
    ...list,
    id: doc._id.toString(),
    createdAt: new Date(doc.createdAt),
    updatedAt: new Date(doc.updatedAt),
    ownerId: doc.ownerId || '',
    ownerName: doc.ownerName || 'Unknown',
    title: doc.title || 'Untitled',
    category: doc.category || 'movies',
    description: doc.description,
    items: doc.items || [],
    privacy: doc.privacy || 'public',
    viewCount: doc.viewCount ?? 0,
  };
}

export function serializeLists(docs: (ListDocument | (MongoDocument & Partial<List>))[]): List[] {
  return docs.map(serializeList);
} 