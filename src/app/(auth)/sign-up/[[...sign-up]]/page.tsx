"use client";

import { SignUp } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { SubLayout } from "@/components/layout/sub-layout";

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
    <SubLayout title="Sign Up">
      <div className="container max-w-lg mx-auto py-8">
        <SignUp
          appearance={{
            elements: {
              formButtonPrimary: "bg-primary hover:bg-primary/90",
              card: "shadow-none",
              footer: "hidden"
            }
          }}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          redirectUrl="/profile"
        />
      </div>
    </SubLayout>
  );
} 