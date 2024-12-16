import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ListDocument, List } from "@/types/list";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function serializeList(list: ListDocument): List {
  return {
    id: list._id.toString(),
    ...list,
    items: list.items.map(item => ({
      ...item,
      id: item._id?.toString(),
      _id: item._id?.toString(),
      properties: item.properties?.map(prop => ({
        id: prop.id,
        type: prop.type,
        label: prop.label,
        value: prop.value
      })) || []
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