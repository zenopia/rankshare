import { useAuth as useClerkAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useAuth as useAuthContext } from "@/lib/auth/hooks";

export function useAuth() {
  const auth = useAuthContext();
  const router = useRouter();

  const handleSignIn = useCallback(async (returnUrl?: string) => {
    await auth.signIn(returnUrl);
  }, [auth]);

  const handleSignUp = useCallback(async (returnUrl?: string) => {
    await auth.signUp(returnUrl);
  }, [auth]);

  const handleSignOut = useCallback(async () => {
    await auth.signOut();
    router.push("/");
  }, [auth, router]);

  const getToken = useCallback(async () => {
    return auth.getToken();
  }, [auth]);

  return {
    isLoaded: auth.isLoaded,
    isSignedIn: auth.isSignedIn,
    user: auth.user,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    getToken
  };
} 