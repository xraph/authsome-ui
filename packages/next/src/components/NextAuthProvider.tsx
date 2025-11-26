/**
 * Next.js Auth Provider
 * Wraps React AuthProvider with Next.js-specific configuration
 */

'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@authsome/ui-react';
import { predefinedFlows, FlowConfigType, FlowStep } from '@authsome/ui-core';
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
  const pathname = usePathname();
  
  // Create Next.js-specific client that uses server actions
  const nextClient = React.useMemo(
    () => createNextAuthClient(config.adapter),
    [config.adapter]
  );

  // Determine flow and initial state based on pathname
  const { flows, initialFlowState, routeKey } = React.useMemo(() => {
    // If config has explicit flows, use them
    if (config.flows) {
      return {
        flows: config.flows,
        initialFlowState: config.initialFlowState,
        routeKey: 'custom',
      };
    }

    // Map pathname to appropriate flow
    const basePath = config.basePath || '/auth';
    if (pathname?.startsWith(basePath)) {
      const route = pathname.slice(basePath.length + 1).split('/')[0] || '';
      
      switch (route) {
        case 'forgot-password':
        case 'reset-password':
          return {
            flows: predefinedFlows[FlowConfigType.PASSWORD_RESET_FLOW],
            initialFlowState: route === 'reset-password' 
              ? { currentStep: FlowStep.PASSWORD_RESET_CONFIRM }
              : { currentStep: FlowStep.PASSWORD_RESET_REQUEST },
            routeKey: route,
          };
        
        case 'verify-email':
          // Use email verification flow
          return {
            flows: predefinedFlows[FlowConfigType.EMAIL_VERIFICATION_FLOW],
            initialFlowState: { currentStep: FlowStep.EMAIL_VERIFICATION_REQUIRED },
            routeKey: 'verify-email',
          };
        
        case 'signup':
          return {
            flows: predefinedFlows[FlowConfigType.COMPLETE_SIGN_UP_FLOW],
            initialFlowState: { currentStep: FlowStep.EMAIL_PASSWORD_SIGN_UP },
            routeKey: 'signup',
          };
        
        case 'signin':
        default:
          return {
            flows: predefinedFlows[FlowConfigType.SIGN_IN_WITH_MFA],
            initialFlowState: config.initialFlowState || { currentStep: FlowStep.EMAIL_PASSWORD_SIGN_IN },
            routeKey: 'signin',
          };
      }
    }

    // Default to sign-in with MFA flow
    return {
      flows: predefinedFlows[FlowConfigType.SIGN_IN_WITH_MFA],
      initialFlowState: config.initialFlowState,
      routeKey: 'default',
    };
  }, [pathname, config.basePath, config.flows, config.initialFlowState]);

  return (
    <AuthProvider
      key={routeKey}
      client={nextClient}
      flows={flows}
      initialFlowState={initialFlowState}
      uiComponents={config.uiComponents}
      rendererConfig={config.rendererConfig}
      locale={config.locale}
      onFlowStateChange={config.onFlowStateChange}
      onOrganizationChange={config.onOrganizationChange}
    >
      {children}
    </AuthProvider>
  );
}

