/**
 * Auth flow client component
 * Renders authentication flows with Next.js integration
 */

'use client';

import { AuthFlow } from '@authsome/ui-react';
import type { AuthFlowClientProps } from '../types';
import { useAuthSync } from '../hooks/useAuthSync';

/**
 * Auth Flow Client Component
 * Renders authentication flows with Next.js integration
 * 
 * Must be used within a NextAuthProvider.
 * 
 * @example
 * ```tsx
 * // app/auth/layout.tsx
 * import { NextAuthProvider } from '@authsome/ui-next';
 * 
 * const config = {
 *   adapter: authsomeAdapter({ apiKey: process.env.AUTHSOME_API_KEY! }),
 *   uiComponents: { Input, Button, Field },
 *   session: { password: process.env.SESSION_SECRET! },
 * };
 * 
 * export default function AuthLayout({ children }) {
 *   return <NextAuthProvider config={config}>{children}</NextAuthProvider>;
 * }
 * 
 * // app/auth/[...auth]/page.tsx
 * import { AuthFlowClient } from '@authsome/ui-next';
 * import { getAuthPageProps } from '@authsome/ui-next/server';
 * 
 * export default async function AuthPage(props) {
 *   const pageProps = await getAuthPageProps(props);
 *   if (pageProps.redirect) redirect(pageProps.redirect);
 *   return <AuthFlowClient {...pageProps} />;
 * }
 * ```
 */
export function AuthFlowClient({
  route: _route,
  initialSession: _initialSession,
  searchParams: _searchParams,
}: AuthFlowClientProps) {
  // Enable auth sync
  useAuthSync({
    pollInterval: 60000,
    enablePolling: true,
  });

  // Render the AuthFlow component from @authsome/ui-react
  // It will use the context provided by NextAuthProvider (which wraps AuthProvider)
  return (
    <div className="auth-flow-container">
      <AuthFlow />
    </div>
  );
}

