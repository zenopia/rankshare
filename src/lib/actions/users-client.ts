export interface EnhancedUser {
  id: string;
  clerkId: string;
  username: string;
  displayName: string;
  imageUrl: string | null;
  bio?: string;
  isFollowing: boolean;
}

export async function followUser(followingId: string): Promise<void> {
  const response = await fetch(`/api/users/${followingId}/follow`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    throw new Error('Failed to follow user');
  }
}

export async function unfollowUser(followingId: string): Promise<void> {
  const response = await fetch(`/api/users/${followingId}/follow`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to unfollow user');
  }
} 