import { auth as getAuth } from "@clerk/nextjs/server";
import { useAuth as useClerkAuth, useUser, useClerk } from "@clerk/nextjs";
import type { User } from "@clerk/backend";
import { AuthUser } from "@/types/auth";
import { connectToMongoDB } from "@/lib/db/client";
import { getUserModel } from "@/lib/db/models-v2/user";

export class AuthService {
  static async getCurrentUser(): Promise<AuthUser | null> {
    const { userId } = getAuth();
    if (!userId) return null;

    try {
      await connectToMongoDB();
      const UserModel = await getUserModel();
      const user = await UserModel.findOne({ clerkId: userId }).lean();
      
      if (!user) return null;
      
      return {
        id: user.clerkId,
        email: user.email || null,
        username: user.username,
        firstName: null, // We don't store these separately
        lastName: null,  // We don't store these separately
        fullName: user.displayName,
        imageUrl: user.imageUrl,
      };
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  static async getUserByUsername(username: string): Promise<AuthUser | null> {
    try {
      await connectToMongoDB();
      const UserModel = await getUserModel();
      const user = await UserModel.findOne({ username }).lean();
      
      if (!user) return null;
      
      return {
        id: user.clerkId,
        email: user.email || null,
        username: user.username,
        firstName: null, // We don't store these separately
        lastName: null,  // We don't store these separately
        fullName: user.displayName,
        imageUrl: user.imageUrl,
      };
    } catch (error) {
      console.error("Error getting user by username:", error);
      return null;
    }
  }

  static transformClerkUser(user: User): AuthUser {
    return {
      id: user.id,
      email: user.emailAddresses?.[0]?.emailAddress || null,
      username: user.username || null,
      firstName: user.firstName || null,
      lastName: user.lastName || null,
      fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || null,
      imageUrl: user.imageUrl || null,
    };
  }
}

// Client-side hooks
export function useAuthService() {
  const { isLoaded, isSignedIn: clerkIsSignedIn, signOut: clerkSignOut } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const clerk = useClerk();

  const user = clerkUser ? AuthService.transformClerkUser(clerkUser as unknown as User) : null;
  const isSignedIn = clerkIsSignedIn ?? false;

  const handleSignIn = async (returnUrl?: string) => {
    await clerk.openSignIn({
      redirectUrl: returnUrl || "/",
    });
  };

  const handleSignUp = async (returnUrl?: string) => {
    await clerk.openSignUp({
      redirectUrl: returnUrl || "/",
    });
  };

  const handleSignOut = async () => {
    await clerkSignOut();
  };

  const getToken = async () => {
    try {
      if (!clerk.session) return null;
      return await clerk.session.getToken();
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  };

  return {
    isLoaded,
    isSignedIn,
    user,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    getToken,
  };
} 
