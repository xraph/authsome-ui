/**
 * Auth flow client component
 * Renders authentication flows with Next.js integration
 */

'use client';

import * as React from 'react';
import { AuthFlow, AuthProvider } from '@authsome/ui-react';
import { predefinedFlows, FlowConfigType, FlowStep } from '@authsome/ui-core';
import { useAuth } from '@authsome/ui-react';
import type { AuthFlowClientProps } from '../types';

/**
 * Route-specific Auth Provider Wrapper
 * Creates a fresh provider for each route type
 */
function RouteAuthProvider({
  route,
  children,
}: {
  route: AuthFlowClientProps['route'];
  children: React.ReactNode;
}) {
  const parentAuth = useAuth();
  
  // Get flow configuration based on route type
  const { flows, initialFlowState } = React.useMemo(() => {
    switch (route.type) {
      case 'forgot-password':
      case 'reset-password':
        return {
          flows: predefinedFlows[FlowConfigType.PASSWORD_RESET_FLOW],
          initialFlowState: {
            currentStep:
              route.type === 'reset-password'
                ? FlowStep.PASSWORD_RESET_CONFIRM
                : FlowStep.PASSWORD_RESET_REQUEST,
          },
        };

      case 'verify-email':
      case 'verify':
        return {
          flows: predefinedFlows[FlowConfigType.EMAIL_VERIFICATION_FLOW],
          initialFlowState: { currentStep: FlowStep.EMAIL_VERIFICATION_REQUIRED },
        };

      case 'signup':
        return {
          flows: predefinedFlows[FlowConfigType.COMPLETE_SIGN_UP_FLOW],
          initialFlowState: { currentStep: FlowStep.EMAIL_PASSWORD_SIGN_UP },
        };

      case 'signin':
      default:
        return {
          flows: predefinedFlows[FlowConfigType.SIGN_IN_WITH_MFA],
          initialFlowState: { currentStep: FlowStep.EMAIL_PASSWORD_SIGN_IN },
        };
    }
  }, [route.type]);

  // Reuse the client, UI components, and config from parent
  // Note: locale is already merged into rendererConfig.locale by the parent AuthProvider
  return (
    <AuthProvider
      client={parentAuth.client}
      flows={flows}
      initialFlowState={initialFlowState}
      uiComponents={parentAuth.uiComponents}
      rendererConfig={parentAuth.rendererConfig}
    >
      {children}
    </AuthProvider>
  );
}

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
  route,
  initialSession: _initialSession,
  searchParams: _searchParams,
}: AuthFlowClientProps) {
  // Note: Session sync removed to avoid bundling server code in client bundle
  // The AuthProvider from @authsome/ui-react handles its own state management
  // Users can implement custom session sync if needed using fetch() API

  // Wrap with route-specific provider that remounts on route change
  return (
    <RouteAuthProvider key={route.type} route={route}>
      <div className="auth-flow-container">
        <AuthFlow />
      </div>
    </RouteAuthProvider>
  );
}

