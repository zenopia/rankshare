"use server";

import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { connectToMongoDB } from "@/lib/db/client";
import { getInvitationModel } from "@/lib/db/models-v2/invitation";
import { getListModel } from "@/lib/db/models-v2/list";
import { ListCollaborator } from "@/types/list";
import { MongoListCollaborator, MongoListDocument } from "@/types/mongo";
import { revalidatePath } from "next/cache";
import { sendCollaborationInviteEmail } from "@/lib/email";
import { Model } from "mongoose";

export async function inviteCollaborator(
  listId: string,
  email: string,
  role: ListCollaborator["role"]
) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  await connectToMongoDB();
  const List = await getListModel() as Model<MongoListDocument>;
  const Invitation = await getInvitationModel();

  // Get the list and verify ownership
  const list = await List.findById(listId).lean<MongoListDocument>();
  if (!list) throw new Error("List not found");
  if (list.owner.clerkId !== userId) throw new Error("Not authorized to invite collaborators");

  // Check if user is already a collaborator
  const existingCollaborator = list.collaborators?.find(
    (c: MongoListCollaborator) => c.clerkId === userId
  );
  if (existingCollaborator) throw new Error("User is already a collaborator");

  // Check for existing pending invitation
  const existingInvitation = await Invitation.findOne({
    listId: list._id,
    inviteeEmail: email,
    status: "pending"
  });
  if (existingInvitation) throw new Error("An invitation has already been sent to this email");

  // Get inviter details
  const inviter = await clerkClient.users.getUser(userId);

  // Create invitation
  const invitation = await Invitation.create({
    listId: list._id,
    inviterId: userId,
    inviterUsername: inviter.username,
    inviteeEmail: email,
    role,
  });

  // Send email notification
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) throw new Error("Application URL is not configured");

  await sendCollaborationInviteEmail({
    to: email,
    inviterName: inviter.username || `${inviter.firstName} ${inviter.lastName}`.trim(),
    listTitle: list.title,
    listUrl: `${appUrl}/lists/${list._id}`,
  });

  revalidatePath(`/lists/${listId}`);
  return invitation;
}

export async function acceptInvitation(invitationId: string) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  await connectToMongoDB();
  const Invitation = await getInvitationModel();
  const List = await getListModel() as Model<MongoListDocument>;

  const invitation = await Invitation.findById(invitationId);
  if (!invitation) throw new Error("Invitation not found");
  if (invitation.status !== "pending") throw new Error("Invitation is no longer valid");

  // Verify the current user is the invitee
  const user = await clerkClient.users.getUser(userId);
  if (user.emailAddresses.every(email => email.emailAddress !== invitation.inviteeEmail)) {
    throw new Error("This invitation is not for you");
  }

  // Update invitation status
  invitation.status = "accepted";
  invitation.inviteeId = userId;
  await invitation.save();

  // Add user as collaborator to the list
  const list = await List.findById(invitation.listId).lean<MongoListDocument>();
  if (!list) throw new Error("List not found");

  list.collaborators = list.collaborators || [];
  const newCollaborator: MongoListCollaborator = {
    clerkId: userId,
    username: user.username || "",
    role: invitation.role,
    status: "accepted",
    invitedAt: invitation.createdAt,
    acceptedAt: new Date()
  };
  
  await List.findByIdAndUpdate(invitation.listId, {
    $push: { collaborators: newCollaborator }
  });

  revalidatePath(`/lists/${list._id}`);

  return { success: true };
}

export async function declineInvitation(invitationId: string) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  await connectToMongoDB();
  const Invitation = await getInvitationModel();

  const invitation = await Invitation.findById(invitationId);
  if (!invitation) throw new Error("Invitation not found");
  if (invitation.status !== "pending") throw new Error("Invitation is no longer valid");

  // Verify the current user is the invitee
  const user = await clerkClient.users.getUser(userId);
  if (user.emailAddresses.every(email => email.emailAddress !== invitation.inviteeEmail)) {
    throw new Error("This invitation is not for you");
  }

  invitation.status = "declined";
  invitation.inviteeId = userId;
  await invitation.save();

  revalidatePath(`/lists/${invitation.listId}`);
  return { success: true };
}

export async function getInvitationsForList(listId: string) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  await connectToMongoDB();
  const Invitation = await getInvitationModel();
  const List = await getListModel() as Model<MongoListDocument>;

  const list = await List.findById(listId).lean<MongoListDocument>();
  if (!list) throw new Error("List not found");
  if (list.owner.clerkId !== userId) throw new Error("Not authorized to view invitations");

  return Invitation.find({
    listId: list._id,
    status: "pending"
  }).sort({ createdAt: -1 });
}

export async function getMyPendingInvitations() {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await clerkClient.users.getUser(userId);
  const userEmails = user.emailAddresses.map(email => email.emailAddress);

  await connectToMongoDB();
  const Invitation = await getInvitationModel();

  return Invitation.find({
    inviteeEmail: { $in: userEmails },
    status: "pending"
  }).sort({ createdAt: -1 });
} 