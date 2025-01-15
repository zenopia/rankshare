import mongoose, { Schema, Document } from 'mongoose';
import connectToDatabase from '../mongodb';

export interface UserDocument extends Document {
  clerkId: string;
  username: string;
  displayName: string;
  searchIndex: string;
  followersCount: number;
  followingCount: number;
  listCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>({
  clerkId: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  searchIndex: { type: String },
  followersCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },
  listCount: { type: Number, default: 0 },
}, {
  timestamps: true,
});

// Create indexes
userSchema.index({ searchIndex: 'text' });

// Create searchIndex before saving
userSchema.pre('save', function(next) {
  if (this.isModified('username') || this.isModified('displayName')) {
    this.searchIndex = `${this.username} ${this.displayName}`.toLowerCase();
  }
  next();
});

// Initialize model
let UserModel: mongoose.Model<UserDocument> | null = null;

export const getUserModel = async () => {
  if (!UserModel) {
    const connection = await connectToDatabase();
    try {
      UserModel = connection.model<UserDocument>('User', userSchema);
    } catch (error) {
      UserModel = connection.model<UserDocument>('User');
    }
  }
  return UserModel;
}; 