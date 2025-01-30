import { useAuth } from "@/contexts/auth.context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface SignUpFormProps {
  returnUrl?: string | null;
}

export function SignUpForm({ returnUrl }: SignUpFormProps) {
  const { signUp } = useAuth();

  const handleSignUp = async () => {
    await signUp(returnUrl || undefined);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Sign up to get started</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleSignUp} 
          className="w-full"
          size="lg"
        >
          Sign up
        </Button>
        <div className="text-sm text-muted-foreground text-center">
          Already have an account?{" "}
          <Link 
            href={`/sign-in${returnUrl ? `?returnUrl=${returnUrl}` : ''}`}
            className="text-primary hover:underline"
          >
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
} 