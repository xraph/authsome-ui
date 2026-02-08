/**
 * Auth flow client component
 * Renders authentication flows with Next.js integration
 */

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AuthFlow, AuthProvider, useFlow, ErrorRenderer } from '@authsome/ui-react';
import { predefinedFlows, FlowConfigType, FlowStep, AuthError, AuthErrorType } from '@authsome/ui-core';
import { useAuth } from '@authsome/ui-react';
import type { AuthFlowClientProps } from '../types';

/**
 * Extract and parse error information from search parameters
 * Converts URL error parameters into an AuthError object for display
 * 
 * @param searchParams - URL search parameters from Next.js
 * @returns AuthError object or null if no error found
 */
function extractErrorFromSearchParams(
  searchParams?: Record<string, string | string[]>
): AuthError | null {
  if (!searchParams) return null;

  // Extract error parameters
  const errorMessage = Array.isArray(searchParams.error) 
    ? searchParams.error[0] 
    : searchParams.error;
  
  const errorDescription = Array.isArray(searchParams.error_description)
    ? searchParams.error_description[0]
    : searchParams.error_description;
  
  const errorType = Array.isArray(searchParams.error_type)
    ? searchParams.error_type[0]
    : searchParams.error_type;
  
  const errorCode = Array.isArray(searchParams.error_code)
    ? searchParams.error_code[0]
    : searchParams.error_code;

  // No error found
  if (!errorMessage && !errorDescription) return null;

  // Determine the message to display
  const message = errorDescription || errorMessage || 'An error occurred during authentication';

  // Map error type string to AuthErrorType enum
  let type = AuthErrorType.UNKNOWN_ERROR;
  if (errorType) {
    // Try to match to AuthErrorType enum values
    const normalizedType = errorType.toUpperCase();
    if (normalizedType in AuthErrorType) {
      type = AuthErrorType[normalizedType as keyof typeof AuthErrorType];
    }
  }

  // Create and return AuthError
  return new AuthError(message, type, {
    code: errorCode,
    details: {
      source: 'url_params',
      originalError: errorMessage,
      description: errorDescription,
    },
  });
}

/**
 * Route-specific Auth Provider Wrapper
 * Creates a fresh provider for each route type
 */
function RouteAuthProvider({
  route,
  searchParams,
  children,
}: {
  route: AuthFlowClientProps['route'];
  searchParams?: Record<string, string | string[]>;
  children: React.ReactNode;
}) {
  const parentAuth = useAuth();
  
  // Get flow configuration based on route type
  const { flows, initialFlowState } = React.useMemo(() => {
    switch (route.type) {
      case 'error': {
        // Extract error from search params
        const error = extractErrorFromSearchParams(searchParams);
        
        // Use sign-in flow as base (allows navigation back to sign-in)
        // but start at ERROR step with error data
        return {
          flows: predefinedFlows[FlowConfigType.SIGN_IN_WITH_MFA],
          initialFlowState: {
            currentStep: FlowStep.ERROR,
            error: error || new AuthError(
              'An unknown error occurred',
              AuthErrorType.UNKNOWN_ERROR
            ),
          },
        };
      }

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

      case 'cli-login': {
        // Extract user code from URL params if provided (e.g., ?code=XXXX-XXXX)
        const userCode = searchParams?.code 
          ? (Array.isArray(searchParams.code) ? searchParams.code[0] : searchParams.code)
          : undefined;
        
        return {
          flows: predefinedFlows[FlowConfigType.DEVICE_FLOW],
          initialFlowState: { 
            currentStep: FlowStep.DEVICE_CODE_ENTRY,
            ...(userCode && { userCode }),
          },
        };
      }

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
  }, [route.type, searchParams]);

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
/**
 * Error Component with Next.js Navigation
 * Wraps ErrorRenderer with Next.js router navigation
 */
function NextJSErrorRenderer({ 
  error, 
  signInPath 
}: { 
  error: AuthError; 
  signInPath: string;
}) {
  const router = useRouter();
  const { uiComponents, rendererConfig } = useFlow();
  
  const handleBackToSignIn = React.useCallback(() => {
    router.push(signInPath);
  }, [router, signInPath]);
  
  if (!uiComponents) {
    // Fallback error display
    return (
      <div className="space-y-6 text-center py-6">
        <div className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
          <span className="text-4xl text-red-500">✗</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Error</h2>
          <p className="text-gray-600 mt-2">{error.message || 'An error occurred'}</p>
        </div>
        <button 
          onClick={handleBackToSignIn}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Return to Sign In
        </button>
      </div>
    );
  }
  
  return (
    <ErrorRenderer 
      error={error}
      uiComponents={uiComponents}
      rendererConfig={rendererConfig}
      onBack={handleBackToSignIn}
      onRetry={handleBackToSignIn}
    />
  );
}

export function AuthFlowClient({
  route,
  initialSession: _initialSession,
  searchParams,
}: AuthFlowClientProps) {
  // Note: Session sync removed to avoid bundling server code in client bundle
  // The AuthProvider from @authsome/ui-react handles its own state management
  // Users can implement custom session sync if needed using fetch() API

  const isErrorRoute = route.type === 'error';
  
  // Get sign-in path from config or use default
  const parentAuth = useAuth();
  const signInPath = parentAuth.rendererConfig?.signIn?.signInPath || '/auth/signin';

  // Wrap with route-specific provider that remounts on route change
  return (
    <RouteAuthProvider 
      key={route.type} 
      route={route}
      searchParams={searchParams}
    >
      <div className="auth-flow-container">
        {isErrorRoute ? (
          <AuthFlow 
            errorComponent={(props) => (
              <NextJSErrorRenderer 
                error={props.error}
                signInPath={signInPath}
              />
            )}
          />
        ) : (
          <AuthFlow />
        )}
      </div>
    </RouteAuthProvider>
  );
}

