import mongoose, { Schema } from 'mongoose';
import type { ListDocument } from '@/types/list';

const listSchema = new Schema<ListDocument>({
  ownerId: { type: String, required: true },
  ownerName: { type: String, required: true },
  title: { type: String, required: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['movies', 'tv-shows', 'books', 'restaurants', 'recipes', 'things-to-do', 'other'],
    default: 'movies'
  },
  description: { type: String, default: '' },
  items: [{
    title: String,
    description: String,
    url: String,
    comment: String,
    rank: Number,
    createdAt: Date,
    updatedAt: Date
  }],
  privacy: { 
    type: String, 
    required: true, 
    enum: ['public', 'private'],
    default: 'public'
  },
  viewCount: { type: Number, default: 0 },
  lastEditedAt: { type: Date },
}, {
  timestamps: true
});

export const ListModel = mongoose.models.List || mongoose.model<ListDocument>('List', listSchema);