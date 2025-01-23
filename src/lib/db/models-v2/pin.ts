import mongoose, { Schema, Document } from 'mongoose';
import connectToDatabase from '../mongodb';
import { getListModel } from './list';

export interface PinDocument extends Document {
  clerkId: string;
  listId: mongoose.Types.ObjectId;
  listInfo: {
    title: string;
    category: string;
    ownerUsername: string;
  };
  lastViewedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const pinSchema = new Schema<PinDocument>({
  clerkId: { type: String, required: true },
  listId: { type: Schema.Types.ObjectId, ref: 'List', required: true },
  listInfo: {
    title: { type: String, required: true },
    category: { type: String, required: true },
    ownerUsername: { type: String, required: true }
  },
  lastViewedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Create compound indexes for efficient querying
pinSchema.index({ clerkId: 1, createdAt: -1 }); // For user's pins feed
pinSchema.index({ listId: 1 }); // For list's pin count
pinSchema.index({ clerkId: 1, listId: 1 }, { unique: true }); // Prevent duplicate pins

// Add hooks to update list pin count
pinSchema.pre('save', async function(next) {
  if (this.isNew) {
    const ListModel = await getListModel();
    if (ListModel) {
      await ListModel.updateOne(
        { _id: this.listId },
        { $inc: { 'stats.pinCount': 1 } }
      );
    }
  }
  next();
});

pinSchema.pre('deleteOne', { document: true }, async function(next) {
  const ListModel = await getListModel();
  if (ListModel) {
    await ListModel.updateOne(
      { _id: this.listId },
      { $inc: { 'stats.pinCount': -1 } }
    );
  }
  next();
});

// Initialize model
let PinModel: mongoose.Model<PinDocument> | null = null;

export const getPinModel = async () => {
  if (!PinModel) {
    const connection = await connectToDatabase();
    try {
      PinModel = connection.model<PinDocument>('Pin', pinSchema);
    } catch (error) {
      PinModel = connection.model<PinDocument>('Pin');
    }
  }
  return PinModel;
}; 