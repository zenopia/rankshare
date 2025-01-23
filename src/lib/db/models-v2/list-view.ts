import mongoose, { Schema, Document } from 'mongoose';
import connectToDatabase from '../mongodb';

export interface ListViewDocument extends Document {
  clerkId: string;
  listId: mongoose.Types.ObjectId;
  lastViewedAt: Date;
  accessType: 'pin' | 'owner' | 'collaborator';
  createdAt: Date;
  updatedAt: Date;
}

const listViewSchema = new Schema<ListViewDocument>({
  clerkId: { type: String, required: true },
  listId: { type: Schema.Types.ObjectId, ref: 'List', required: true },
  lastViewedAt: { type: Date, default: Date.now },
  accessType: { type: String, enum: ['pin', 'owner', 'collaborator'], required: true }
}, {
  timestamps: true
});

// Create compound index for efficient querying and ensure one record per user-list combination
listViewSchema.index({ clerkId: 1, listId: 1 }, { unique: true });

// Initialize model
let ListViewModel: mongoose.Model<ListViewDocument> | null = null;

export const getListViewModel = async () => {
  if (!ListViewModel) {
    const connection = await connectToDatabase();
    try {
      ListViewModel = connection.model<ListViewDocument>('ListView', listViewSchema);
    } catch (error) {
      ListViewModel = connection.model<ListViewDocument>('ListView');
    }
  }
  return ListViewModel;
}; 