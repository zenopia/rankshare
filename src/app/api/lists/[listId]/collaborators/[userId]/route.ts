"use server";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getListModel, ListCollaborator } from "@/lib/db/models-v2/list";
import { getUserModel, UserDocument } from "@/lib/db/models-v2/user";
import { Types } from "mongoose";

// Helper function to check if user can manage collaborators
async function canManageCollaborators(listId: string, userId: string | null) {
  if (!userId) return false;
  
  const ListModel = await getListModel();
  const list = await ListModel.findById(listId).lean();
  
  if (!list) return false;
  
  return (
    list.owner.clerkId === userId ||
    list.collaborators.some(c => 
      c.clerkId === userId && 
      c.status === 'accepted' && 
      c.role === 'admin'
    )
  );
}

export async function PUT(
  request: Request,
  { params }: { params: { listId: string, userId: string } }
) {
  try {
    const { userId: currentUserId } = auth();
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { listId, userId: targetUserId } = params;
    const { role } = await request.json();

    // Validate role
    if (!['admin', 'editor', 'viewer', 'owner'].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    // Check permissions
    if (!await canManageCollaborators(listId, currentUserId)) {
      return NextResponse.json(
        { error: "Not authorized to manage collaborators" },
        { status: 403 }
      );
    }

    const ListModel = await getListModel();
    const list = await ListModel.findById(listId);

    if (!list) {
      return NextResponse.json(
        { error: "List not found" },
        { status: 404 }
      );
    }

    // Handle email collaborators
    const isEmailCollaborator = targetUserId.includes('@');
    if (isEmailCollaborator) {
      const collaboratorIndex = list.collaborators.findIndex(
        c => c._isEmailInvite && c.email === targetUserId
      );

      if (collaboratorIndex === -1) {
        return NextResponse.json(
          { error: "Collaborator not found" },
          { status: 404 }
        );
      }

      list.collaborators[collaboratorIndex].role = role;
      await list.save();
      return NextResponse.json({ message: "Collaborator updated successfully" });
    }

    // Handle regular user collaborators
    const UserModel = await getUserModel();
    const [targetUser, currentUser] = await Promise.all([
      UserModel.findOne({ clerkId: targetUserId }).lean(),
      UserModel.findOne({ clerkId: currentUserId }).lean()
    ]) as [UserDocument, UserDocument];

    if (!targetUser || !currentUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Handle ownership transfer
    if (role === 'owner') {
      // Only the current owner can transfer ownership
      if (list.owner.clerkId !== currentUserId) {
        return NextResponse.json(
          { error: "Only the owner can transfer ownership" },
          { status: 403 }
        );
      }

      // Update the previous owner to be an admin
      list.collaborators = list.collaborators.filter(c => c.clerkId !== targetUserId);
      list.collaborators.push({
        userId: currentUser._id,
        clerkId: currentUserId,
        role: 'admin',
        status: 'accepted',
        invitedAt: new Date(),
        acceptedAt: new Date()
      } as ListCollaborator);

      // Set the new owner
      list.owner = {
        userId: targetUser._id as Types.ObjectId,
        clerkId: targetUserId
      };
    } else {
      // Update collaborator role
      const collaboratorIndex = list.collaborators.findIndex(
        c => c.clerkId === targetUserId
      );

      if (collaboratorIndex === -1) {
        return NextResponse.json(
          { error: "Collaborator not found" },
          { status: 404 }
        );
      }

      list.collaborators[collaboratorIndex].role = role;
    }

    await list.save();

    return NextResponse.json({ message: "Collaborator updated successfully" });
  } catch (error) {
    console.error('Error updating collaborator:', error);
    return NextResponse.json(
      { error: "Failed to update collaborator" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { listId: string, userId: string } }
) {
  try {
    const { userId: currentUserId } = auth();
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { listId, userId: targetUserId } = params;

    const ListModel = await getListModel();
    const list = await ListModel.findById(listId);

    if (!list) {
      return NextResponse.json(
        { error: "List not found" },
        { status: 404 }
      );
    }

    // Can't remove the owner
    if (list.owner.clerkId === targetUserId) {
      return NextResponse.json(
        { error: "Cannot remove the owner" },
        { status: 400 }
      );
    }

    // Allow if:
    // 1. User is removing themselves, OR
    // 2. User is the owner or admin
    const isCurrentUser = currentUserId === targetUserId;
    const canManage = await canManageCollaborators(listId, currentUserId);
    
    if (!isCurrentUser && !canManage) {
      return NextResponse.json(
        { error: "Not authorized to remove collaborators" },
        { status: 403 }
      );
    }

    // Remove the collaborator
    list.collaborators = list.collaborators.filter(
      c => (c._isEmailInvite ? c.email !== targetUserId : c.clerkId !== targetUserId)
    );

    await list.save();

    return NextResponse.json({ message: "Collaborator removed successfully" });
  } catch (error) {
    console.error('Error removing collaborator:', error);
    return NextResponse.json(
      { error: "Failed to remove collaborator" },
      { status: 500 }
    );
  }
} 