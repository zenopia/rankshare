import { SignUp } from "@clerk/nextjs";

interface SignUpPageProps {
  username?: string;
}

export const runtime = "edge";

export default function SignUpPage({ username }: SignUpPageProps) {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <SignUp afterSignUpUrl="/app" signInUrl="/sign-in" />
    </div>
  );
} 