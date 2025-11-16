# @authsome/ui-core

Framework-agnostic authentication core for AuthSome UI.

## Installation

```bash
pnpm add @authsome/ui-core
```

## Features

- **Provider Adapters**: Built-in support for AuthSome, Clerk, Supabase, and custom backends
- **Observable State**: Framework-agnostic state management
- **Complete Auth Flows**: Email/password, OAuth, magic links, 2FA, passkeys, phone auth
- **Type Safe**: Full TypeScript support
- **Zero Dependencies**: Minimal footprint

## Usage

### Basic Setup with AuthSome

```typescript
import { AuthClient, AuthSomeAdapter } from '@authsome/ui-core';

// Create adapter
const adapter = new AuthSomeAdapter();
await adapter.initialize({
  apiUrl: 'https://your-api.com/auth',
});

// Create client
const authClient = new AuthClient({
  provider: adapter,
  autoRefresh: true,
});

// Initialize
await authClient.initialize();

// Subscribe to auth state
const unsubscribe = authClient.subscribe((state) => {
  console.log('Auth state:', state);
});

// Sign in
await authClient.signIn({
  email: 'user@example.com',
  password: 'password',
});
```

### Using with Clerk

```typescript
import { AuthClient, ClerkAdapter } from '@authsome/ui-core';

const adapter = new ClerkAdapter();
await adapter.initialize({
  publishableKey: 'pk_test_...',
});

const authClient = new AuthClient({ provider: adapter });
```

### Using with Supabase

```typescript
import { AuthClient, SupabaseAdapter } from '@authsome/ui-core';

const adapter = new SupabaseAdapter();
await adapter.initialize({
  url: 'https://your-project.supabase.co',
  anonKey: 'your-anon-key',
});

const authClient = new AuthClient({ provider: adapter });
```

### Custom Backend

```typescript
import { AuthClient, GenericAdapter } from '@authsome/ui-core';

const adapter = new GenericAdapter();
await adapter.initialize({
  baseUrl: 'https://your-api.com',
  endpoints: {
    signIn: '/auth/login',
    signUp: '/auth/register',
    signOut: '/auth/logout',
    getCurrentUser: '/auth/me',
    // ... other endpoints
  },
  transforms: {
    transformAuthResponse: (res) => ({
      user: res.user,
      session: res.session,
    }),
  },
});

const authClient = new AuthClient({ provider: adapter });
```

## API Reference

### AuthClient

The main authentication client.

```typescript
const client = new AuthClient({
  provider: adapter,
  autoRefresh: true, // Auto-refresh sessions
  refreshInterval: 300000, // 5 minutes
});
```

### Methods

- `initialize()`: Initialize the client and restore session
- `signIn(request)`: Sign in with credentials
- `signUp(request)`: Register a new user
- `signOut()`: Sign out current user
- `updateUser(request)`: Update user profile
- `changePassword(request)`: Change user password
- `requestPasswordReset(request)`: Request password reset email
- `confirmPasswordReset(request)`: Confirm password reset with token
- `getOAuthUrl(request)`: Get OAuth authorization URL
- `handleOAuthCallback(request)`: Handle OAuth callback
- `sendMagicLink(request)`: Send magic link email
- `verifyMagicLink(request)`: Verify magic link token
- `sendPhoneCode(request)`: Send phone verification code
- `verifyPhoneCode(request)`: Verify phone code
- `setupTwoFactor(request)`: Setup 2FA
- `verifyTwoFactor(request)`: Verify 2FA code
- `disableTwoFactor()`: Disable 2FA
- `getTwoFactorStatus()`: Get enabled 2FA methods
- `registerPasskey(request)`: Register a passkey
- `authenticatePasskey(request)`: Authenticate with passkey
- `listPasskeys()`: List user's passkeys
- `deletePasskey(id)`: Delete a passkey
- `refreshSession()`: Manually refresh session
- `subscribe(listener)`: Subscribe to auth state changes
- `destroy()`: Cleanup resources

### Auth State

```typescript
interface AuthContext {
  state: AuthState; // AUTHENTICATED | UNAUTHENTICATED | LOADING | ERROR
  user: User | null;
  session: Session | null;
  error: AuthError | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
```

## License

MIT

