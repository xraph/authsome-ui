/**
 * Protected route component
 * Wraps content that requires authentication
 */

'use client';

import type { ProtectedRouteProps } from '../types';
import { useProtectedRoute } from '../hooks/useProtectedRoute';

/**
 * Protected Route Component
 * Renders children only if user is authenticated
 * Shows fallback while checking auth status
 * 
 * @example
 * ```tsx
 * import { ProtectedRoute } from '@authsome/ui-next';
 * 
 * export default function DashboardLayout({ children }) {
 *   return (
 *     <ProtectedRoute fallback={<div>Loading...</div>}>
 *       {children}
 *     </ProtectedRoute>
 *   );
 * }
 * ```
 */
export function ProtectedRoute({
  children,
  fallback,
  redirectTo,
}: ProtectedRouteProps) {
  const { isLoading, isAuthenticated } = useProtectedRoute({
    redirectTo,
    showLoading: true,
  });

  // Show fallback while loading
  if (isLoading) {
    return <>{fallback || <DefaultLoadingFallback />}</>;
  }

  // Render children if authenticated
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Should not reach here due to redirect in useProtectedRoute
  return null;
}

/**
 * Default loading fallback
 */
function DefaultLoadingFallback() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            margin: '0 auto 16px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <p style={{ color: '#666' }}>Loading...</p>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    </div>
  );
}

