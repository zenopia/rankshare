"use client";

import { UserProfile as ClerkUserProfile } from "@clerk/clerk-react";
import { SubLayout } from "@/components/layout/sub-layout";

export default function UserProfilePage() {
  return (
    <SubLayout title="Account Settings">
      <div className="px-0 md:px-6 lg:px-8 pb-8">
        <div className="max-w-2xl mx-auto">
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
    </SubLayout>
  );
} 