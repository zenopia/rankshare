"use client";

import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useAuthGuard } from "@/hooks/use-auth-guard";

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const { isReady } = useAuthGuard({ redirectIfAuthed: true });
  const returnUrl = searchParams?.get("returnUrl");

  if (!isReady) {
    return null;
  }

  return (
    <SignUp redirectUrl={returnUrl || "/"} />
  );
} 