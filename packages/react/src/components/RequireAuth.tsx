/**
 * RequireAuth component
 * 
 * Component for protecting routes that require authentication
 */

import React from 'react';
import { useAuth } from '../hooks/useAuth';

export interface RequireAuthProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
  onUnauthenticated?: () => void;
}

/**
 * Require authentication component
 * 
 * Renders children only if authenticated, otherwise shows fallback or redirects
 */
export function RequireAuth({
  children,
  fallback,
  redirectTo,
  onUnauthenticated,
}: RequireAuthProps) {
  const { isAuthenticated, isLoading } = useAuth();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      if (onUnauthenticated) {
        onUnauthenticated();
      } else if (redirectTo) {
        window.location.href = redirectTo;
      }
    }
  }, [isAuthenticated, isLoading, onUnauthenticated, redirectTo]);

  if (isLoading) {
    return fallback || null;
  }

  if (!isAuthenticated) {
    return fallback || null;
  }

  return <>{children}</>;
}

