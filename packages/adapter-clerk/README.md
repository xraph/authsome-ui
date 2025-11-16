# @authsome/adapter-clerk

Clerk adapter for AuthSome UI using the official **Clerk SDK**.

## Installation

```bash
pnpm add @authsome/adapter-clerk @clerk/clerk-js
```

## Usage

```typescript
import { AuthClient } from '@authsome/ui-core';
import { ClerkAdapter } from '@authsome/adapter-clerk';

const authClient = new AuthClient({
  provider: new ClerkAdapter({
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
  }),
});
```

## Configuration

```typescript
interface ClerkAdapterConfig {
  publishableKey: string;
  options?: {
    appearance?: any;       // Clerk appearance customization
    localization?: any;     // Clerk localization
  };
}
```

## Supported Features

| Feature | Supported | Notes |
|---------|-----------|-------|
| Email/Password | ✅ | Full support |
| OAuth | ✅ | 20+ providers supported |
| Magic Links | ✅ | Email magic links |
| Phone Auth | ✅ | SMS verification |
| 2FA (TOTP) | ✅ | Authenticator apps |
| Username Auth | ✅ | Native support |
| Passkeys | ✅ | WebAuthn/FIDO2 |
| Session Management | ✅ | Multi-session support |
| Organizations | ✅ | Native Clerk organizations support |

## Example

```typescript
import { AuthProvider } from '@authsome/ui-react';
import { SignInForm } from '@authsome/ui-react-shadcn';
import { ClerkAdapter } from '@authsome/adapter-clerk';

const adapter = new ClerkAdapter({
  publishableKey: 'pk_test_...',
});

function App() {
  return (
    <AuthProvider client={new AuthClient({ provider: adapter })}>
      <SignInForm onSuccess={() => console.log('Signed in!')} />
    </AuthProvider>
  );
}
```

## Advanced Usage

### Custom Appearance

```typescript
const adapter = new ClerkAdapter({
  publishableKey: 'pk_test_...',
  options: {
    appearance: {
      variables: {
        colorPrimary: '#000000',
      },
    },
  },
});
```

### OAuth with Specific Providers

```typescript
// Clerk supports 20+ OAuth providers
await client.initializeOAuth('google');
await client.initializeOAuth('github');
await client.initializeOAuth('microsoft');
```

### Passkey Authentication

```typescript
// Register a passkey
await client.registerPasskey();

// Authenticate with passkey
const result = await client.authenticateWithPasskey();
```

### Organization Support

The Clerk adapter includes full support for Clerk's native organization features:

```typescript
import { useOrganization } from '@authsome/ui-react';
import { OrganizationSwitcher, UserButton } from '@authsome/ui-react-shadcn';

function App() {
  const { 
    organizations, 
    activeOrganization, 
    setActiveOrganization 
  } = useOrganization();
  
  return (
    <div>
      <OrganizationSwitcher />
      <UserButton showOrganization />
    </div>
  );
}
```

Available organization components:
- `<OrganizationSwitcher />` - Dropdown to switch between organizations
- `<UserButton />` - User menu with organization info
- `<AccountMenu />` - Full account management with organizations
- `<OrganizationProfile />` - Organization settings page

Organization methods:
```typescript
// Get all organizations user belongs to
const orgs = await client.getOrganizations();

// Get currently active organization
const activeOrg = await client.getActiveOrganization();

// Switch active organization
await client.setActiveOrganization(orgId);

// Get organization memberships with roles
const memberships = await client.getOrganizationMemberships();
```

## Environment Variables

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

## License

MIT

