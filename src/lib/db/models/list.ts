import mongoose, { Schema, model, models } from 'mongoose';
import type { List } from '@/types/list';

const ListItemSchema = new Schema({
  title: { type: String, required: true },
  rank: { type: Number, required: true },
  comment: { type: String },
}, {
  _id: false, // Disable auto _id for subdocuments
  id: false // Disable virtual id
});

const ListSchema = new Schema<List>({
  ownerId: { type: String, required: true },
  ownerName: { type: String, required: true },
  title: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['movies', 'tv-shows', 'books', 'restaurants'],
    required: true 
  },
  description: { type: String },
  items: [ListItemSchema],
  privacy: { 
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  viewCount: { type: Number, default: 0 },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Create indexes
ListSchema.index({ ownerId: 1 });
ListSchema.index({ category: 1 });
ListSchema.index({ privacy: 1 });
ListSchema.index({ title: 'text' });

export const ListModel = models.List || model<List>('List', ListSchema);