import type { Types } from 'mongoose';

export type ListCategory = 
  | 'movies' 
  | 'tv-shows' 
  | 'books' 
  | 'restaurants' 
  | 'recipes' 
  | 'things-to-do' 
  | 'other';
export type ListPrivacy = 'public' | 'private';
export type ListPrivacyFilter = ListPrivacy | 'all';
export type ListSortOption = 'newest' | 'oldest' | 'most-viewed' | 'least-viewed';

export interface ListItem {
  id?: string;
  title: string;
  description?: string;
  url?: string;
  comment?: string;
  rank: number;
  createdAt?: Date;
  updatedAt?: Date;
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
  createdAt: Date;
  updatedAt: Date;
  lastEditedAt?: Date;
  pinCount?: number;
  copyCount?: number;
  originalListId?: string;
  totalPins?: number;
  totalCopies?: number;
}

export interface ListDocument extends Omit<List, 'id'> {
  _id: Types.ObjectId;
  __v?: number;
  originalListId?: string;
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
export const PRIVACY_OPTIONS: { label: string; value: ListPrivacy | 'all' }[] = [
  { label: "Public", value: "public" },
  { label: "Private", value: "private" },
  { label: "All", value: "all" },
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
  email: string;
  createdAt?: Date;
}

export interface ListFilters {
  q?: string;
  category?: ListCategory;
  privacy?: ListPrivacyFilter;
  sort?: ListSortOption;
}
