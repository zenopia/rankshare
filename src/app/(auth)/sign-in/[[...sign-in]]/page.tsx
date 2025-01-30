"use client";

import { SignIn } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const returnUrl = searchParams?.get("returnUrl");

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
      <SignIn redirectUrl={returnUrl || "/"} />
    </div>
  );
} 