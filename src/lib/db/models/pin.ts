import mongoose, { Schema } from 'mongoose';
import type { PinDocument } from '@/types/pin';

const pinSchema = new Schema<PinDocument>({
  userId: { type: String, required: true },
  listId: { type: String, required: true },
  lastViewedAt: { type: Date, default: Date.now },
}, {
  timestamps: true
});

export const PinModel = mongoose.models.Pin || mongoose.model<PinDocument>('Pin', pinSchema); 