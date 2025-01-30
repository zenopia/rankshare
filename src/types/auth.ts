export interface AuthUser {
  id: string;
  email?: string | null;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  imageUrl?: string | null;
}

export interface AuthSession {
  user: AuthUser | null;
  isLoaded: boolean;
  isSignedIn: boolean;
}

export interface AuthContextType extends AuthSession {
  signIn: (returnUrl?: string) => Promise<void>;
  signUp: (returnUrl?: string) => Promise<void>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

export interface AuthProviderProps {
  children: React.ReactNode;
} 