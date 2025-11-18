/**
 * Client-side route protection hook
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@authsome/ui-react';
import { DEFAULT_BASE_PATH } from '../lib/constants';

export interface UseProtectedRouteOptions {
  /**
   * Redirect URL if not authenticated
   * @default '/auth/signin'
   */
  redirectTo?: string;

  /**
   * Whether to show loading state
   * @default true
   */
  showLoading?: boolean;

  /**
   * Callback when authentication is required
   */
  onUnauthenticated?: () => void;

  /**
   * Callback when authentication is successful
   */
  onAuthenticated?: () => void;
}

/**
 * Hook for client-side route protection
 * Redirects to sign-in if user is not authenticated
 * 
 * @param options - Protection options
 * @returns Object with isLoading and isAuthenticated states
 * 
 * @example
 * ```tsx
 * 'use client';
 * 
 * export default function DashboardPage() {
 *   const { isLoading, isAuthenticated } = useProtectedRoute({
 *     redirectTo: '/auth/signin',
 *   });
 * 
 *   if (isLoading) {
 *     return <div>Loading...</div>;
 *   }
 * 
 *   return <div>Protected Content</div>;
 * }
 * ```
 */
export function useProtectedRoute(options: UseProtectedRouteOptions = {}) {
  const {
    redirectTo = `${DEFAULT_BASE_PATH}/signin`,
    showLoading = true,
    onUnauthenticated,
    onAuthenticated,
  } = options;

  const router = useRouter();
  const pathname = usePathname();
  const auth = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      if (auth.isLoading) {
        return;
      }

      if (!auth.isAuthenticated) {
        // User not authenticated
        if (onUnauthenticated) {
          onUnauthenticated();
        }

        // Build redirect URL with callback
        const redirectUrl = new URL(redirectTo, window.location.origin);
        redirectUrl.searchParams.set('callbackUrl', pathname);
        router.replace(redirectUrl.pathname + redirectUrl.search);
      } else {
        // User authenticated
        if (onAuthenticated) {
          onAuthenticated();
        }

        setIsChecking(false);
      }
    };

    checkAuth();
  }, [
    auth.isAuthenticated,
    auth.isLoading,
    pathname,
    redirectTo,
    router,
    onUnauthenticated,
    onAuthenticated,
  ]);

  return {
    isLoading: showLoading ? (auth.isLoading || isChecking) : false,
    isAuthenticated: auth.isAuthenticated,
    user: auth.user,
  };
}

/**
 * Hook to check if user has specific permissions
 * Useful for role-based access control
 * 
 * @param requiredPermissions - Array of required permissions
 * @param options - Protection options
 * @returns Object with hasPermission and isLoading states
 * 
 * @example
 * ```tsx
 * function AdminPanel() {
 *   const { hasPermission, isLoading } = useRequirePermissions(['admin'], {
 *     redirectTo: '/unauthorized',
 *   });
 * 
 *   if (isLoading) return <div>Loading...</div>;
 *   if (!hasPermission) return null;
 * 
 *   return <div>Admin Content</div>;
 * }
 * ```
 */
export function useRequirePermissions(
  requiredPermissions: string[],
  options: UseProtectedRouteOptions = {}
) {
  const {
    redirectTo = '/unauthorized',
    showLoading = true,
    onUnauthenticated,
  } = options;

  const router = useRouter();
  const auth = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    const checkPermissions = async () => {
      if (auth.isLoading) {
        return;
      }

      if (!auth.isAuthenticated || !auth.user) {
        if (onUnauthenticated) {
          onUnauthenticated();
        }
        router.replace(redirectTo);
        return;
      }

      // Check if user has required permissions
      // This assumes the user object has a permissions or role field
      const userPermissions = (auth.user as any).permissions || [];
      const userRole = (auth.user as any).organizationRole || (auth.user as any).role;

      // Check if user has all required permissions
      const hasAll = requiredPermissions.every(
        (permission) =>
          userPermissions.includes(permission) ||
          permission === userRole
      );

      if (!hasAll) {
        router.replace(redirectTo);
        setHasPermission(false);
      } else {
        setHasPermission(true);
      }

      setIsChecking(false);
    };

    checkPermissions();
  }, [
    auth.isAuthenticated,
    auth.isLoading,
    auth.user,
    requiredPermissions,
    redirectTo,
    router,
    onUnauthenticated,
  ]);

  return {
    hasPermission,
    isLoading: showLoading ? (auth.isLoading || isChecking) : false,
    user: auth.user,
  };
}

