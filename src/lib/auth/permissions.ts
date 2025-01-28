import type { MongoListDocument, MongoListCollaborator } from "@/types/mongo";

// Helper function to check if user has access to the list
export async function hasListAccess(list: MongoListDocument, userId: string | null) {
  if (!userId) return list.privacy === 'public';
  
  return (
    list.privacy === 'public' ||
    list.privacy === 'unlisted' ||
    list.owner.clerkId === userId ||
    list.collaborators.some((c: MongoListCollaborator) => 
      c.clerkId === userId && c.status === 'accepted'
    )
  );
}

// Helper function to check if user can edit the list
export async function canEditList(list: MongoListDocument, userId: string | null) {
  if (!userId) return false;
  
  return (
    list.owner.clerkId === userId ||
    list.collaborators.some((c: MongoListCollaborator) => 
      c.clerkId === userId && 
      c.status === 'accepted' && 
      ['admin', 'editor'].includes(c.role)
    )
  );
} 