import type { Types } from 'mongoose';
import type { ListCategory } from './list';

export interface MongoListDocument {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  category: ListCategory;
  privacy: 'public' | 'private';
  owner: {
    userId: Types.ObjectId;
    clerkId: string;
    username: string;
    joinedAt: Date;
  };
  collaborators: Array<{
    userId: Types.ObjectId;
    clerkId: string;
    username: string;
    displayName: string;
    imageUrl?: string;
    role: 'viewer' | 'editor' | 'admin';
    status: 'pending' | 'accepted' | 'rejected';
    invitedAt: Date;
    acceptedAt?: Date;
  }>;
  items: Array<{
    title: string;
    rank: number;
    comment?: string;
    properties?: Array<{
      type?: string;
      label: string;
      value: string;
    }>;
  }>;
  stats: {
    viewCount: number;
    pinCount: number;
    copyCount: number;
  };
  lastEditedAt?: Date;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MongoUserDocument {
  _id: Types.ObjectId;
  clerkId: string;
  username: string;
  displayName: string;
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
  followersCount: number;
  followingCount: number;
  listCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MongoFollowDocument {
  _id: Types.ObjectId;
  followerId: string;
  followingId: string;
  status: 'pending' | 'accepted';
  createdAt: Date;
  updatedAt: Date;
}

export interface MongoPinDocument {
  _id: Types.ObjectId;
  userId: string;
  listId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
} 