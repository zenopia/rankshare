import mongoose from "mongoose";
import { LIST_CATEGORIES } from "@/types/list";
import type { MongoListDocument } from "@/types/mongo";

const listItemPropertySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["text", "link"],
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
}, { _id: true });

const listItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
    default: null,
  },
  rank: {
    type: Number,
    required: true,
  },
  properties: {
    type: [listItemPropertySchema],
    default: [],
  },
}, { _id: true });

const listOwnerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  clerkId: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  joinedAt: {
    type: Date,
    required: true,
  },
}, { _id: false });

const listCollaboratorSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["editor", "viewer"],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    required: true,
  },
  invitedAt: {
    type: Date,
    required: true,
  },
  acceptedAt: Date,
}, { _id: false });

const listStatsSchema = new mongoose.Schema({
  viewCount: {
    type: Number,
    default: 0,
  },
  pinCount: {
    type: Number,
    default: 0,
  },
  itemCount: {
    type: Number,
    default: 0,
  },
}, { _id: false });

const listSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: null,
  },
  category: {
    type: String,
    enum: LIST_CATEGORIES,
    required: true,
  },
  privacy: {
    type: String,
    enum: ["public", "private", "unlisted"],
    required: true,
  },
  owner: {
    type: listOwnerSchema,
    required: true,
  },
  items: {
    type: [listItemSchema],
    default: [],
  },
  stats: {
    type: listStatsSchema,
    default: () => ({}),
  },
  collaborators: {
    type: [listCollaboratorSchema],
    default: [],
  },
  pinnedAt: Date,
  isDeleted: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

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

// Create text index for search
listSchema.index({
  title: "text",
  description: "text",
}, {
  weights: {
    title: 2,
    description: 1,
  },
});

export const ListModel = mongoose.models.List as mongoose.Model<MongoListDocument> || 
  mongoose.model<MongoListDocument>("List", listSchema);

export async function getListModel() {
  return ListModel;
} 