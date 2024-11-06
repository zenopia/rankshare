declare module '@clerk/nextjs/server' {
  export { auth, clerkClient, currentUser, authMiddleware } from '@clerk/nextjs';
  export type { Auth, User as ClerkUser, AuthObject, ClerkState } from '@clerk/nextjs/dist/types/server';
}

declare module '@clerk/nextjs' {
  export { 
    useAuth, 
    useUser, 
    useClerk, 
    SignIn, 
    SignUp, 
    ClerkProvider,
    UserButton
  } from '@clerk/clerk-react';
  export type { User, UserResource } from '@clerk/types';
}