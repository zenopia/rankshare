import mongoose, { Schema, Document } from 'mongoose';
import connectToDatabase from '../mongodb';
import { LIST_CATEGORIES } from '@/types/list';

interface ListOwner {
  userId: mongoose.Types.ObjectId;
  clerkId: string;
}

export interface ListCollaborator {
  userId?: mongoose.Types.ObjectId;
  clerkId?: string;
  email?: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'pending' | 'accepted';
  invitedAt: Date;
  acceptedAt?: Date;
}

interface ListItem {
  title: string;
  comment?: string;
  rank: number;
  properties?: Array<{
    type: 'text' | 'link';
    label: string;
    value: string;
  }>;
}

export interface ListDocument extends Document {
  title: string;
  description?: string;
  category: string;
  privacy: 'public' | 'private';
  owner: ListOwner;
  collaborators: ListCollaborator[];
  items: ListItem[];
  stats: {
    viewCount: number;
    pinCount: number;
    copyCount: number;
  };
  createdAt: Date;
  updatedAt: Date;
  lastEditedAt?: Date;
}

const listSchema = new Schema<ListDocument>({
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, enum: LIST_CATEGORIES, required: true },
  privacy: { type: String, enum: ['public', 'private'], default: 'public' },
  owner: {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    clerkId: { type: String, required: true }
  },
  collaborators: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    clerkId: { type: String },
    email: { type: String },
    role: { type: String, enum: ['admin', 'editor', 'viewer'], required: true },
    status: { type: String, enum: ['pending', 'accepted'], required: true },
    invitedAt: { type: Date, required: true },
    acceptedAt: { type: Date }
  }],
  items: [{
    title: { type: String, required: true },
    comment: { type: String },
    rank: { type: Number, required: true },
    properties: [{
      type: { type: String, enum: ['text', 'link'], default: 'text' },
      label: { type: String, required: true },
      value: { type: String, required: true }
    }]
  }],
  stats: {
    viewCount: { type: Number, default: 0 },
    pinCount: { type: Number, default: 0 },
    copyCount: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Initialize model
let ListModel: mongoose.Model<ListDocument> | null = null;

export const getListModel = async () => {
  if (!ListModel) {
    const connection = await connectToDatabase();
    try {
      ListModel = connection.model<ListDocument>('List', listSchema);
    } catch (error) {
      ListModel = connection.model<ListDocument>('List');
    }
  }
  return ListModel;
}; 