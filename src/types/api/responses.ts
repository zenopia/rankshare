import type { List } from '../list';

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
}

export interface UserResponse {
  id: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
}

export interface ListResponse {
  list: List;
  owner: UserResponse;
}

export interface SearchResponse<T> {
  results: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ErrorResponse {
  error: string;
  status: number;
  message?: string;
} 