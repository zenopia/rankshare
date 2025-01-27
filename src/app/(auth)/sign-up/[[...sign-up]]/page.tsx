"use client";

import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { LoadingPage } from "@/components/loading/loading-page";

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const { isReady } = useAuthGuard({ redirectIfAuthed: true });
  const returnUrl = searchParams?.get("returnUrl");

  if (!isReady) {
    return <LoadingPage />;
  }

  return (
    <SignUp redirectUrl={returnUrl || "/"} />
  );
} 