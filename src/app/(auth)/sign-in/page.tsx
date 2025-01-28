import { SignIn } from "@clerk/nextjs";

interface SignInPageProps {
  username?: string;
}

export const runtime = "edge";

export default function SignInPage({ username }: SignInPageProps) {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <SignIn afterSignInUrl="/app" signUpUrl="/sign-up" />
    </div>
  );
} 