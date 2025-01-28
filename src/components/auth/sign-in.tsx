"use client";

import { SignIn } from "@clerk/nextjs";

export function SignInComponent() {
  return <SignIn afterSignInUrl="/app" signUpUrl="/sign-up" />;
} 