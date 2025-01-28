import { createNotification } from "@/lib/db/models-v2/notification";
import type { NotificationType } from "@/types/mongo";
import type { ListCollaborator } from "@/types/list";

interface NotificationData {
  listId?: string;
  listTitle?: string;
  actorId?: string;
  actorName?: string;
  role?: string;
}

export async function createCollaborationInviteNotification(
  userId: string,
  actorName: string,
  listTitle: string,
  listId: string,
  role: ListCollaborator['role']
) {
  return createNotification({
    userId,
    type: 'collaboration_invite',
    title: 'New Collaboration Invite',
    message: `${actorName} invited you to collaborate on "${listTitle}" as ${role}`,
    data: {
      listId,
      listTitle,
      actorName,
      role
    }
  });
}

export async function createCollaborationResponseNotification(
  userId: string,
  actorName: string,
  listTitle: string,
  listId: string,
  accepted: boolean
) {
  const type: NotificationType = accepted ? 'collaboration_accepted' : 'collaboration_rejected';
  const action = accepted ? 'accepted' : 'declined';
  
  return createNotification({
    userId,
    type,
    title: `Collaboration ${action}`,
    message: `${actorName} ${action} your invitation to collaborate on "${listTitle}"`,
    data: {
      listId,
      listTitle,
      actorName
    }
  });
}

export async function createListEditedNotification(
  userId: string,
  actorName: string,
  listTitle: string,
  listId: string
) {
  return createNotification({
    userId,
    type: 'list_edited',
    title: 'List Updated',
    message: `${actorName} made changes to "${listTitle}"`,
    data: {
      listId,
      listTitle,
      actorName
    }
  });
}

export async function createListDeletedNotification(
  userId: string,
  actorName: string,
  listTitle: string
) {
  return createNotification({
    userId,
    type: 'list_deleted',
    title: 'List Deleted',
    message: `${actorName} deleted "${listTitle}"`,
    data: {
      listTitle,
      actorName
    }
  });
}

export async function createListSharedNotification(
  userId: string,
  actorName: string,
  listTitle: string,
  listId: string
) {
  return createNotification({
    userId,
    type: 'list_shared',
    title: 'List Shared',
    message: `${actorName} shared "${listTitle}" with you`,
    data: {
      listId,
      listTitle,
      actorName
    }
  });
}

export async function createMentionNotification(
  userId: string,
  actorName: string,
  listTitle: string,
  listId: string
) {
  return createNotification({
    userId,
    type: 'mention',
    title: 'New Mention',
    message: `${actorName} mentioned you in "${listTitle}"`,
    data: {
      listId,
      listTitle,
      actorName
    }
  });
} 