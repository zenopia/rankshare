import mongoose, { Schema, Document } from 'mongoose';
import type { BaseUser } from '@/types/user';

export type UserDocument = Document & BaseUser;

const userSchema = new Schema<UserDocument>({
  clerkId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
  bio: { type: String },
  location: { type: String },
  dateOfBirth: { type: Date },
  gender: { 
    type: String, 
    enum: ['male', 'female', 'other', 'prefer-not-to-say'] 
  },
  livingStatus: { 
    type: String, 
    enum: ['single', 'couple', 'family', 'shared', 'other'] 
  },
  isProfileComplete: {
    type: Boolean,
    default: false,
  },
  privacySettings: {
    showBio: { type: Boolean, default: true },
    showLocation: { type: Boolean, default: true },
    showPersonalDetails: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

export const UserModel = mongoose.models.User || mongoose.model<UserDocument>('User', userSchema); 