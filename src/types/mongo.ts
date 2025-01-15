import type { Types } from 'mongoose';
import type { ListCategory } from './list';

export interface MongoListDocument {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  category: ListCategory;
  privacy: 'public' | 'private';
  owner: {
    id: string;
    clerkId: string;
    username: string;
    joinedAt: Date;
  };
  items: Array<{
    id: string;
    title: string;
    comment?: string;
    rank: number;
    properties?: Array<{
      id: string;
      type?: 'text' | 'link';
      label: string;
      value: string;
    }>;
  }>;
  stats: {
    viewCount: number;
    pinCount: number;
    copyCount: number;
  };
  collaborators?: Array<{
    id: string;
    clerkId: string;
    username: string;
    email?: string;
    role: string;
    status: string;
    invitedAt: Date;
    acceptedAt?: Date;
  }>;
  lastEditedAt?: Date;
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