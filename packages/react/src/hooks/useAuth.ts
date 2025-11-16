/**
 * useAuth hook
 * 
 * Main hook for accessing auth state and methods
 */

import { useContext } from 'react';
import { AuthReactContext, AuthContextValue } from '../context/AuthProvider';

/**
 * Get auth context
 * 
 * @returns Fully typed auth context with state, user, session, and client methods
 * @throws Error if used outside AuthProvider
 * 
 * @example
 * ```tsx
 * const { user, isAuthenticated, signIn, signOut } = useAuth();
 * 
 * // Sign in
 * await signIn({ email: 'user@example.com', password: 'password' });
 * 
 * // Access user
 * console.log(user?.email);
 * 
 * // Sign out
 * await signOut();
 * ```
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthReactContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

