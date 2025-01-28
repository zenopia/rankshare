import mongoose, { Schema, models, Model } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongodb";

export interface IList {
  _id: string;
  title: string;
  description?: string;
  category: string;
  privacy: 'public' | 'private' | 'unlisted';
  owner: {
    clerkId: string;
    username: string;
    joinedAt: Date;
  };
  items: Array<{
    id: string;
    title: string;
    description?: string;
    rank: number;
  }>;
  stats: {
    viewCount: number;
    pinCount: number;
    itemCount: number;
  };
  collaborators: Array<{
    clerkId: string;
    username: string;
    role: 'editor' | 'viewer';
    status: 'pending' | 'accepted' | 'rejected';
    invitedAt: Date;
    acceptedAt?: Date;
  }>;
  pinnedBy: string[];
  pinnedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  isDeleted?: boolean;
}

const listSchema = new Schema<IList>(
  {
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true },
    privacy: { 
      type: String, 
      enum: ['public', 'private', 'unlisted'],
      required: true 
    },
    owner: {
      clerkId: { type: String, required: true },
      username: { type: String, required: true },
      joinedAt: { type: Date, required: true }
    },
    items: [
      {
        id: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String },
        rank: { type: Number, required: true },
      },
    ],
    stats: {
      viewCount: { type: Number, default: 0 },
      pinCount: { type: Number, default: 0 },
      itemCount: { type: Number, default: 0 }
    },
    collaborators: [
      {
        clerkId: { type: String, required: true },
        username: { type: String, required: true },
        role: { 
          type: String, 
          enum: ['editor', 'viewer'],
          required: true 
        },
        status: {
          type: String,
          enum: ['pending', 'accepted', 'rejected'],
          required: true
        },
        invitedAt: { type: Date, required: true },
        acceptedAt: { type: Date }
      }
    ],
    pinnedBy: [{ type: String }],
    pinnedAt: { type: Date },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Create indexes
listSchema.index({ "owner.clerkId": 1 });
listSchema.index({ "owner.username": 1 });
listSchema.index({ "collaborators.clerkId": 1 });
listSchema.index({ category: 1 });
listSchema.index({ privacy: 1 });
listSchema.index({ createdAt: -1 });
listSchema.index({ updatedAt: -1 });
listSchema.index({ pinnedAt: -1 });
listSchema.index({ isDeleted: 1 });
listSchema.index({ pinnedBy: 1 });

let ListModel: Model<IList>;

export async function getListModel(): Promise<Model<IList>> {
  if (!ListModel) {
    const connection = await connectToDatabase();
    try {
      ListModel = connection.model<IList>('List');
    } catch {
      ListModel = connection.model<IList>('List', listSchema);
    }
  }
  return ListModel;
}

export const List = models.List || mongoose.model("List", listSchema); 