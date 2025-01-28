"use client";

import { SignIn } from "@clerk/nextjs";

export function SignInForm() {
  return <SignIn afterSignInUrl="/app" signUpUrl="/sign-up" />;
} 