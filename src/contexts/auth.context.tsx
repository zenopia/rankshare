'use client';

import { createContext, useContext } from 'react';
import { AuthContextType, AuthProviderProps } from '@/types/auth';
import { useAuthService } from '@/lib/services/auth.service';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuthService();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 