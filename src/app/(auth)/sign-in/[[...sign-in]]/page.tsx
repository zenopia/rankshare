"use client";

import { SignIn } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useAuthGuard } from "@/hooks/use-auth-guard";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const { isReady } = useAuthGuard({ redirectIfAuthed: true });
  const returnUrl = searchParams?.get("returnUrl");

  if (!isReady) {
    return null;
  }

  return (
    <SignIn redirectUrl={returnUrl || "/"} />
  );
} 