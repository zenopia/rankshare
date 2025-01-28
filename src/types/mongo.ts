import { Types } from 'mongoose';
import type { ListCategory, ListPrivacy } from './list';

export interface MongoListItemProperty {
  _id: Types.ObjectId;
  type: "text" | "link";
  label: string;
  value: string;
}

export interface MongoListItem {
  _id: Types.ObjectId;
  title: string;
  comment: string | null;
  rank: number;
  properties: MongoListItemProperty[];
}

export interface MongoListOwner {
  userId: Types.ObjectId;
  clerkId: string;
  username: string;
  joinedAt: Date;
}

export interface MongoListCollaborator {
  clerkId: string;
  username: string;
  role: "owner" | "admin" | "editor" | "viewer";
  status: "pending" | "accepted" | "rejected";
  invitedAt: Date;
  acceptedAt?: Date;
}

export interface MongoListStats {
  viewCount: number;
  pinCount: number;
  itemCount: number;
}

export interface MongoListDocument {
  _id: Types.ObjectId;
  title: string;
  description: string | null;
  category: ListCategory;
  privacy: ListPrivacy;
  owner: MongoListOwner;
  items: MongoListItem[];
  stats: MongoListStats;
  collaborators: MongoListCollaborator[];
  pinnedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  isDeleted?: boolean;
}

export interface MongoUserDocument {
  _id: Types.ObjectId;
  clerkId: string;
  username: string;
  email: string;
  profile: {
    displayName?: string;
    bio?: string;
    location?: string;
    dateOfBirth?: Date;
    gender?: string;
    livingStatus?: string;
    privacySettings?: {
      profileVisibility: "public" | "private";
      listVisibility: "public" | "private";
      showLocation: boolean;
      showAge: boolean;
    };
  };
  preferences: MongoUserPreferences;
  stats: {
    followersCount: number;
    followingCount: number;
    listCount: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface MongoUserProfileDocument {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  bio?: string;
  location?: string;
  website?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MongoFollowDocument {
  _id: Types.ObjectId;
  followerId: string;
  followingId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface MongoUserCacheDocument {
  _id: Types.ObjectId;
  clerkId: string;
  username: string;
  displayName: string;
  imageUrl: string | null;
  lastSynced: Date;
}

export type NotificationType = 
  | 'collaboration_invite'
  | 'collaboration_accepted'
  | 'collaboration_rejected'
  | 'list_edited'
  | 'list_deleted'
  | 'list_shared'
  | 'mention';

export interface MongoNotificationDocument {
  _id: Types.ObjectId;
  userId: string;  // Clerk ID of the user receiving the notification
  type: NotificationType;
  title: string;
  message: string;
  data: {
    listId?: string;
    listTitle?: string;
    actorId?: string;    // Clerk ID of the user who triggered the notification
    actorName?: string;
    role?: string;
  };
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
}

export interface MongoUserPreferences {
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
} 