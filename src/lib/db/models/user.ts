import { Schema, model, models } from 'mongoose';
import type { User } from '@/types/list';

const UserSchema = new Schema<User>({
  clerkId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Create indexes
UserSchema.index({ clerkId: 1 });
UserSchema.index({ email: 1 });

export const UserModel = models.User || model<User>('User', UserSchema); 