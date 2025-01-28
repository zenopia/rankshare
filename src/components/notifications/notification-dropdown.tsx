"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Bell } from "lucide-react";
import { useNotificationStore } from "@/lib/stores/notification-store";
import { formatDate } from "@/lib/utils/date";

export function NotificationDropdown() {
  const { 
    notifications, 
    unreadCount, 
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every minute
    const interval = setInterval(() => {
      fetchNotifications();
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleNotificationClick = async (notificationId: string, listId?: string) => {
    await markAsRead([notificationId]);
    // If there's a listId, the user will be redirected to the list page by the Link component
  };

  const getNotificationContent = (notification: {
    type: string;
    data?: {
      listTitle?: string;
      actorName?: string;
      role?: string;
    };
  }) => {
    switch (notification.type) {
      case 'collaboration_invite':
        return `${notification.data?.actorName} invited you to collaborate on "${notification.data?.listTitle}" as ${notification.data?.role}`;
      case 'collaboration_accepted':
        return `${notification.data?.actorName} accepted your invitation to collaborate on "${notification.data?.listTitle}"`;
      case 'collaboration_rejected':
        return `${notification.data?.actorName} declined your invitation to collaborate on "${notification.data?.listTitle}"`;
      case 'list_edited':
        return `${notification.data?.actorName} made changes to "${notification.data?.listTitle}"`;
      case 'list_deleted':
        return `${notification.data?.actorName} deleted "${notification.data?.listTitle}"`;
      case 'list_shared':
        return `${notification.data?.actorName} shared "${notification.data?.listTitle}" with you`;
      case 'mention':
        return `${notification.data?.actorName} mentioned you in "${notification.data?.listTitle}"`;
      default:
        return 'New notification';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-4 py-2">
          <h2 className="text-sm font-medium">Notifications</h2>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead()}
              className="text-xs"
            >
              Mark all as read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex items-center justify-center py-4">
              <span className="text-sm text-muted-foreground">No notifications</span>
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex flex-col items-start gap-1 px-4 py-2 ${
                  !notification.isRead ? 'bg-muted/50' : ''
                }`}
              >
                {notification.data?.listId ? (
                  <Link
                    href={`/lists/${notification.data.listId}`}
                    onClick={() => handleNotificationClick(notification.id, notification.data?.listId)}
                    className="w-full"
                  >
                    <div className="text-sm">{getNotificationContent(notification)}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(notification.createdAt)}
                    </div>
                  </Link>
                ) : (
                  <div
                    onClick={() => handleNotificationClick(notification.id)}
                    className="w-full cursor-pointer"
                  >
                    <div className="text-sm">{getNotificationContent(notification)}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(notification.createdAt)}
                    </div>
                  </div>
                )}
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 