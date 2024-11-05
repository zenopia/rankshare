import mongoose, { Schema } from 'mongoose';

const followSchema = new Schema({
  followerId: { type: String, required: true },
  followingId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
}, {
  timestamps: true
});

// Create a compound index to ensure unique follows
followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

export const FollowModel = mongoose.models.Follow || mongoose.model('Follow', followSchema); 