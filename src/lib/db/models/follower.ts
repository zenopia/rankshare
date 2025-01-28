import mongoose from 'mongoose';

const followerSchema = new mongoose.Schema({
  followerId: {
    type: String,
    required: true,
    index: true
  },
  followingId: {
    type: String,
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create compound index for unique follows
followerSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

export interface FollowerDocument extends mongoose.Document {
  followerId: string;
  followingId: string;
  createdAt: Date;
  updatedAt: Date;
}

let FollowerModel: mongoose.Model<FollowerDocument>;

export function getFollowerModel(): mongoose.Model<FollowerDocument> {
  if (!FollowerModel) {
    try {
      FollowerModel = mongoose.model<FollowerDocument>('Follower');
    } catch {
      FollowerModel = mongoose.model<FollowerDocument>('Follower', followerSchema);
    }
  }
  return FollowerModel;
} 