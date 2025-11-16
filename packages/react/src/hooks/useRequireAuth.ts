/**
 * useRequireAuth hook
 * 
 * Hook for programmatically requiring authentication
 */

import { useEffect } from 'react';
import { useAuth } from './useAuth';

export interface UseRequireAuthOptions {
  redirectTo?: string;
  onUnauthenticated?: () => void;
}

/**
 * Require authentication
 * 
 * Redirects to login or calls callback if user is not authenticated
 */
export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      if (options.onUnauthenticated) {
        options.onUnauthenticated();
      } else if (options.redirectTo) {
        window.location.href = options.redirectTo;
      }
    }
  }, [isAuthenticated, isLoading, options]);

  return { isAuthenticated, isLoading };
}

