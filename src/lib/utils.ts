import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ListDocument, List, ItemProperty } from "@/types/list";
import type { MongoListDocument } from "@/types/mongodb";
import type { User } from "@/types/user";
import type { FlattenMaps } from "mongoose";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isValidEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
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

export function serializeUser(user: FlattenMaps<Record<string, unknown>> | FlattenMaps<Record<string, unknown>>[] | null): Partial<User> | undefined {
  if (!user || Array.isArray(user)) return undefined;
  
  return {
    _id: (user._id as unknown)?.toString(),
    clerkId: user.clerkId as string,
    username: user.username as string,
    email: user.email as string,
    bio: user.bio as string | undefined,
    location: user.location as string | undefined,
    dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth as Date) : undefined,
    gender: user.gender as User['gender'],
    livingStatus: user.livingStatus as User['livingStatus'],
    isProfileComplete: user.isProfileComplete as boolean,
    privacySettings: user.privacySettings as User['privacySettings'],
    createdAt: new Date(user.createdAt as Date),
    updatedAt: new Date(user.updatedAt as Date)
  };
} 