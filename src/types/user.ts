import { LucideIcon } from 'lucide-react';

export interface BaseUser {
  _id: string;
  clerkId: string;
  username: string;
  email: string;
  bio?: string;
  location?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  livingStatus?: 'single' | 'couple' | 'family' | 'shared' | 'other';
  isProfileComplete: boolean;
  privacySettings: {
    showBio: boolean;
    showLocation: boolean;
    showDateOfBirth: boolean;
    showGender: boolean;
    showLivingStatus: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface User extends BaseUser {
  // Additional fields that might be added by the application
  isFollowing?: boolean;
}

export interface ProfileSection {
  title: string;
  icon: LucideIcon;
  description: string;
} 