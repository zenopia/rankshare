"use client";

import { SignIn } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { SubLayout } from "@/components/layout/sub-layout";

export default function SignInPage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  useEffect(() => {
    let isMounted = true;

    async function checkProfile() {
      if (!isSignedIn) return;

      try {
        const response = await fetch('/api/profile');
        if (!isMounted) return;

        if (!response.ok) {
          router.push('/profile');
          return;
        }

        const data = await response.json();
        if (!isMounted) return;

        const isComplete = Boolean(
          data?.location &&
          data?.dateOfBirth &&
          data?.gender &&
          data?.livingStatus
        );
        
        if (isComplete) {
          router.push('/');
        } else {
          router.push('/profile');
        }
      } catch (error) {
        if (isMounted) {
          router.push('/profile');
        }
      }
    }

    checkProfile();

    return () => {
      isMounted = false;
    };
  }, [isSignedIn, router]);

  return (
    <div className="container max-w-lg mx-auto py-8">
      <SignIn
        appearance={{
          elements: {
            formButtonPrimary: "bg-primary hover:bg-primary/90",
            card: "shadow-none",
            footer: "hidden"
          }
        }}
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        redirectUrl="/"
      />
    </div>
  );
} 