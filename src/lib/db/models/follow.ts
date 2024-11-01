import { Schema, model, models } from 'mongoose';

interface Follow {
  followerId: string;
  followingId: string;
  lastCheckedAt: Date;
}

const FollowSchema = new Schema<Follow>({
  followerId: { type: String, required: true },
  followingId: { type: String, required: true },
  lastCheckedAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

// Create compound index for unique follows and efficient queries
FollowSchema.index({ followerId: 1, followingId: 1 }, { unique: true });
FollowSchema.index({ followerId: 1 });
FollowSchema.index({ followingId: 1 });

export const FollowModel = models.Follow || model<Follow>('Follow', FollowSchema); 