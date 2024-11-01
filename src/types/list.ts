export type ListCategory = 'movies' | 'tv-shows' | 'books' | 'restaurants';
export type ListPrivacy = 'public' | 'private';

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
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  hasUpdate?: boolean;
}

export interface CreateListInput {
  title: string;
  category: ListCategory;
  description?: string;
  items: Omit<ListItem, 'id' | 'rank'>[];
  privacy: ListPrivacy;
}
