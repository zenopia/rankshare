import { useAuth as useClerkAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
 
export function useAuth() {
  const { isLoaded, isSignedIn, signOut } = useClerkAuth();
  const { user } = useUser();
  const router = useRouter();
 
  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };
 
  return {
    isLoaded,
    isSignedIn,
    user,
    signOut: handleSignOut,
  };
} 