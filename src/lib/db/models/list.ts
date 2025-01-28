import mongoose from "mongoose";
import type { MongoListDocument } from "@/types/mongo";

const listSchema = new mongoose.Schema<MongoListDocument>(
  {
    title: { type: String, required: true },
    description: String,
    category: {
      type: String,
      required: true,
      enum: [
        "movies",
        "tv",
        "books",
        "games",
        "music",
        "food",
        "places",
        "products",
        "other",
      ],
    },
    privacy: {
      type: String,
      required: true,
      enum: ["public", "private", "unlisted"],
    },
    owner: {
      userId: { type: mongoose.Schema.Types.ObjectId, required: true },
      clerkId: { type: String, required: true },
      username: { type: String, required: true },
      joinedAt: { type: Date, required: true },
    },
    items: [
      {
        title: { type: String, required: true },
        comment: String,
        rank: { type: Number, required: true },
        properties: [
          {
            type: { type: String, enum: ["text", "link"] },
            label: { type: String, required: true },
            value: { type: String, required: true },
          },
        ],
      },
    ],
    stats: {
      viewCount: { type: Number, default: 0 },
      pinCount: { type: Number, default: 0 },
      copyCount: { type: Number, default: 0 },
    },
    collaborators: [
      {
        clerkId: { type: String, required: true },
        username: { type: String, required: true },
        role: {
          type: String,
          required: true,
          enum: ["owner", "admin", "editor", "viewer"],
        },
        status: {
          type: String,
          required: true,
          enum: ["pending", "accepted", "rejected"],
        },
        invitedAt: { type: Date, required: true },
        acceptedAt: Date,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Add editedAt field that updates when items are modified
listSchema.pre("save", function (next) {
  if (this.isModified("items")) {
    this.set("editedAt", new Date());
  }
  next();
});

// Indexes
listSchema.index({ "owner.clerkId": 1 });
listSchema.index({ "collaborators.clerkId": 1 });
listSchema.index({ privacy: 1 });
listSchema.index({ category: 1 });
listSchema.index({ createdAt: -1 });
listSchema.index({ updatedAt: -1 });

export const ListModel =
  mongoose.models.List || mongoose.model<MongoListDocument>("List", listSchema); 