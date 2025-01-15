import mongoose, { Schema, Document } from 'mongoose';
import connectToDatabase from '../mongodb';
import { getUserModel } from './user';

export interface FollowDocument extends Document {
  followerId: string;
  followingId: string;
  status: 'pending' | 'accepted';
  followerInfo: {
    username: string;
    displayName: string;
  };
  followingInfo: {
    username: string;
    displayName: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const followSchema = new Schema<FollowDocument>({
  followerId: { type: String, required: true },
  followingId: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted'], default: 'accepted' },
  followerInfo: {
    username: { type: String, required: true },
    displayName: { type: String, required: true }
  },
  followingInfo: {
    username: { type: String, required: true },
    displayName: { type: String, required: true }
  }
}, {
  timestamps: true
});

// Create compound indexes for efficient querying
followSchema.index({ followerId: 1, status: 1 });
followSchema.index({ followingId: 1, status: 1 });
followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

// Add hooks to update user follower/following counts
followSchema.pre('save', async function(next) {
  if (this.isNew && this.status === 'accepted') {
    const UserModel = await getUserModel();
    if (UserModel) {
      await Promise.all([
        UserModel.updateOne(
          { clerkId: this.followerId },
          { $inc: { followingCount: 1 } }
        ),
        UserModel.updateOne(
          { clerkId: this.followingId },
          { $inc: { followersCount: 1 } }
        )
      ]);
    }
  }
  next();
});

followSchema.pre('deleteOne', { document: true }, async function(next) {
  if (this.status === 'accepted') {
    const UserModel = await getUserModel();
    if (UserModel) {
      await Promise.all([
        UserModel.updateOne(
          { clerkId: this.followerId },
          { $inc: { followingCount: -1 } }
        ),
        UserModel.updateOne(
          { clerkId: this.followingId },
          { $inc: { followersCount: -1 } }
        )
      ]);
    }
  }
  next();
});

// Initialize model
let FollowModel: mongoose.Model<FollowDocument> | null = null;

export const getFollowModel = async () => {
  if (!FollowModel) {
    const connection = await connectToDatabase();
    try {
      FollowModel = connection.model<FollowDocument>('Follow', followSchema);
    } catch (error) {
      FollowModel = connection.model<FollowDocument>('Follow');
    }
  }
  return FollowModel;
}; 