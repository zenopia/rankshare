import type { Types } from 'mongoose';

export interface Pin {
  id: string;
  userId: string;
  listId: string;
  lastViewedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PinDocument extends Omit<Pin, 'id'> {
  _id: Types.ObjectId;
  __v?: number;
} 