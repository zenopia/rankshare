import mongoose from "mongoose";

interface MongoPinnedListDocument {
  _id: mongoose.Types.ObjectId;
  userId: string;
  listId: mongoose.Types.ObjectId;
  pinnedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const pinnedListSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  listId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "List",
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

// Create compound index for userId and listId to ensure uniqueness
pinnedListSchema.index({ userId: 1, listId: 1 }, { unique: true });

// Create index for sorting by pinnedAt
pinnedListSchema.index({ pinnedAt: -1 });

// Create index for getting user's pinned lists
pinnedListSchema.index({ userId: 1, pinnedAt: -1 });

export const PinnedListModel = mongoose.models.PinnedList as mongoose.Model<MongoPinnedListDocument> || 
  mongoose.model<MongoPinnedListDocument>("PinnedList", pinnedListSchema);

export async function getPinnedListModel() {
  return PinnedListModel;
} 