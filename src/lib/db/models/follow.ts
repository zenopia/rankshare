import { Schema, model, models } from 'mongoose';

export interface IFollow {
  _id: string;
  followerId: string;
  followingId: string;
  lastCheckedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const followSchema = new Schema({
  followerId: { type: String, required: true },
  followingId: { type: String, required: true },
  lastCheckedAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

// Create compound index for unique follows and efficient queries
followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });
followSchema.index({ followerId: 1 });
followSchema.index({ followingId: 1 });

export const FollowModel = models.Follow || model('Follow', followSchema); 