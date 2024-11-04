import { Document } from 'mongoose';

export interface Pin {
  userId: string;
  listId: string;
  lastViewedAt: Date;
}

export interface PinDocument extends Pin, Document {
  _id: any;
  __v?: number;
} 