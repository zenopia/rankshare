import mongoose, { Schema } from 'mongoose';
import type { User } from '@/types/user';

const userSchema = new Schema<User>({
  clerkId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
}, {
  timestamps: true
});

export const UserModel = mongoose.models.User || mongoose.model<User>('User', userSchema); 