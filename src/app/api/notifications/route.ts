import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { 
  getUserNotifications, 
  markNotificationsAsRead 
} from "@/lib/db/models-v2/notification";

export async function GET(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const before = searchParams.get('before');
    const limit = parseInt(searchParams.get('limit') || '20');

    const notifications = await getUserNotifications(userId, {
      unreadOnly,
      before: before ? new Date(before) : undefined,
      limit
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { notificationIds } = data;

    await markNotificationsAsRead(userId, notificationIds);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json(
      { error: "Failed to mark notifications as read" },
      { status: 500 }
    );
  }
} 