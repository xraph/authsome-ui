/**
 * withAuth HOC
 * 
 * Higher-order component for protecting components that require authentication
 */

import React from 'react';
import { useAuth } from '../hooks/useAuth';

export interface WithAuthOptions {
  fallback?: React.ComponentType;
  redirectTo?: string;
  onUnauthenticated?: () => void;
}

/**
 * Higher-order component for authentication
 * 
 * Wraps a component and only renders it if authenticated
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthOptions = {}
) {
  return function WithAuthComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();
    const { fallback: Fallback, redirectTo, onUnauthenticated } = options;

    React.useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        if (onUnauthenticated) {
          onUnauthenticated();
        } else if (redirectTo) {
          window.location.href = redirectTo;
        }
      }
    }, [isAuthenticated, isLoading]);

    if (isLoading) {
      return Fallback ? <Fallback /> : null;
    }

    if (!isAuthenticated) {
      return Fallback ? <Fallback /> : null;
    }

    return <Component {...props} />;
  };
}

