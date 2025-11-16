# @authsome/ui-react

React bindings for AuthSome UI.

## Installation

```bash
pnpm add @authsome/ui-react @authsome/ui-core
```

## Usage

### Setup

Wrap your app with the `AuthProvider`:

```tsx
import { AuthProvider } from '@authsome/ui-react';
import { AuthClient, AuthSomeAdapter } from '@authsome/ui-core';

// Create adapter
const adapter = new AuthSomeAdapter();
await adapter.initialize({
  apiUrl: 'https://your-api.com/auth',
});

// Create client
const authClient = new AuthClient({
  provider: adapter,
});

function App() {
  return (
    <AuthProvider client={authClient}>
      <YourApp />
    </AuthProvider>
  );
}
```

### Hooks

#### useAuth()

Access auth state and methods:

```tsx
import { useAuth } from '@authsome/ui-react';

function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please sign in</div>;

  return <div>Hello {user.email}</div>;
}
```

#### useSignIn()

Sign in users:

```tsx
import { useSignIn } from '@authsome/ui-react';

function SignInForm() {
  const { signIn, isLoading, error } = useSignIn();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    await signIn({
      email: formData.get('email'),
      password: formData.get('password'),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>
      {error && <div>{error.message}</div>}
    </form>
  );
}
```

#### useSignUp()

Register new users:

```tsx
import { useSignUp } from '@authsome/ui-react';

function SignUpForm() {
  const { signUp, isLoading, error } = useSignUp();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    await signUp({
      email: formData.get('email'),
      password: formData.get('password'),
    });
  };

  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
}
```

#### useOAuth()

OAuth authentication:

```tsx
import { useOAuth } from '@authsome/ui-react';

function OAuthButtons() {
  const { providers, signIn } = useOAuth();

  return (
    <div>
      {providers.map((provider) => (
        <button
          key={provider}
          onClick={() => signIn(provider, '/dashboard')}
        >
          Sign in with {provider}
        </button>
      ))}
    </div>
  );
}
```

#### useMagicLink()

Passwordless magic link auth:

```tsx
import { useMagicLink } from '@authsome/ui-react';

function MagicLinkForm() {
  const { sendMagicLink, isSent, isLoading } = useMagicLink();

  if (isSent) {
    return <div>Check your email for the magic link!</div>;
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        await sendMagicLink(email);
      }}
    >
      <input name="email" type="email" required />
      <button type="submit" disabled={isLoading}>
        Send Magic Link
      </button>
    </form>
  );
}
```

#### use2FA()

Two-factor authentication:

```tsx
import { use2FA } from '@authsome/ui-react';

function TwoFactorSetup() {
  const { setup, verify, enabledMethods } = use2FA();

  const handleSetup = async () => {
    const response = await setup('totp');
    // Show QR code: response.qrCode
    // Save backup codes: response.backupCodes
  };

  return <div>{/* ... */}</div>;
}
```

#### usePasskey()

WebAuthn/Passkey authentication:

```tsx
import { usePasskey } from '@authsome/ui-react';

function PasskeyManager() {
  const { passkeys, register, authenticate, remove } = usePasskey();

  return (
    <div>
      <button onClick={() => register('My Device')}>
        Register Passkey
      </button>
      <button onClick={() => authenticate()}>
        Sign in with Passkey
      </button>
      {passkeys.map((pk) => (
        <div key={pk.id}>
          {pk.name}
          <button onClick={() => remove(pk.id)}>Remove</button>
        </div>
      ))}
    </div>
  );
}
```

### Components

#### RequireAuth

Protect routes:

```tsx
import { RequireAuth } from '@authsome/ui-react';

function Dashboard() {
  return (
    <RequireAuth
      fallback={<div>Loading...</div>}
      redirectTo="/signin"
    >
      <div>Protected content</div>
    </RequireAuth>
  );
}
```

#### withAuth HOC

Wrap components:

```tsx
import { withAuth } from '@authsome/ui-react';

const ProtectedComponent = withAuth(MyComponent, {
  redirectTo: '/signin',
  fallback: LoadingSpinner,
});
```

## Available Hooks

- `useAuth()` - Access auth state and client
- `useUser()` - Get current user
- `useSession()` - Get current session
- `useSignIn()` - Sign in functionality
- `useSignUp()` - Sign up functionality
- `useSignOut()` - Sign out functionality
- `useOAuth()` - OAuth authentication
- `useMagicLink()` - Magic link auth
- `use2FA()` - Two-factor authentication
- `usePasskey()` - Passkey/WebAuthn
- `usePhoneAuth()` - Phone number auth
- `useUsernameAuth()` - Username-based auth
- `useRequireAuth()` - Programmatic auth guard

## License

MIT

