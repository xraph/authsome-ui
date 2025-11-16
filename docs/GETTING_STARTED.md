# Getting Started with AuthSome UI

This guide will help you integrate AuthSome UI into your application in minutes.

## Installation

### Install the packages

```bash
# 1. Install core packages
pnpm add @authsome/ui-core @authsome-ui/react

# 2. Install an adapter (choose one or more based on your backend)
pnpm add @authsome-ui/adapter-authsome     # For AuthSome backend
# OR
pnpm add @authsome/adapter-supabase     # For Supabase (uses Supabase JS client)
# OR  
pnpm add @authsome-ui/adapter-clerk        # For Clerk (uses Clerk SDK)
# OR
pnpm add @authsome-ui/adapter-generic      # For any custom backend

# 3. Install UI components (choose one)
pnpm add @authsome-ui/react-shadcn         # Pre-styled components
# OR
pnpm add @authsome-ui/react-headless       # Headless components
```

### Install peer dependencies

```bash
pnpm add react react-dom next

# If using Supabase adapter
pnpm add @supabase/supabase-js

# If using Clerk adapter
pnpm add @clerk/clerk-js
```

## Quick Start with Pre-Styled Components

### 1. Configure Tailwind CSS v4

Add to your `app/globals.css`:

```css
@import "tailwindcss";

@theme {
  /* Your custom design tokens */
  --color-primary: 222.2 47.4% 11.2%;
  --radius-lg: 0.5rem;
}

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    /* ... other shadcn/ui CSS variables */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    /* ... dark mode variables */
  }
}
```

**Note:** Tailwind v4 uses CSS-based configuration. See [TAILWIND_V4_MIGRATION.md](../TAILWIND_V4_MIGRATION.md) for complete setup details.

### 2. Create Auth Client

Create `lib/auth.ts`:

```typescript
import { AuthClient, AuthSomeAdapter } from '@authsome/ui-core';

export const authClient = new AuthClient({
  provider: new AuthSomeAdapter({
    apiUrl: process.env.NEXT_PUBLIC_AUTH_API_URL!,
  }),
  autoRefresh: true,
  refreshInterval: 5 * 60 * 1000, // 5 minutes
});
```

### 3. Wrap Your App with AuthProvider

In `app/layout.tsx`:

```typescript
import { AuthProvider } from '@authsome-ui/react';
import { authClient } from '@/lib/auth';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider client={authClient}>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 4. Add a Sign-In Page

Create `app/login/page.tsx`:

```typescript
'use client';

import { SignInForm } from '@authsome-ui/react-shadcn';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignInForm
        onSuccess={() => router.push('/dashboard')}
        onError={(error) => console.error('Login error:', error)}
        title="Welcome Back"
      />
    </div>
  );
}
```

### 5. Protect Your Routes

Create `app/dashboard/page.tsx`:

```typescript
'use client';

import { RequireAuth, useAuth } from '@authsome-ui/react';

function DashboardContent() {
  const { user, signOut } = useAuth();

  return (
    <div>
      <h1>Welcome, {user?.email}!</h1>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth fallback="/login">
      <DashboardContent />
    </RequireAuth>
  );
}
```

## Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_AUTH_API_URL=http://localhost:8080/api/auth
```

## Using Different Auth Providers

### Supabase

```typescript
import { SupabaseAdapter } from '@authsome/ui-core';

export const authClient = new AuthClient({
  provider: new SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  }),
});
```

### Clerk

```typescript
import { ClerkAdapter } from '@authsome/ui-core';

export const authClient = new AuthClient({
  provider: new ClerkAdapter({
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
  }),
});
```

### Custom Backend

```typescript
import { GenericAdapter } from '@authsome/ui-core';

export const authClient = new AuthClient({
  provider: new GenericAdapter({
    baseUrl: process.env.NEXT_PUBLIC_API_URL!,
    endpoints: {
      signIn: '/auth/login',
      signUp: '/auth/register',
      signOut: '/auth/logout',
      getCurrentUser: '/auth/me',
      getCurrentSession: '/auth/session',
    },
    // Optional: Transform API responses to match expected format
    transformers: {
      user: (data) => ({
        id: data.userId,
        email: data.userEmail,
        // ... map other fields
      }),
    },
  }),
});
```

## Next Steps

- [API Reference](/docs/API.md) - Detailed API documentation
- [Components](/docs/COMPONENTS.md) - All available components
- [Hooks](/docs/HOOKS.md) - React hooks reference
- [Custom Providers](/docs/CUSTOM_PROVIDERS.md) - Build your own adapter
- [Examples](https://github.com/xraph/authsome-ui/tree/main/apps/demo) - See complete examples

## Common Use Cases

### OAuth Sign-In

```typescript
import { OAuthButtons } from '@authsome-ui/react-shadcn';

<OAuthButtons
  providers={['google', 'github', 'microsoft']}
  redirectUri="/dashboard"
/>
```

### Magic Link Authentication

```typescript
import { MagicLinkForm } from '@authsome-ui/react-shadcn';

<MagicLinkForm
  onSuccess={() => alert('Check your email!')}
/>
```

### Two-Factor Authentication

```typescript
import { TwoFactorForm } from '@authsome-ui/react-shadcn';

<TwoFactorForm
  onSuccess={() => router.push('/dashboard')}
/>
```

### Headless Components

For full customization:

```typescript
import { SignInForm } from '@authsome-ui/react-headless';

<SignInForm onSuccess={handleSuccess}>
  {({ email, setEmail, password, setPassword, handleSubmit, loading, error }) => (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit" disabled={loading}>
        Sign In
      </button>
      {error && <p>{error.message}</p>}
    </form>
  )}
</SignInForm>
```

## Troubleshooting

### "AuthProvider not found" error

Make sure `AuthProvider` wraps your component tree:

```typescript
<AuthProvider client={authClient}>
  <App />
</AuthProvider>
```

### TypeScript errors

Ensure you have the correct TypeScript configuration:

```json
{
  "compilerOptions": {
    "strict": true,
    "jsx": "preserve",
    "moduleResolution": "bundler"
  }
}
```

### Tailwind styles not working

1. Check that content paths include AuthSome UI packages
2. Import global styles in your `layout.tsx`
3. Ensure `tailwindcss-animate` is installed

## Support

- [GitHub Issues](https://github.com/xraph/authsome-ui/issues)
- [Discord Community](#)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/authsome-ui)

