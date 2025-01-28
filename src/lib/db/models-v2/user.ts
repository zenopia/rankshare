import mongoose, { Schema, Document } from 'mongoose';
import connectToDatabase from '../mongodb';
import { ListPrivacy } from '@/types/list';

export interface UserDocument extends Document {
  clerkId: string;
  username: string;
  email: string;
  displayName: string;
  searchIndex: string;
  bio?: string;
  location?: string;
  dateOfBirth?: Date;
  gender?: string;
  livingStatus?: string;
  privacySettings: {
    showDateOfBirth: boolean;
    showGender: boolean;
    showLivingStatus: boolean;
  };
  preferences: {
    notifications: {
      email: {
        collaborationInvites: boolean;
        collaborationUpdates: boolean;
        listActivity: boolean;
        mentions: boolean;
      };
      push: {
        collaborationInvites: boolean;
        collaborationUpdates: boolean;
        listActivity: boolean;
        mentions: boolean;
      };
    };
    privacy: {
      defaultListPrivacy: ListPrivacy;
      showProfileStats: boolean;
    };
    theme: 'light' | 'dark' | 'system';
  };
  followersCount: number;
  followingCount: number;
  listCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>({
  clerkId: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  displayName: { type: String, required: true },
  searchIndex: { type: String },
  bio: { type: String },
  location: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String },
  livingStatus: { type: String },
  privacySettings: {
    showDateOfBirth: { type: Boolean, default: false },
    showGender: { type: Boolean, default: true },
    showLivingStatus: { type: Boolean, default: true }
  },
  preferences: {
    notifications: {
      email: {
        collaborationInvites: { type: Boolean, default: true },
        collaborationUpdates: { type: Boolean, default: true },
        listActivity: { type: Boolean, default: true },
        mentions: { type: Boolean, default: true }
      },
      push: {
        collaborationInvites: { type: Boolean, default: true },
        collaborationUpdates: { type: Boolean, default: true },
        listActivity: { type: Boolean, default: true },
        mentions: { type: Boolean, default: true }
      }
    },
    privacy: {
      defaultListPrivacy: { type: String, enum: ['public', 'private', 'unlisted'], default: 'private' },
      showProfileStats: { type: Boolean, default: true }
    },
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' }
  },
  followersCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },
  listCount: { type: Number, default: 0 },
}, {
  timestamps: true,
});

// Create indexes
userSchema.index({ searchIndex: 'text' });
userSchema.index({ 
  username: 'text', 
  displayName: 'text' 
}, {
  weights: {
    username: 10,     // Higher priority
    displayName: 5    // Lower priority
  }
});

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