"use client";

import { UserProfile as ClerkUserProfile } from "@clerk/nextjs/app-beta/client";

export default function UserProfilePage() {
  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
        <ClerkUserProfile 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-none border-0 p-0"
            }
          }}
        />
      </div>
    </div>
  );
} 