/**
 * Auth Layout - Wraps all /auth/* routes with NextAuthProvider
 * Provides auth context and UI components to all auth pages
 */

import { NextAuthProvider } from '@authsome/ui-next';
import { authConfig } from '@/lib/auth-config';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextAuthProvider config={authConfig}>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="w-full max-w-md px-4">
          {children}
        </div>
      </div>
    </NextAuthProvider>
  );
}

