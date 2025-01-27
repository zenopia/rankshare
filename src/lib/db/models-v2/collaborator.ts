import mongoose from 'mongoose';
import { connectToMongoDB } from '../client';

const collaboratorSchema = new mongoose.Schema({
  listId: { type: String, required: true },
  clerkId: { type: String, required: true },
  role: { type: String, enum: ['owner', 'admin', 'editor', 'viewer'], required: true },
  status: { type: String, enum: ['accepted', 'pending', 'rejected'], required: true },
}, { timestamps: true });

export async function getCollaboratorModel() {
  await connectToMongoDB();
  return mongoose.models.Collaborator || mongoose.model('Collaborator', collaboratorSchema);
} 