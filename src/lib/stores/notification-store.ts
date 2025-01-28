import { create } from 'zustand';
import type { StateCreator } from 'zustand';
import type { NotificationType } from '@/types/mongo';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: {
    listId?: string;
    listTitle?: string;
    actorId?: string;
    actorName?: string;
    role?: string;
  };
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

interface NotificationActions {
  fetchNotifications: (options?: { unreadOnly?: boolean }) => Promise<void>;
  markAsRead: (notificationIds: string[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

type NotificationStore = NotificationState & NotificationActions;

const createNotificationStore: StateCreator<NotificationStore> = (set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async (options: { unreadOnly?: boolean } = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (options.unreadOnly) {
        params.set('unreadOnly', 'true');
      }

      const response = await fetch(`/api/notifications?${params}`);
      if (!response.ok) throw new Error('Failed to fetch notifications');

      const notifications = await response.json();
      set({
        notifications,
        unreadCount: notifications.filter((n: Notification) => !n.isRead).length
      });
    } catch (error) {
      set({ error: 'Failed to fetch notifications' });
      console.error('Error fetching notifications:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  markAsRead: async (notificationIds: string[]) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationIds }),
      });

      if (!response.ok) throw new Error('Failed to mark notifications as read');

      // Update local state
      const { notifications } = get();
      const updatedNotifications = notifications.map((notification: Notification) => 
        notificationIds.includes(notification.id)
          ? { ...notification, isRead: true, readAt: new Date().toISOString() }
          : notification
      );

      set({
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter((n: Notification) => !n.isRead).length
      });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  },

  markAllAsRead: async () => {
    const { notifications, markAsRead } = get();
    const unreadIds = notifications
      .filter((n: Notification) => !n.isRead)
      .map((n: Notification) => n.id);
    
    if (unreadIds.length > 0) {
      await markAsRead(unreadIds);
    }
  }
});

export const useNotificationStore = create<NotificationStore>(createNotificationStore); 