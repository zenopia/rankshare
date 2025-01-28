import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";

export default async function ProfileSettingsPage() {
  const { userId } = auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="container max-w-4xl py-6">
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
      {/* TODO: Add ProfileSettingsForm component */}
    </div>
  );
} 