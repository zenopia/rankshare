export interface Follow {
  followerId: string;
  followingId: string;
  status: 'accepted' | 'pending' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
} 