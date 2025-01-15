import mongoose, { Schema, Document } from 'mongoose';
import connectToDatabase from '../mongodb';
import { LIST_CATEGORIES } from '@/types/list';

interface ListOwner {
  userId: mongoose.Types.ObjectId;
  clerkId: string;
  username: string;
  joinedAt: Date;
}

export interface ListCollaborator {
  userId?: mongoose.Types.ObjectId;
  clerkId?: string;
  username?: string;
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
  title: { 
    type: String, 
    required: true,
    trim: true,
    minlength: [3, 'Title must be at least 3 characters long'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: { 
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: { 
    type: String, 
    required: true,
    enum: {
      values: ['movies', 'tv-shows', 'books', 'restaurants', 'recipes', 'things-to-do', 'other'],
      message: 'Invalid list category'
    }
  },
  privacy: { 
    type: String, 
    enum: ['public', 'private'], 
    default: 'private',
    required: true
  },
  owner: {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    clerkId: { type: String, required: true },
    username: { type: String, required: true },
    joinedAt: { type: Date, default: Date.now }
  },
  collaborators: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    clerkId: { type: String },
    username: { type: String },
    email: { type: String },
    role: { 
      type: String, 
      enum: ['admin', 'editor', 'viewer'], 
      required: true 
    },
    status: { 
      type: String, 
      enum: ['pending', 'accepted'], 
      required: true,
      default: 'pending'
    },
    invitedAt: { type: Date, default: Date.now },
    acceptedAt: { type: Date }
  }],
  items: [{
    title: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: [200, 'Item title cannot exceed 200 characters']
    },
    comment: { 
      type: String,
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    rank: { type: Number, required: true },
    properties: [{
      type: { 
        type: String, 
        enum: ['text', 'link'], 
        required: true 
      },
      label: { 
        type: String, 
        required: true,
        trim: true,
        maxlength: [50, 'Property label cannot exceed 50 characters']
      },
      value: { 
        type: String, 
        required: true,
        trim: true,
        maxlength: [500, 'Property value cannot exceed 500 characters']
      }
    }]
  }],
  stats: {
    viewCount: { type: Number, default: 0, min: 0 },
    pinCount: { type: Number, default: 0, min: 0 },
    copyCount: { type: Number, default: 0, min: 0 }
  },
  lastEditedAt: { type: Date }
}, {
  timestamps: true
});

// Create indexes for common queries
listSchema.index({ 'owner.userId': 1, privacy: 1 });
listSchema.index({ 'collaborators.userId': 1, 'collaborators.status': 1 });
listSchema.index({ category: 1, privacy: 1 });
listSchema.index({ title: 'text', description: 'text' });

// Update lastEditedAt on content changes
listSchema.pre(['updateOne', 'findOneAndUpdate'], function(next) {
  const update = this.getUpdate() as any;
  
  // Skip lastEditedAt update if this is just a stats update
  if (update.$inc && Object.keys(update.$inc).every(key => key.startsWith('stats.'))) {
    return next();
  }

  if (!update.$set) {
    update.$set = {};
  }
  
  update.$set.lastEditedAt = new Date();
  next();
});

// Validate items array is not empty
listSchema.path('items').validate(function(items: any[]) {
  return items.length > 0;
}, 'List must contain at least one item');

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