import mongoose, { Schema, Document } from "mongoose";
import { ListCollaborator } from "@/types/list";

export interface InvitationDocument extends Document {
  listId: mongoose.Types.ObjectId;
  inviterId: string;
  inviterUsername: string;
  inviteeEmail: string;
  inviteeId?: string;
  status: "pending" | "accepted" | "declined";
  role: ListCollaborator["role"];
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const invitationSchema = new Schema<InvitationDocument>(
  {
    listId: { type: Schema.Types.ObjectId, ref: "List", required: true },
    inviterId: { type: String, required: true },
    inviterUsername: { type: String, required: true },
    inviteeEmail: { type: String, required: true },
    inviteeId: { type: String },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
    role: {
      type: String,
      enum: ["editor", "viewer"],
      default: "viewer",
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from creation
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
invitationSchema.index({ listId: 1, inviteeEmail: 1 }, { unique: true });
invitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export function getInvitationModel() {
  return mongoose.models.Invitation || mongoose.model<InvitationDocument>("Invitation", invitationSchema);
} 