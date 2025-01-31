import { auth as getAuth } from "@clerk/nextjs/server";
import { useAuth as useClerkAuth, useUser, useClerk } from "@clerk/nextjs";
import type { User } from "@clerk/backend";
import { AuthUser } from "@/types/auth";
import { connectToMongoDB } from "@/lib/db/client";
import { getUserModel } from "@/lib/db/models-v2/user";
import type { ActiveSessionResource, TokenResource } from '@clerk/types';

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

  const getToken = async () => {
    try {
      if (!clerk.session) {
        console.warn("No clerk session found");
        return null;
      }

      // Try to get token with persistence
      const getTokenWithPersistence = async () => {
        try {
          // First try to get the token directly
          const token = await clerk.session?.getToken();
          if (token) return token;

          // If no token, try to restore the session
          console.debug('No token, attempting to restore session...');
          await clerk.session?.touch();
          
          // Wait for session to be touched
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Try to get token again
          return await clerk.session?.getToken();
        } catch (error) {
          console.warn('Error in getTokenWithPersistence:', error);
          return null;
        }
      };

      let token = await getTokenWithPersistence();

      // If still no token and we're on mobile, try more aggressive recovery
      if (!token && /Mobile|Android|iPhone/i.test(window.navigator.userAgent)) {
        console.debug('Mobile browser detected, attempting aggressive session recovery...');
        
        try {
          // Try to force a new session
          await clerk.session?.end();
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Get the active session
          const activeSession = clerk.session;
          
          if (activeSession) {
            await activeSession.touch();
            token = await activeSession.getToken();
          } else {
            // If no active session, try to create one
            const lastActiveSession = await clerk.session?.lastActiveToken;
            if (lastActiveSession && typeof lastActiveSession === 'string') {
              await clerk.setActive({ session: lastActiveSession });
              token = await getTokenWithPersistence();
            }
          }
        } catch (error) {
          console.warn('Aggressive session recovery failed:', error);
        }
      }

      // If we still don't have a token, try one last session refresh
      if (!token) {
        try {
          await clerk.session?.touch();
          token = await clerk.session?.getToken();
        } catch (error) {
          console.warn('Final session refresh failed:', error);
        }
      }

      return token;
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  };

  const handleSignIn = async (returnUrl?: string) => {
    try {
      // Store the current URL for return after sign in
      if (typeof window !== 'undefined' && returnUrl) {
        sessionStorage.setItem('returnUrl', returnUrl);
      }

      // Special handling for mobile browsers
      const isMobile = typeof window !== 'undefined' && 
        /Mobile|Android|iPhone/i.test(window.navigator.userAgent);

      if (isMobile && clerk.session) {
        // For mobile, ensure we have a clean session state
        try {
          await clerk.session.end();
        } catch (e) {
          // Ignore end session errors
        }
      }

      const storedReturnUrl = typeof window !== 'undefined' ? 
        sessionStorage.getItem('returnUrl') : null;
      const finalReturnUrl = returnUrl || storedReturnUrl || "/";

      // Clear stored return URL
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('returnUrl');
      }

      await clerk.openSignIn({
        redirectUrl: finalReturnUrl,
        appearance: {
          variables: {
            colorPrimary: '#0F172A',
          }
        }
      });
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      // End current session to ensure clean state
      if (clerk.session) {
        await clerk.session.end();
      }
      
      // Perform the sign out
      await clerkSignOut();
      
      // Force a page reload to ensure clean state
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } catch (error) {
      console.error("Sign out error:", error);
      // Force a reload anyway to ensure clean state
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  };

  return {
    isLoaded,
    isSignedIn,
    user,
    signIn: handleSignIn,
    signOut: handleSignOut,
    getToken,
  };
} 
