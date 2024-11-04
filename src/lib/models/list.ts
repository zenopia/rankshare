import mongoose, { Schema } from 'mongoose';
import type { ListDocument } from '@/types/list';

const listSchema = new Schema<ListDocument>({
  ownerId: { type: String, required: true },
  ownerName: { type: String, required: true },
  title: { type: String, required: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['movies', 'books', 'music', 'games', 'other', 'tv-shows', 'restaurants'],
    default: 'movies'
  },
  description: { type: String, default: '' },
  items: [Schema.Types.Mixed],
  privacy: { 
    type: String, 
    required: true, 
    enum: ['public', 'private'],
    default: 'public'
  },
  viewCount: { type: Number, default: 0 },
}, {
  timestamps: true
});

export const ListModel = mongoose.models.List || mongoose.model<ListDocument>('List', listSchema); 