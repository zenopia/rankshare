import mongoose from 'mongoose';

const listSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxLength: 100,
  },
  category: {
    type: String,
    required: true,
    enum: ['movies', 'tv-shows', 'books', 'restaurants', 'recipes', 'things-to-do', 'other'],
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
  items: [{
    title: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
      required: false,
    }
  }]
}, {
  timestamps: true,
});

// Prevent model recompilation error in development
export const List = mongoose.models.List || mongoose.model('List', listSchema);