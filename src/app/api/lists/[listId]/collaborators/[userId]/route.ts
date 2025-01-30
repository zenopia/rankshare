"use server";

import { NextResponse } from "next/server";
import { AuthService } from "@/lib/services/auth.service";
import { connectToMongoDB } from "@/lib/db/client";
import { getListModel, ListDocument, ListCollaborator } from "@/lib/db/models-v2/list";
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

export async function DELETE(
  request: Request,
  { params }: { params: { listId: string; userId: string } }
) {
  const user = await AuthService.getCurrentUser();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { listId, userId: targetUserId } = params;

    await connectToMongoDB();
    const ListModel = await getListModel();

    // Find the list
    const list = await ListModel.findById(listId);
    if (!list) {
      return new NextResponse("List not found", { status: 404 });
    }

    // Check if user is owner or the collaborator being removed
    const isOwner = list.owner.clerkId === user.id;
    const isSelfRemoval = targetUserId === user.id;

    if (!isOwner && !isSelfRemoval) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Remove the collaborator
    await ListModel.findByIdAndUpdate(listId, {
      $pull: {
        collaborators: { clerkId: targetUserId }
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error removing collaborator:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { listId: string; userId: string } }
) {
  const user = await AuthService.getCurrentUser();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { listId, userId: targetUserId } = params;
    const body = await request.json();
    const { role } = body;

    if (!role || !["editor", "viewer"].includes(role)) {
      return new NextResponse("Invalid role", { status: 400 });
    }

    await connectToMongoDB();
    const ListModel = await getListModel();

    // Find the list
    const list = await ListModel.findById(listId);
    if (!list) {
      return new NextResponse("List not found", { status: 404 });
    }

    // Only owner can change roles
    if (list.owner.clerkId !== user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Update the collaborator's role
    const updatedList = await ListModel.findOneAndUpdate(
      {
        _id: listId,
        "collaborators.clerkId": targetUserId
      },
      {
        $set: {
          "collaborators.$.role": role
        }
      },
      { new: true }
    );

    if (!updatedList) {
      return new NextResponse("Collaborator not found", { status: 404 });
    }

    return NextResponse.json({
      collaborators: updatedList.collaborators
    });
  } catch (error) {
    console.error("Error updating collaborator role:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { listId: string, userId: string } }
) {
  const user = await AuthService.getCurrentUser();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { listId, userId: targetUserId } = params;
    const { role } = await request.json();

    // Validate role
    if (!['admin', 'editor', 'viewer', 'owner'].includes(role)) {
      return new NextResponse("Invalid role", { status: 400 });
    }

    // Check permissions
    if (!await canManageCollaborators(listId, user.id)) {
      return new NextResponse("Not authorized to manage collaborators", { status: 403 });
    }

    const ListModel = await getListModel();
    const list = await ListModel.findById(listId);

    if (!list) {
      return new NextResponse("List not found", { status: 404 });
    }

    // Handle email collaborators
    const isEmailCollaborator = targetUserId.includes('@');
    if (isEmailCollaborator) {
      const collaboratorIndex = list.collaborators.findIndex(
        c => c._isEmailInvite && c.email === targetUserId
      );

      if (collaboratorIndex === -1) {
        return new NextResponse("Collaborator not found", { status: 404 });
      }

      list.collaborators[collaboratorIndex].role = role;
      await list.save();
      return NextResponse.json({ message: "Collaborator updated successfully" });
    }

    // Handle regular user collaborators
    const UserModel = await getUserModel();
    const [targetUser, currentUser] = await Promise.all([
      UserModel.findOne({ clerkId: targetUserId }).lean(),
      UserModel.findOne({ clerkId: user.id }).lean()
    ]) as [UserDocument, UserDocument];

    if (!targetUser || !currentUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Handle ownership transfer
    if (role === 'owner') {
      // Only the current owner can transfer ownership
      if (list.owner.clerkId !== user.id) {
        return new NextResponse("Only the owner can transfer ownership", { status: 403 });
      }

      // Update the previous owner to be an admin
      list.collaborators = list.collaborators.filter(c => c.clerkId !== targetUserId);
      list.collaborators.push({
        userId: currentUser._id,
        clerkId: user.id,
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
        return new NextResponse("Collaborator not found", { status: 404 });
      }

      list.collaborators[collaboratorIndex].role = role;
    }

    await list.save();

    return NextResponse.json({ message: "Collaborator updated successfully" });
  } catch (error) {
    console.error('Error updating collaborator:', error);
    return new NextResponse("Failed to update collaborator", { status: 500 });
  }
} 