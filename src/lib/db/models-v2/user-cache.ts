import mongoose, { Schema, Document } from 'mongoose';
import connectToDatabase from '../mongodb';

export interface UserCacheDocument extends Document {
  clerkId: string;
  username: string;
  displayName: string;
  imageUrl: string | null;
  lastSynced: Date;
}

const userCacheSchema = new Schema<UserCacheDocument>({
  clerkId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  displayName: { type: String, required: true },
  imageUrl: { type: String },
  lastSynced: { type: Date, required: true },
}, {
  timestamps: true,
});

// Initialize model
let UserCacheModel: mongoose.Model<UserCacheDocument> | null = null;

export const getUserCacheModel = async () => {
  if (!UserCacheModel) {
    const connection = await connectToDatabase();
    try {
      UserCacheModel = connection.model<UserCacheDocument>('UserCache', userCacheSchema);
    } catch (error) {
      UserCacheModel = connection.model<UserCacheDocument>('UserCache');
    }
  }
  return UserCacheModel;
}; 