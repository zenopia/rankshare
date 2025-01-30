import { useAuth } from "@/contexts/auth.context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface SignInFormProps {
  returnUrl?: string | null;
}

export function SignInForm({ returnUrl }: SignInFormProps) {
  const { signIn } = useAuth();

  const handleSignIn = async () => {
    await signIn(returnUrl || undefined);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to your account to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleSignIn} 
          className="w-full"
          size="lg"
        >
          Sign in
        </Button>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-muted-foreground text-center">
          Don't have an account?{" "}
          <Link 
            href={`/sign-up${returnUrl ? `?returnUrl=${returnUrl}` : ''}`}
            className="text-primary hover:underline"
          >
            Sign up
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
} 