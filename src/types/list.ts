export type ListCategory =
  | "movies"
  | "tv"
  | "books"
  | "games"
  | "music"
  | "food"
  | "places"
  | "products"
  | "other";

export type ListPrivacy = "public" | "private" | "unlisted";

export const LIST_CATEGORIES: ListCategory[] = [
  "movies",
  "tv",
  "books",
  "games",
  "music",
  "food",
  "places",
  "products",
  "other"
];

export const PRIVACY_OPTIONS = [
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
  { value: 'unlisted', label: 'Unlisted' }
] as const;

export const OWNER_FILTER_OPTIONS = [
  { value: 'all', label: 'All Lists' },
  { value: 'owned', label: 'My Lists' },
  { value: 'collaborated', label: 'Collaborated Lists' }
] as const;

export interface ListItem {
  id: string;
  title: string;
  comment?: string;
  rank: number;
  properties?: ListItemProperty[];
}

export interface ListItemProperty {
  id: string;
  type: "text" | "link";
  label: string;
  value: string;
}

export interface ListOwner {
  id: string;
  clerkId: string;
  username: string;
  joinedAt: string;
}

export interface ListCollaborator {
  clerkId: string;
  username: string;
  role: "owner" | "admin" | "editor" | "viewer";
  status: "pending" | "accepted" | "rejected";
}

export interface ListStats {
  viewCount: number;
  pinCount: number;
  copyCount: number;
}

export interface List {
  id: string;
  title: string;
  description: string | null;
  category: ListCategory;
  privacy: ListPrivacy;
  owner: {
    clerkId: string;
    username: string;
  };
  collaborators: ListCollaborator[];
  items: Array<{
    id: string;
    title: string;
    description: string | null;
    url: string | null;
    position: number;
  }>;
  stats: {
    itemCount: number;
    pinCount: number;
    viewCount: number;
  };
  pinnedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ItemDetails {
  title: string;
  comment?: string;
  properties?: Array<{
    id?: string;
    type?: 'text' | 'link';
    label: string;
    value: string;
  }>;
}

export interface EnhancedListOwner extends ListOwner {
  displayName: string;
  imageUrl: string | null;
}

export interface EnhancedList extends Omit<List, 'owner'> {
  owner: EnhancedListOwner;
}
