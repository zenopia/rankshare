"use server"

import { auth, currentUser } from '@clerk/nextjs/server';
import { UserModel } from "@/lib/db/models/user";
import dbConnect from "@/lib/db/mongodb";

export async function ensureUserExists() {
  const { userId } = await auth();
  const user = await currentUser();
  
  if (!userId || !user) return null;

  await dbConnect();

  // Check if user exists in our DB
  const existingUser = await UserModel.findOne({ clerkId: userId });
  if (existingUser) return existingUser;

  // Create new user if they don't exist
  const newUser = await UserModel.create({
    clerkId: userId,
    email: user.emailAddresses[0]?.emailAddress,
    username: user.username || `user_${userId.slice(0, 8)}`,
  });

  return newUser;
} 