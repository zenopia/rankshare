"use client";

import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const returnUrl = searchParams?.get("returnUrl");

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
      <SignUp redirectUrl={returnUrl || "/"} />
    </div>
  );
} 