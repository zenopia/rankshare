import { Schema, model, models, Document } from 'mongoose';

export interface IPin extends Document {
  userId: string;
  listId: string;
  lastViewedAt: Date;
}

const pinSchema = new Schema<IPin>({
  userId: { type: String, required: true },
  listId: { type: String, required: true },
  lastViewedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Create compound index for unique pins
pinSchema.index({ userId: 1, listId: 1 }, { unique: true });

export const PinModel = models.Pin || model<IPin>('Pin', pinSchema); 