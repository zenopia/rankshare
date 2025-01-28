"use client";

import { SignIn } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

export function SignInComponent() {
  const searchParams = useSearchParams();
  const returnUrl = searchParams?.get("returnUrl");

  return (
    <SignIn redirectUrl={returnUrl || "/"} />
  );
} 