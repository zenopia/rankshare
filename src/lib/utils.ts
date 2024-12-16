import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ListDocument, List, ItemProperty } from "@/types/list";
import type { MongoListDocument } from "@/types/mongodb";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function serializeList(list: ListDocument): List {
  const plainList = JSON.parse(JSON.stringify(list));

  return {
    id: plainList._id.toString(),
    ownerId: plainList.ownerId,
    ownerName: plainList.ownerName,
    ownerImageUrl: plainList.ownerImageUrl,
    title: plainList.title,
    category: plainList.category,
    description: plainList.description,
    privacy: plainList.privacy,
    viewCount: plainList.viewCount,
    pinCount: plainList.totalPins,
    totalCopies: plainList.totalCopies,
    createdAt: new Date(plainList.createdAt),
    updatedAt: new Date(plainList.updatedAt),
    lastEditedAt: plainList.lastEditedAt ? new Date(plainList.lastEditedAt) : undefined,
    items: plainList.items.map((item: MongoListDocument['items'][0]) => ({
      id: item._id?.toString() || crypto.randomUUID(),
      title: item.title,
      comment: item.comment,
      properties: item.properties?.map((prop: ItemProperty) => ({
        id: prop.id,
        type: prop.type,
        label: prop.label,
        value: prop.value
      })) || [],
      rank: item.rank
    }))
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