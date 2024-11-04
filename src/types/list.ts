export type ListCategory = 'movies' | 'tv-shows' | 'books' | 'restaurants';
export type ListPrivacy = 'public' | 'private';
export type ListPrivacyFilter = 'all' | 'public' | 'private';
export type ListSortOption = 'newest' | 'oldest' | 'most-viewed';

export interface ListItem {
  title: string;
  rank: number;
  comment?: string;
}

export interface List {
  id: string;
  ownerId: string;
  ownerName: string;
  title: string;
  category: ListCategory;
  description?: string;
  items: ListItem[];
  privacy: ListPrivacy;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListDocument extends Omit<List, 'id'> {
  _id: string;
  toJSON(): List;
}

// Helper constant for list categories
export const LIST_CATEGORIES: { label: string; value: ListCategory }[] = [
  { label: "Movies", value: "movies" },
  { label: "TV Shows", value: "tv-shows" },
  { label: "Books", value: "books" },
  { label: "Restaurants", value: "restaurants" },
];

// Helper constant for privacy options
export const PRIVACY_OPTIONS: { label: string; value: ListPrivacy }[] = [
  { label: "Public", value: "public" },
  { label: "Private", value: "private" },
];

// Define the User type if it doesn't exist
export interface User {
  clerkId: string;
  username: string;
  email: string;
  createdAt?: Date; // Optional if not always provided
}

export interface ListFilters {
  q?: string;
  category?: ListCategory;
  privacy?: ListPrivacyFilter;
  sort?: ListSortOption;
}
