import mongoose from "mongoose";

const pinnedListSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  listId: {
    type: String,
    required: true,
  },
  pinnedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Create a compound index for userId and listId to ensure uniqueness
pinnedListSchema.index({ userId: 1, listId: 1 }, { unique: true });

// Create an index for sorting by pinnedAt
pinnedListSchema.index({ pinnedAt: -1 });

export const PinnedListModel = mongoose.models.PinnedList || mongoose.model("PinnedList", pinnedListSchema);

export async function getPinnedListModel() {
  return PinnedListModel;
} 