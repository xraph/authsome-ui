/**
 * Next.js Auth Provider
 * Wraps React AuthProvider with Next.js-specific configuration
 */

'use client';

import * as React from 'react';
import { AuthProvider } from '@authsome/ui-react';
import { createNextAuthClient } from '../lib/create-next-client';
import type { NextAuthConfig } from '../types';

/**
 * Next.js Auth Provider Props
 */
export interface NextAuthProviderProps {
  /**
   * Next.js auth configuration
   */
  config: NextAuthConfig;

  /**
   * Child components
   */
  children: React.ReactNode;
}

/**
 * Next.js Auth Provider
 * 
 * Wraps your app or auth routes with the React AuthProvider and provides 
 * Next.js-specific configuration. Can be placed at the root layout or 
 * auth-specific layout depending on your needs.
 * 
 * @example
 * ```tsx
 * // app/layout.tsx - Root level (entire app has access to auth)
 * import { NextAuthProvider } from '@authsome/ui-next';
 * 
 * const config = {
 *   adapter: authsomeAdapter({ apiKey: process.env.AUTHSOME_API_KEY! }),
 *   uiComponents: { Input, Button, Field },
 *   session: { password: process.env.SESSION_SECRET! },
 * };
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <NextAuthProvider config={config}>
 *           {children}
 *         </NextAuthProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 * 
 * @example
 * ```tsx
 * // app/auth/layout.tsx - Auth-specific (only auth routes have access)
 * import { NextAuthProvider } from '@authsome/ui-next';
 * 
 * const config = {
 *   adapter: authsomeAdapter({ apiKey: process.env.AUTHSOME_API_KEY! }),
 *   uiComponents: { Input, Button, Field },
 *   session: { password: process.env.SESSION_SECRET! },
 * };
 * 
 * export default function AuthLayout({ children }) {
 *   return (
 *     <NextAuthProvider config={config}>
 *       {children}
 *     </NextAuthProvider>
 *   );
 * }
 * ```
 */
export function NextAuthProvider({ config, children }: NextAuthProviderProps) {
  // Create Next.js-specific client that uses server actions
  const nextClient = React.useMemo(
    () => createNextAuthClient(config.adapter),
    [config.adapter]
  );

  return (
    <AuthProvider
      client={nextClient}
      uiComponents={config.uiComponents}
      rendererConfig={config.rendererConfig}
    >
      {children}
    </AuthProvider>
  );
}

