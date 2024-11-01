import { Document } from 'mongoose';

export interface MongoDoc extends Document {
  _id: string;
  [key: string]: any;
} 