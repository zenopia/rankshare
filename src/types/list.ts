export type ListCategory = 'movies' | 'books' | 'music' | 'games' | 'other' | 'tv-shows' | 'restaurants';
export type ListPrivacy = 'public' | 'private';
export type ListPrivacyFilter = ListPrivacy | 'all';
export type ListSortOption = 'newest' | 'oldest' | 'most-viewed' | 'least-viewed';

export interface ListItem {
  id: string;
  title: string;
  description?: string;
  url?: string;
  comment?: string;
  rank: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface List {
  id: string;
  ownerId: string;
  ownerName: string;
  title: string;
  category: ListCategory;
  description: string;
  items: ListItem[];
  privacy: ListPrivacy;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  lastEditedAt?: Date;
}

export interface ListDocument extends Omit<List, 'id'> {
  _id: any;
  __v?: number;
}

// Helper constant for list categories
export const LIST_CATEGORIES: { label: string; value: ListCategory }[] = [
  { label: "Movies", value: "movies" },
  { label: "TV Shows", value: "tv-shows" },
  { label: "Books", value: "books" },
  { label: "Restaurants", value: "restaurants" },
  { label: "Music", value: "music" },
  { label: "Games", value: "games" },
  { label: "Other", value: "other" },
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
  createdAt?: Date;
}

export interface ListFilters {
  q?: string;
  category?: ListCategory;
  privacy?: ListPrivacyFilter;
  sort?: ListSortOption;
}
