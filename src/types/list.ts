export type ListCategory = 
  | 'movies' 
  | 'tv-shows' 
  | 'books' 
  | 'restaurants' 
  | 'recipes' 
  | 'things-to-do' 
  | 'other';

export const LIST_CATEGORIES: ListCategory[] = [
  'movies',
  'tv-shows',
  'books',
  'restaurants',
  'recipes',
  'things-to-do',
  'other'
];

export const PRIVACY_OPTIONS = [
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' }
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
  properties?: Array<{
    id: string;
    type?: 'text' | 'link';
    label: string;
    value: string;
  }>;
}

export interface ListOwner {
  id: string;
  clerkId: string;
  username: string;
  joinedAt: string;
}

export interface ListCollaborator {
  id: string;
  clerkId: string;
  username: string;
  email?: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'pending' | 'accepted' | 'rejected';
  invitedAt: string;
  acceptedAt?: string;
}

export interface ListStats {
  viewCount: number;
  pinCount: number;
  copyCount: number;
}

export interface List {
  id: string;
  title: string;
  description?: string;
  category: ListCategory;
  privacy: 'public' | 'private';
  owner: ListOwner;
  items?: ListItem[];
  stats: ListStats;
  collaborators?: ListCollaborator[];
  lastEditedAt?: string;
  createdAt: string;
  updatedAt: string;
  editedAt?: string;
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
