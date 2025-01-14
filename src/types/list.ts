import type { Types } from 'mongoose';

export type ListCategory = 
  | "movies"
  | "tv-shows"
  | "books"
  | "restaurants"
  | "recipes"
  | "things-to-do"
  | "other";

export type ListPrivacy = "public" | "private";
export type ListPrivacyFilter = ListPrivacy | "shared" | "all";
export type ListSortOption = "newest" | "oldest" | "most-viewed" | "least-viewed";
export type CollaboratorRole = "owner" | "admin" | "editor" | "viewer";
export type OwnerFilter = "all" | "mine" | "others";

export interface ItemProperty {
  id: string;
  type: 'text' | 'link';
  label: string;
  value: string;
}

export interface ItemDetails {
  title: string;
  comment?: string;
  properties?: ItemProperty[];
}

export interface ListItem {
  _id?: string | Types.ObjectId;
  id?: string;
  title: string;
  comment?: string;
  properties?: ItemProperty[];
  rank: number;
}

export interface ListCollaborator {
  _id: string;  // MongoDB ID
  userId?: string;  // Optional for email-only invites
  email?: string;   // Optional if user exists
  imageUrl?: string; // User's avatar URL
  role: CollaboratorRole;
  status: "pending" | "accepted";
  invitedAt: Date;
  acceptedAt?: Date;
}

export interface List {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerImageUrl?: string;
  title: string;
  category: ListCategory;
  description?: string;
  items: ListItem[];
  privacy: ListPrivacy;
  viewCount: number;
  pinCount?: number;
  totalCopies?: number;
  hasUpdate?: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastEditedAt?: Date;
  collaborators?: ListCollaborator[];
}

// Separate MongoDB item type to handle _id
export interface MongoListItem extends Omit<ListItem, 'id' | 'items' | 'pinCount' | 'totalCopies' | 'hasUpdate'> {
  _id: Types.ObjectId;
  items?: MongoListItem[];
  totalPins?: number;
  totalCopies?: number;
  __v?: number;
}

export interface ListDocument extends Omit<List, 'id' | 'items' | 'pinCount' | 'totalCopies' | 'hasUpdate'> {
  _id: Types.ObjectId;
  items: MongoListItem[];
  totalPins: number;
  totalCopies: number;
  __v?: number;
}

// Helper constant for list categories
export const LIST_CATEGORIES: { label: string; value: ListCategory }[] = [
  { label: "Movies", value: "movies" },
  { label: "TV Shows", value: "tv-shows" },
  { label: "Books", value: "books" },
  { label: "Restaurants", value: "restaurants" },
  { label: "Recipes", value: "recipes" },
  { label: "Things to do", value: "things-to-do" },
  { label: "Other", value: "other" },
];

// Helper constant for privacy options (including 'all' for filtering)
export const PRIVACY_OPTIONS: { label: string; value: ListPrivacyFilter }[] = [
  { label: "All Lists", value: "all" },
  { label: "Public", value: "public" },
  { label: "Private", value: "private" },
];

// New constant for create/edit form privacy options
export const LIST_PRIVACY_OPTIONS: { label: string; value: ListPrivacy }[] = [
  { label: "Public", value: "public" },
  { label: "Private", value: "private" },
];

// Define the User type if it doesn't exist
export interface User {
  clerkId: string;
  username: string;
  firstName: string | null;
  imageUrl: string | null;
  hasNewLists: boolean;
  lastListCreated?: Date;
  listCount: number;
  isFollowing?: boolean;
}

export interface ListFilters {
  q?: string;
  category?: ListCategory;
  privacy?: ListPrivacyFilter;
  sort?: ListSortOption;
}

// Helper constant for collaborator roles
export const COLLABORATOR_ROLES: { label: string; value: CollaboratorRole }[] = [
  { label: "Owner", value: "owner" },
  { label: "Admin", value: "admin" },
  { label: "Editor", value: "editor" },
  { label: "Viewer", value: "viewer" },
];

// Helper constant for owner filter options on collab page
export const OWNER_FILTER_OPTIONS: { label: string; value: OwnerFilter }[] = [
  { label: "All Lists", value: "all" },
  { label: "My Lists", value: "mine" },
  { label: "Others' Lists", value: "others" },
];
