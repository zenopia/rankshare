"use client";

import { SignIn } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { SubLayout } from "@/components/layout/sub-layout";
import Link from "next/link";

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
    <SubLayout title="Sign In">
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center flex-col">
        <div className="-mt-20">
          <SignIn 
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-lg border-[0.5px] border-gray-200 rounded-lg ring-[0.5px] ring-gray-100 shadow-[0_0_15px_rgba(0,0,0,0.1)]",
                footerActionLink: "text-[#801CCC] hover:text-[#801CCC]/90",
                formButtonPrimary: "bg-[#801CCC] hover:bg-[#801CCC]/90",
                footer: {
                  "& + div": {
                    "& button": {
                      display: "none"
                    }
                  }
                },
                footerAction: "bg-[#801CCC]",
                footerActionText: "text-white"
              }
            }}
            afterSignInUrl="/"
            routing="path"
            signUpUrl="/sign-up"
          />
        </div>
        <div className="w-full fixed bottom-0 left-0 p-4 bg-gray-50 border-t text-center shadow-lg">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="text-[#801CCC] hover:text-[#801CCC]/90 font-medium">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </SubLayout>
  );
} 