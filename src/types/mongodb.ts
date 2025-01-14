import { Document, Types, SortOrder } from 'mongoose';
import type { ListPrivacy, ListCategory, ListDocument } from '@/types/list';
import type { BaseUser } from "./user";

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

interface MongoListFilterCondition {
  title?: { $regex: string; $options: string };
  description?: { $regex: string; $options: string };
  ownerName?: { $regex: string; $options: string };
  'items.title'?: { $regex: string; $options: string };
  'items.comment'?: { $regex: string; $options: string };
  ownerId?: string | { $ne: string };
  'collaborators.userId'?: string;
  'collaborators.status'?: string;
  privacy?: ListPrivacy;
  category?: ListCategory;
}

export interface MongoListFilter {
  ownerId?: string | { $ne: string };
  privacy?: ListPrivacy;
  category?: ListCategory;
  $text?: { $search: string };
  $or?: MongoListFilterCondition[];
  $and?: (MongoListFilterCondition | { $or?: MongoListFilterCondition[] })[];
  _id?: { $in: string[] };
  'collaborators.userId'?: string;
  'collaborators.status'?: string;
}

export interface MongoListDocument extends Omit<ListDocument, '_id'> {
  _id: Types.ObjectId;
}

export type MongoSortOptions = {
  [key: string]: SortOrder | { $meta: "textScore" };
};

export interface FollowDocument {
  _id: unknown;
  followerId: string;
  followingId: string;
  __v: number;
}

export interface MongoUserDocument extends Omit<BaseUser, '_id'> {
  _id: unknown;
  __v: number;
}