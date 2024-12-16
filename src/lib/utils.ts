import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ListDocument, List } from "@/types/list";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function serializeList(list: ListDocument): List {
  console.log('Raw list items:', list.items);
  const serialized = {
    id: list._id.toString(),
    ...list,
    items: list.items.map(item => {
      console.log('Item properties before serialization:', item.properties);
      return {
        ...item,
        id: item._id?.toString(),
        _id: item._id?.toString(),
        properties: item.properties?.map(prop => {
          console.log('Processing property:', prop);
          return {
            id: prop.id,
            type: prop.type,
            label: prop.label,
            value: prop.value
          };
        }) || []
      };
    })
  };
  console.log('Serialized items:', serialized.items);
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