import { Document } from 'mongoose';
import type { ListDocument } from './list';

export interface MongoDoc extends Document {
  _id: string;
  [key: string]: any;
}

export interface MongoDocument extends Document {
  _id: any;
  createdAt: Date;
  updatedAt: Date;
  __v?: number;
}

export type MongoListDocument = MongoDocument & Partial<ListDocument>;