/**
 * @authsome/ui-react-headless
 * 
 * Unstyled, accessible React components for AuthSome UI
 */

// Export all components
export * from './components';

// Re-export hooks from @authsome/ui-react for convenience
export {
  useAuth,
  useUser,
  useSession,
  useSignIn,
  useSignUp,
  useSignOut,
  useOAuth,
  useMagicLink,
  use2FA,
  usePasskey,
  usePhoneAuth,
  useUsernameAuth,
  useRequireAuth,
} from '@authsome/ui-react';

// Re-export context
export { AuthProvider } from '@authsome/ui-react';

// Re-export types
export type {
  User,
  Session,
  AuthState,
  AuthError,
  OAuthProvider,
  TwoFactorMethod,
  PasskeyCredential,
} from '@authsome/ui-core';

