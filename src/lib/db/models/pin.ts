import mongoose from "mongoose";

const pinSchema = new mongoose.Schema({
  listId: { type: String, required: true },
  clerkId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Create a compound index on listId and clerkId to ensure uniqueness
pinSchema.index({ listId: 1, clerkId: 1 }, { unique: true });

export interface Pin {
  listId: string;
  clerkId: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function getPinModel() {
  return mongoose.models.Pin || mongoose.model("Pin", pinSchema);
} 