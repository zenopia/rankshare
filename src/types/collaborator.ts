export interface Collaborator {
  listId: string;
  clerkId: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  status: 'accepted' | 'pending' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
} 