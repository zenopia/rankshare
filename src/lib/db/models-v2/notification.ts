import mongoose from 'mongoose';
import type { MongoNotificationDocument, NotificationType } from '@/types/mongo';

const notificationSchema = new mongoose.Schema<MongoNotificationDocument>({
  userId: { type: String, required: true, index: true },
  type: { 
    type: String, 
    required: true,
    enum: [
      'collaboration_invite',
      'collaboration_accepted',
      'collaboration_rejected',
      'list_edited',
      'list_deleted',
      'list_shared',
      'mention'
    ] as NotificationType[]
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: {
    listId: String,
    listTitle: String,
    actorId: String,
    actorName: String,
    role: String
  },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  readAt: Date
}, {
  timestamps: true
});

// Create indexes
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

// Create or get the model
export async function getNotificationModel() {
  const modelName = 'Notification';
  return mongoose.models[modelName] || 
    mongoose.model<MongoNotificationDocument>(modelName, notificationSchema);
}

// Helper function to create a notification
export async function createNotification({
  userId,
  type,
  title,
  message,
  data
}: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: MongoNotificationDocument['data'];
}) {
  const NotificationModel = await getNotificationModel();
  
  const notification = await NotificationModel.create({
    userId,
    type,
    title,
    message,
    data,
    createdAt: new Date()
  });

  return notification;
}

// Helper function to mark notifications as read
export async function markNotificationsAsRead(userId: string, notificationIds?: string[]) {
  const NotificationModel = await getNotificationModel();
  
  const query: { 
    userId: string; 
    isRead: boolean; 
    _id?: { $in: string[] } 
  } = { 
    userId, 
    isRead: false 
  };

  if (notificationIds?.length) {
    query._id = { $in: notificationIds };
  }
  
  await NotificationModel.updateMany(
    query,
    { 
      $set: { 
        isRead: true,
        readAt: new Date()
      } 
    }
  );
}

// Helper function to get user's notifications
export async function getUserNotifications(userId: string, options: {
  unreadOnly?: boolean;
  limit?: number;
  before?: Date;
} = {}) {
  const NotificationModel = await getNotificationModel();
  
  const query: {
    userId: string;
    isRead?: boolean;
    createdAt?: { $lt: Date };
  } = { userId };

  if (options.unreadOnly) {
    query.isRead = false;
  }
  if (options.before) {
    query.createdAt = { $lt: options.before };
  }
  
  const notifications = await NotificationModel.find(query)
    .sort({ createdAt: -1 })
    .limit(options.limit || 20)
    .lean();
    
  return notifications;
} 