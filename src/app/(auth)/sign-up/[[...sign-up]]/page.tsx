"use client";

import { SignUp } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { SubLayout } from "@/components/layout/sub-layout";
import Image from "next/image";

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
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <div className="w-full max-w-[400px] mb-8">
          <Image
            src="/Favely-logo.svg"
            alt="Favely"
            width={150}
            height={38}
            className="mx-auto mb-8"
            priority
          />
          <SignUp
            appearance={{
              layout: {
                socialButtonsPlacement: "bottom",
                socialButtonsVariant: "blockButton",
                logoPlacement: "none",
                shimmer: true
              },
              elements: {
                rootBox: "w-full",
                card: "shadow-none p-0",
                header: "text-center",
                headerTitle: "text-2xl font-semibold mb-2",
                headerSubtitle: "text-muted-foreground text-base mb-6",
                socialButtons: "flex flex-col gap-3",
                socialButtonsBlockButton: "border hover:bg-accent transition-colors",
                socialButtonsBlockButtonText: "text-sm font-medium",
                socialButtonsProviderIcon: "w-5 h-5",
                dividerContainer: "my-6",
                dividerLine: "bg-border",
                dividerText: "text-muted-foreground px-3 text-sm",
                formButtonPrimary: "bg-primary hover:bg-primary/90 transition-colors",
                formFieldInput: "rounded-md border focus:ring-2 focus:ring-primary/20",
                formFieldLabel: "text-sm font-medium",
                footerActionText: "text-sm",
                footerActionLink: "text-primary hover:text-primary/90 font-medium",
                footer: "hidden"
              }
            }}
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            redirectUrl="/profile"
          />
        </div>
      </div>
    </SubLayout>
  );
} 