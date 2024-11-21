import mongoose from 'mongoose';
import { LIST_CATEGORIES } from '@/types/list';

const listSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxLength: 100,
  },
  category: {
    type: String,
    required: true,
    enum: LIST_CATEGORIES.map(cat => cat.value),
  },
  description: {
    type: String,
    required: false,
  },
  privacy: {
    type: String,
    required: true,
    enum: ['public', 'private'],
  },
  userId: {
    type: String,
    required: true,
  },
  ownerName: {
    type: String,
    required: true,
  },
  items: [{
    title: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
      required: false,
    },
    rank: {
      type: Number,
      required: true,
    }
  }],
  viewCount: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
});

// Export as ListModel to match imports across the application
export const ListModel = mongoose.models.List || mongoose.model('List', listSchema);