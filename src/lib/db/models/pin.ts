import { Schema, model, models } from 'mongoose';

interface Pin {
  userId: string;
  listId: string;
  lastViewedAt: Date;
}

const PinSchema = new Schema<Pin>({
  userId: { type: String, required: true },
  listId: { type: String, required: true },
  lastViewedAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

// Create compound index for unique pins per user-list combination
PinSchema.index({ userId: 1, listId: 1 }, { unique: true });

export const PinModel = models.Pin || model<Pin>('Pin', PinSchema); 