import { LucideIcon } from 'lucide-react';

export interface User {
  id: string;
  username: string;
  displayName: string;
  bio?: string;
  location?: string;
  dateOfBirth?: Date;
  gender?: string;
  livingStatus?: string;
  privacySettings?: {
    showBio: boolean;
    showLocation: boolean;
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

export interface ProfileSection {
  title: string;
  icon: LucideIcon;
  description: string;
} 