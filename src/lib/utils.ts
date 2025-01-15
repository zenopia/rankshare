import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { List } from "@/types/list";
import type { MongoListDocument } from "@/types/mongo";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isValidEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function serializeList(list: MongoListDocument): List {
  return {
    id: list._id.toString(),
    title: list.title,
    description: list.description || '',
    category: list.category,
    privacy: list.privacy,
    owner: {
      id: list.owner.userId.toString(),
      clerkId: list.owner.clerkId,
      username: list.owner.username,
      joinedAt: list.owner.joinedAt
    },
    items: list.items.map(item => ({
      id: crypto.randomUUID(),
      title: item.title,
      comment: item.comment,
      properties: item.properties?.map(prop => ({
        type: prop.type || 'text',
        label: prop.label,
        value: prop.value
      })) || [],
      rank: item.rank
    })),
    stats: {
      viewCount: list.stats?.viewCount || 0,
      pinCount: list.stats?.pinCount || 0,
      copyCount: list.stats?.copyCount || 0
    },
    collaborators: list.collaborators?.filter(collab => collab.userId).map(collab => ({
      id: collab.userId!.toString(),
      clerkId: collab.clerkId!,
      username: collab.username!,
      email: collab.email,
      role: collab.role,
      status: collab.status,
      invitedAt: collab.invitedAt,
      acceptedAt: collab.acceptedAt
    })) || [],
    lastEditedAt: list.lastEditedAt,
    createdAt: list.createdAt,
    updatedAt: list.updatedAt
  };
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function serializeLists(lists: MongoListDocument[]) {
  return lists.map(list => serializeList(list));
}

export function serializeUser(user: any) {
  if (!user) return null;

  return {
    id: user._id.toString(),
    username: user.username,
    displayName: user.displayName,
    bio: user.bio,
    location: user.location,
    dateOfBirth: user.dateOfBirth,
    gender: user.gender,
    livingStatus: user.livingStatus,
    privacySettings: user.privacySettings,
    followersCount: user.followersCount,
    followingCount: user.followingCount,
    listCount: user.listCount,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
} 