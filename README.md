# AuthSome UI

<div align="center">
  <h3>🔐 Production-Ready Authentication UI Toolkit</h3>
  <p>Framework-agnostic auth with headless components, React hooks, and beautiful pre-styled UI </p>
  
  [![npm version](https://img.shields.io/npm/v/@authsome/ui-core)](https://www.npmjs.com/package/@authsome/ui-core)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
</div>

## ✨ Features

- 🎨 **Three Layers of Abstraction**
  - Core: Framework-agnostic TypeScript
  - React Headless: Maximum flexibility
  - React ShadCN: Beautiful, production-ready components

- ⚡ **Modern Tech Stack**
  - Tailwind CSS v4 (CSS-first configuration)
  - Latest shadcn/ui components
  - Next.js 15 App Router
  - Full TypeScript support

- 🔌 **Multiple Auth Providers**
  - AuthSome (built-in)
  - Supabase
  - Clerk (with organization support)
  - Custom backends

- 🛡️ **Comprehensive Auth Flows**
  - Email/Password
  - OAuth (Google, GitHub, Microsoft, etc.)
  - Magic Links
  - Two-Factor Authentication (TOTP, SMS, Email)
  - Passkeys/WebAuthn
  - Phone Number Authentication
  - Username-based Authentication

- 🏢 **Organization Management** (New in v2)
  - Multi-tenant support
  - Organization switcher
  - User & account menus
  - Role-based access
  - Provider-agnostic (native support with Clerk)

- 🎯 **Developer Experience**
  - Unified provider (FlowProvider merged into AuthProvider)
  - Full TypeScript support
  - Extensive documentation
  - Interactive demos
  - Production-ready error handling

- ♿ **Accessible & Customizable**
  - ARIA compliant
  - Keyboard navigation
  - Theme support
  - Full styling control

## 📦 Packages

### Core Packages

| Package | Version | Description |
|---------|---------|-------------|
| `@authsome/ui-core` | ![npm](https://img.shields.io/npm/v/@authsome/ui-core) | Framework-agnostic core |
| `@authsome-ui/react` | ![npm](https://img.shields.io/npm/v/@authsome-ui/react) | React hooks & context |
| `@authsome-ui/react-headless` | ![npm](https://img.shields.io/npm/v/@authsome-ui/react-headless) | Headless React components |
| `@authsome-ui/react-shadcn` | ![npm](https://img.shields.io/npm/v/@authsome-ui/react-shadcn) | Pre-styled components |

### Adapter Packages

| Package | Version | Description |
|---------|---------|-------------|
| `@authsome-ui/adapter-authsome` | ![npm](https://img.shields.io/npm/v/@authsome-ui/adapter-authsome) | AuthSome adapter (stub) |
| `@authsome/adapter-supabase` | ![npm](https://img.shields.io/npm/v/@authsome/adapter-supabase) | Supabase adapter |
| `@authsome-ui/adapter-clerk` | ![npm](https://img.shields.io/npm/v/@authsome-ui/adapter-clerk) | Clerk adapter |
| `@authsome-ui/adapter-generic` | ![npm](https://img.shields.io/npm/v/@authsome-ui/adapter-generic) | Generic adapter |

## 🚀 Quick Start

### Installation

```bash
# Install core packages
pnpm add @authsome/ui-core @authsome-ui/react

# Install an adapter (choose one or more)
pnpm add @authsome-ui/adapter-authsome     # For AuthSome backend
pnpm add @authsome/adapter-supabase     # For Supabase
pnpm add @authsome-ui/adapter-clerk        # For Clerk
pnpm add @authsome-ui/adapter-generic      # For custom backends

# Choose your UI layer
pnpm add @authsome-ui/react-shadcn  # Pre-styled components
# or
pnpm add @authsome-ui/react-headless  # Headless components
```

### Basic Usage

```typescript
import { AuthClient } from '@authsome/ui-core';
import { AuthSomeAdapter } from '@authsome-ui/adapter-authsome';
import { AuthProvider } from '@authsome-ui/react';
import { SignInForm, UserButton } from '@authsome-ui/react-shadcn';

// Create auth client
const authClient = new AuthClient({
  provider: new AuthSomeAdapter({
    apiUrl: process.env.NEXT_PUBLIC_AUTH_API_URL,
  }),
});

// Use in your app
function App() {
  return (
    <AuthProvider client={authClient}>
      {/* Auth forms */}
      <SignInForm onSuccess={() => router.push('/dashboard')} />
      
      {/* User menu (new in v2) */}
      <UserButton showEmail showOrganization />
    </AuthProvider>
  );
}
```

### Protected Routes

```typescript
import { RequireAuth, useAuth } from '@authsome-ui/react';

function Dashboard() {
  const { user, signOut } = useAuth();

  return (
    <RequireAuth fallback="/login">
      <div>
        <h1>Welcome, {user?.email}!</h1>
        <button onClick={signOut}>Sign Out</button>
      </div>
    </RequireAuth>
  );
}
```

## 📖 Documentation

- [Getting Started](/docs/GETTING_STARTED.md) - Complete setup guide
- [API Reference](/docs/API.md) - Detailed API documentation
- [Architecture](/ARCHITECTURE.md) - System design and architecture
- [Migration Guide (v2)](/MIGRATION_V2.md) - Upgrading from v1 to v2
- [Adapter Architecture](/ADAPTER_ARCHITECTURE.md) - Provider system
- [Contributing](/CONTRIBUTING.md) - Contribution guidelines

## 🎯 Supported Auth Flows

<table>
<tr>
  <td><strong>Email/Password</strong></td>
  <td>Traditional authentication</td>
</tr>
<tr>
  <td><strong>OAuth Providers</strong></td>
  <td>Google, GitHub, Microsoft, Facebook, Apple, Twitter, Discord, Slack</td>
</tr>
<tr>
  <td><strong>Magic Links</strong></td>
  <td>Passwordless email authentication</td>
</tr>
<tr>
  <td><strong>Two-Factor Auth</strong></td>
  <td>TOTP, SMS, and email-based 2FA</td>
</tr>
<tr>
  <td><strong>Phone Auth</strong></td>
  <td>SMS verification</td>
</tr>
<tr>
  <td><strong>Username Auth</strong></td>
  <td>Username-based authentication</td>
</tr>
<tr>
  <td><strong>Passkeys/WebAuthn</strong></td>
  <td>Biometric authentication</td>
</tr>
</table>

## 🎨 Component Examples

### Pre-styled Components

```typescript
import { 
  SignInForm, 
  OAuthButtons, 
  MagicLinkForm,
  UserButton,
  OrganizationSwitcher,
  AccountMenu 
} from '@authsome-ui/react-shadcn';

// Auth forms
<SignInForm onSuccess={() => router.push('/dashboard')} />
<OAuthButtons providers={['google', 'github']} />
<MagicLinkForm onSuccess={() => alert('Check your email!')} />

// Organization & User components (new in v2)
<UserButton showEmail showOrganization />
<OrganizationSwitcher showCreateButton />
<AccountMenu showOrganizations />
```

### Headless Components

```typescript
import { SignInForm } from '@authsome-ui/react-headless';

<SignInForm onSuccess={handleSuccess}>
  {({ email, setEmail, password, setPassword, handleSubmit, loading, error }) => (
    <form onSubmit={handleSubmit}>
      {/* Your custom UI */}
    </form>
  )}
</SignInForm>
```

### Hooks

```typescript
import { 
  useAuth, 
  useSignIn, 
  useOAuth, 
  use2FA, 
  useOrganization 
} from '@authsome-ui/react';

function MyComponent() {
  const { user, isAuthenticated } = useAuth();
  const { signIn, loading, error } = useSignIn();
  const { initiate } = useOAuth();
  const { setup, verify } = use2FA();
  
  // Organization hook (new in v2)
  const { 
    organizations, 
    activeOrganization, 
    setActiveOrganization,
    isSupported 
  } = useOrganization();
  
  // Your logic here
}
```

## 🔌 Provider Support

> **📚 See [ADAPTER_ARCHITECTURE.md](./ADAPTER_ARCHITECTURE.md) for complete adapter documentation**

### AuthSome (Stub - Official SDK Coming Soon)

```typescript
import { AuthSomeAdapter } from '@authsome-ui/adapter-authsome';

const adapter = new AuthSomeAdapter({
  apiUrl: 'http://localhost:8080/api/auth',
});
```

### Supabase (Uses Official Supabase JS Client)

```typescript
import { SupabaseAdapter } from '@authsome/adapter-supabase';

const adapter = new SupabaseAdapter({
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});
```

### Clerk (Uses Official Clerk SDK)

```typescript
import { ClerkAdapter } from '@authsome-ui/adapter-clerk';

const adapter = new ClerkAdapter({
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
});
```

### Custom Backend (Generic Adapter)

```typescript
import { GenericAdapter } from '@authsome-ui/adapter-generic';

const adapter = new GenericAdapter({
  baseUrl: 'https://api.example.com',
  endpoints: {
    signIn: '/auth/login',
    signUp: '/auth/register',
    // ... other endpoints
  },
});
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter @authsome/ui-core test

# Watch mode
pnpm test:watch
```

## 🏗️ Architecture

AuthSome UI is built with a layered architecture:

```
Application (Next.js, React)
          ↓
@authsome-ui/react-shadcn (Styled Components)
          ↓
@authsome-ui/react-headless (Headless Components)
          ↓
@authsome-ui/react (Hooks & Context)
          ↓
@authsome/ui-core (Framework-Agnostic Core)
          ↓
Auth Providers (AuthSome, Clerk, Supabase, etc.)
```

See [ARCHITECTURE.md](/ARCHITECTURE.md) for detailed information.

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](/CONTRIBUTING.md) for guidelines.

```bash
# Setup
git clone https://github.com/xraph/authsome-ui.git
cd authsome-ui
pnpm install

# Build
pnpm build

# Run demo
cd apps/demo
pnpm dev
```

## 📝 License

MIT © 2025 XRAPH

## 🙏 Acknowledgments

- Built with [Turborepo](https://turbo.build/)
- UI components powered by [shadcn/ui](https://ui.shadcn.com/)
- Inspired by the AuthSome backend project

## 📞 Support

- [GitHub Issues](https://github.com/xraph/authsome-ui/issues)
- [Documentation](https://authsome.xraph.com/docs/ui)
- [Discord Community](#)

---

<div align="center">
  <strong>Built with ❤️ by XRAPH</strong>
</div>
