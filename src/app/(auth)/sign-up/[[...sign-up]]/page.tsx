"use client";

import { SignUp } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

export default function SignUpPage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  useEffect(() => {
    async function checkProfile() {
      if (isSignedIn) {
        try {
          const response = await fetch('/api/profile');
          if (!response.ok) {
            router.push('/profile');
            return;
          }

          const data = await response.json();
          const isComplete = Boolean(
            data.location &&
            data.dateOfBirth &&
            data.gender &&
            data.livingStatus
          );

          if (!isComplete) {
            router.push('/profile');
          } else {
            router.push('/');
          }
        } catch (error) {
          console.error('Error checking profile:', error);
          router.push('/profile');
        }
      }
    }

    checkProfile();
  }, [isSignedIn, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-md"
          }
        }}
        redirectUrl="/profile"
      />
    </div>
  );
} 