import { Document, Types, SortOrder } from 'mongoose';
import type { ListPrivacy, ListCategory, ListDocument } from '@/types/list';

export type MongoDoc<T> = T & Document & {
  _id: unknown;
  __v: number;
};

export interface MongoDocument extends Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  __v?: number;
}

export interface MongoListFilter {
  ownerId?: string;
  privacy?: ListPrivacy;
  category?: ListCategory;
  $text?: { $search: string };
  $or?: Array<{
    title?: { $regex: string; $options: string };
    description?: { $regex: string; $options: string };
    ownerName?: { $regex: string; $options: string };
    'items.title'?: { $regex: string; $options: string };
    'items.comment'?: { $regex: string; $options: string };
  }>;
  _id?: { $in: string[] };
}

export interface MongoListDocument extends Omit<ListDocument, '_id'> {
  _id: Types.ObjectId;
}

export type MongoSortOptions = {
  [key: string]: SortOrder | { $meta: "textScore" };
};