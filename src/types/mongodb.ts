import { Document, Types, SortOrder } from 'mongoose';
import type { List, ListPrivacy, ListCategory } from './list';

export interface MongoDoc extends Document {
  _id: string;
  [key: string]: unknown;
}

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

export interface MongoListDocument extends Omit<List, 'id'> {
  _id: Types.ObjectId;
  __v?: number;
}

export type MongoSortOptions = {
  [key: string]: SortOrder | { $meta: "textScore" };
};