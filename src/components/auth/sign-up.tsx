"use client";

import { SignUp } from "@clerk/nextjs";

export function SignUpComponent() {
  return <SignUp afterSignUpUrl="/app" signInUrl="/sign-in" />;
} 