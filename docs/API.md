# API Reference

Complete API documentation for AuthSome UI.

## Table of Contents

- [Core](#core)
  - [AuthClient](#authclient)
  - [Adapters](#adapters)
- [React](#react)
  - [AuthProvider](#authprovider)
  - [Hooks](#hooks)
  - [Components](#components)
- [Types](#types)

## Core

### AuthClient

Main client for managing authentication.

#### Constructor

```typescript
new AuthClient(config: AuthClientConfig)
```

**Parameters:**

- `config.provider`: `AuthProvider` - Auth provider instance
- `config.storage?`: `AuthStorage` - Storage adapter (default: localStorage)
- `config.autoRefresh?`: `boolean` - Enable automatic token refresh (default: false)
- `config.refreshInterval?`: `number` - Refresh interval in milliseconds (default: 300000)

#### Methods

##### signIn

```typescript
signIn(credentials: SignInCredentials): Promise<AuthResponse>
```

Sign in a user with email/password or username/password.

**Parameters:**
- `credentials.email` or `credentials.username`: string
- `credentials.password`: string

**Returns:** Promise resolving to `AuthResponse`

**Throws:** `AuthError` on invalid credentials or network error

##### signUp

```typescript
signUp(data: SignUpData): Promise<AuthResponse>
```

Create a new user account.

**Parameters:**
- `data.email`: string
- `data.password`: string
- `data.username?`: string
- `data.metadata?`: Record<string, any>

##### signOut

```typescript
signOut(): Promise<void>
```

Sign out the current user and clear session.

##### getCurrentUser

```typescript
getCurrentUser(): Promise<User | null>
```

Get the currently authenticated user.

##### getCurrentSession

```typescript
getCurrentSession(): Promise<Session | null>
```

Get the current session.

##### refreshSession

```typescript
refreshSession(): Promise<AuthResponse>
```

Manually refresh the current session.

##### OAuth Methods

```typescript
initializeOAuth(provider: OAuthProvider, options?: OAuthOptions): Promise<OAuthInitResponse>
handleOAuthCallback(params: OAuthCallbackParams): Promise<AuthResponse>
```

##### Magic Link Methods

```typescript
sendMagicLink(email: string, options?: MagicLinkOptions): Promise<void>
verifyMagicLink(token: string): Promise<AuthResponse>
```

##### Two-Factor Authentication

```typescript
setup2FA(method: TwoFactorMethod): Promise<TwoFactorSetupResponse>
verify2FA(code: string, method?: TwoFactorMethod): Promise<AuthResponse>
disable2FA(code: string): Promise<void>
```

##### Passkey Methods

```typescript
registerPasskey(): Promise<PasskeyRegistrationResponse>
authenticateWithPasskey(options?: PasskeyOptions): Promise<AuthResponse>
listPasskeys(): Promise<Passkey[]>
deletePasskey(passkeyId: string): Promise<void>
```

##### Phone Authentication

```typescript
sendPhoneVerification(phoneNumber: string): Promise<void>
verifyPhone(code: string): Promise<AuthResponse>
```

##### State Management

```typescript
subscribe(callback: (state: AuthState) => void): () => void
getState(): AuthState
```

### Adapters

#### AuthSomeAdapter

```typescript
import { AuthSomeAdapter } from '@authsome/ui-core';

const adapter = new AuthSomeAdapter({
  apiUrl: 'http://localhost:8080/api/auth',
  timeout?: 30000,
  headers?: Record<string, string>,
});
```

#### SupabaseAdapter

```typescript
import { SupabaseAdapter } from '@authsome/ui-core';

const adapter = new SupabaseAdapter({
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});
```

#### ClerkAdapter

```typescript
import { ClerkAdapter } from '@authsome/ui-core';

const adapter = new ClerkAdapter({
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
});
```

#### GenericAdapter

```typescript
import { GenericAdapter } from '@authsome/ui-core';

const adapter = new GenericAdapter({
  baseUrl: 'https://api.example.com',
  endpoints: {
    signIn: '/auth/login',
    signUp: '/auth/register',
    signOut: '/auth/logout',
    getCurrentUser: '/auth/me',
    getCurrentSession: '/auth/session',
    refreshSession: '/auth/refresh',
    // ... other endpoints
  },
  transformers?: {
    user: (data) => ({ /* transform user data */ }),
    session: (data) => ({ /* transform session data */ }),
  },
});
```

## React

### AuthProvider

Context provider that makes auth state available to child components.

```typescript
import { AuthProvider } from '@authsome-ui/react';

<AuthProvider client={authClient}>
  {children}
</AuthProvider>
```

**Props:**
- `client`: `AuthClient` (required) - Auth client instance
- `children`: `ReactNode` (required)

### Hooks

#### useAuth

Access auth state and methods.

```typescript
import { useAuth } from '@authsome-ui/react';

const {
  user,
  session,
  isAuthenticated,
  isLoading,
  error,
  signIn,
  signUp,
  signOut,
  client,
} = useAuth();
```

**Returns:**
- `user`: `User | null` - Current user
- `session`: `Session | null` - Current session
- `isAuthenticated`: `boolean` - Whether user is authenticated
- `isLoading`: `boolean` - Loading state
- `error`: `AuthError | null` - Last error
- `signIn`: Function - Sign in method
- `signUp`: Function - Sign up method
- `signOut`: Function - Sign out method
- `client`: `AuthClient` - Auth client instance

#### useUser

Get current user.

```typescript
import { useUser } from '@authsome-ui/react';

const user = useUser();
```

#### useSession

Get current session.

```typescript
import { useSession } from '@authsome-ui/react';

const session = useSession();
```

#### useSignIn

Handle sign-in logic.

```typescript
import { useSignIn } from '@authsome-ui/react';

const { signIn, loading, error } = useSignIn();

await signIn({ email: 'user@example.com', password: 'password' });
```

#### useSignUp

Handle sign-up logic.

```typescript
import { useSignUp } from '@authsome-ui/react';

const { signUp, loading, error } = useSignUp();

await signUp({ email: 'user@example.com', password: 'password' });
```

#### useOAuth

Manage OAuth flows.

```typescript
import { useOAuth } from '@authsome-ui/react';

const { initiate, handleCallback, loading, error } = useOAuth();

// Initiate OAuth flow
await initiate('google', { redirectUri: '/dashboard' });

// Handle callback (in callback page)
await handleCallback(searchParams);
```

#### useMagicLink

Magic link authentication.

```typescript
import { useMagicLink } from '@authsome-ui/react';

const { send, verify, loading, error } = useMagicLink();

// Send magic link
await send('user@example.com');

// Verify magic link
await verify(token);
```

#### use2FA

Two-factor authentication.

```typescript
import { use2FA } from '@authsome-ui/react';

const { setup, verify, disable, loading, error } = use2FA();

// Setup 2FA
const { secret, qrCode } = await setup('totp');

// Verify code
await verify('123456');

// Disable 2FA
await disable('123456');
```

#### usePasskey

Passkey authentication.

```typescript
import { usePasskey } from '@authsome-ui/react';

const { register, authenticate, list, remove, loading, error } = usePasskey();

// Register new passkey
await register();

// Authenticate with passkey
await authenticate();

// List passkeys
const passkeys = await list();

// Remove passkey
await remove(passkeyId);
```

#### usePhoneAuth

Phone number authentication.

```typescript
import { usePhoneAuth } from '@authsome-ui/react';

const { sendCode, verify, loading, error } = usePhoneAuth();

// Send verification code
await sendCode('+1234567890');

// Verify code
await verify('123456');
```

#### useRequireAuth

Programmatic auth check.

```typescript
import { useRequireAuth } from '@authsome-ui/react';

// Redirects to /login if not authenticated
useRequireAuth({ fallback: '/login' });
```

### Components

#### RequireAuth

Protect routes and components.

```typescript
import { RequireAuth } from '@authsome-ui/react';

<RequireAuth
  fallback="/login"
  loading={<LoadingSpinner />}
  onUnauthorized={() => console.log('Unauthorized')}
>
  <ProtectedContent />
</RequireAuth>
```

**Props:**
- `fallback?`: `string` - Redirect path for unauthorized users
- `loading?`: `ReactNode` - Loading component
- `onUnauthorized?`: `() => void` - Callback on unauthorized access
- `children`: `ReactNode` - Protected content

#### withAuth

HOC for protecting components.

```typescript
import { withAuth } from '@authsome-ui/react';

const ProtectedComponent = withAuth(MyComponent, {
  fallback: '/login',
  onUnauthorized: () => console.log('Unauthorized'),
});
```

## Types

### User

```typescript
interface User {
  id: string;
  email: string;
  username?: string;
  emailVerified: boolean;
  phoneNumber?: string;
  phoneVerified?: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
```

### Session

```typescript
interface Session {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expiresAt: string;
  metadata?: Record<string, any>;
}
```

### AuthError

```typescript
class AuthError extends Error {
  code: string;
  statusCode: number;
  details?: any;
}
```

**Common Error Codes:**
- `INVALID_CREDENTIALS` - Invalid email/password
- `USER_NOT_FOUND` - User doesn't exist
- `EMAIL_ALREADY_EXISTS` - Email already registered
- `NETWORK_ERROR` - Network request failed
- `INVALID_TOKEN` - Token is invalid or expired
- `2FA_REQUIRED` - Two-factor authentication required
- `2FA_INVALID` - Invalid 2FA code

### OAuthProvider

```typescript
type OAuthProvider = 
  | 'google'
  | 'github'
  | 'microsoft'
  | 'facebook'
  | 'apple'
  | 'twitter'
  | 'discord'
  | 'slack';
```

### TwoFactorMethod

```typescript
type TwoFactorMethod = 'totp' | 'sms' | 'email';
```

For more examples and detailed usage, see the [Getting Started Guide](/docs/GETTING_STARTED.md).

