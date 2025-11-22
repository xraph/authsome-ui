# @authsome/adapter-authsome

AuthSome adapter for AuthSome UI - uses the official `@authsome/client` SDK.

## Installation

```bash
pnpm add @authsome/adapter-authsome
```

## Usage

### Basic Setup

```typescript
import { AuthClient } from '@authsome/ui-core';
import { AuthSomeAdapter } from '@authsome/adapter-authsome';

const authClient = new AuthClient({
  provider: new AuthSomeAdapter({
    apiUrl: 'https://auth.yourapp.com',
    basePath: '/api/auth', // Optional: defaults to ''
  }),
});
```

**Important:** The adapter now uses the official `@authsome/client` v0.0.2 which separates `baseURL` and `basePath`:
- `apiUrl` - The base URL (e.g., `https://auth.yourapp.com`)
- `basePath` - The API path prefix (e.g., `/api/auth`)

### With Plugins

Enable optional plugins for extended authentication features:

```typescript
const adapter = new AuthSomeAdapter({
  apiUrl: 'https://auth.yourapp.com',
  basePath: '/api/auth',
  publishableKey: 'pk_your_publishable_key', // Required!
  plugins: ['social', 'passkey', 'magiclink', 'twofa', 'phone', 'mfa'],
  authMode: 'bearer', // or 'cookies' or 'apiKey'
});
```

## Configuration

```typescript
interface AuthSomeAdapterConfig {
  /** 
   * Base URL of your AuthSome API
   * @example "https://auth.yourapp.com"
   */
  apiUrl: string;
  
  /** 
   * Base path prefix for all API routes
   * @example "/api/auth"
   * @default ""
   */
  basePath?: string;
  
  /** 
   * Publishable API key for client-side (pk_*)
   * REQUIRED: Identifies your AuthSome instance/tenant
   * Safe to expose in browser/mobile apps
   */
  publishableKey?: string;
  
  /** 
   * Secret API key for server-side (sk_*)
   * REQUIRED (server-side): Identifies your AuthSome instance/tenant
   * WARNING: Keep this secret! Never expose in client-side code
   */
  secretKey?: string;
  
  /** 
   * Authentication mode - controls how user tokens are managed
   * - 'bearer': User tokens stored and sent as Bearer tokens (default)
   * - 'cookies': User sessions managed via HTTP-only cookies
   * - 'apiKey': Use API key for both instance identification AND user authentication
   * @default 'bearer'
   */
  authMode?: 'bearer' | 'cookies' | 'apiKey';
  
  /** 
   * Optional plugins to enable
   * Available: 'social', 'passkey', 'magiclink', 'twofa', 'phone', 'mfa'
   */
  plugins?: string[];
  
  /** Optional timeout for requests (ms) */
  timeout?: number;
}
```

**Important:** Just like Clerk, you must always provide either `publishableKey` (client-side) or `secretKey` (server-side) to identify your AuthSome instance. The `authMode` only controls how user authentication tokens are managed.

## Authentication Modes

### Bearer Token Mode (Default)

Best for Single Page Applications (SPAs):

```typescript
const adapter = new AuthSomeAdapter({
  apiUrl: 'https://auth.yourapp.com',
  basePath: '/api/auth',
  publishableKey: 'pk_your_publishable_key', // Required: Identifies your AuthSome instance
  authMode: 'bearer', // User tokens managed as bearer tokens
});
```

**Note:** The `publishableKey` (or `secretKey`) is always required to identify your AuthSome instance, similar to Clerk.

### Cookie Mode

Best for Server-Side Rendering (SSR):

```typescript
const adapter = new AuthSomeAdapter({
  apiUrl: 'https://auth.yourapp.com',
  basePath: '/api/auth',
  publishableKey: 'pk_your_publishable_key', // Required: Identifies your AuthSome instance
  authMode: 'cookies', // User sessions managed via HTTP-only cookies
});
```

### API Key Mode

For server-to-server or mobile apps:

```typescript
// Client-side (publishable key)
const adapter = new AuthSomeAdapter({
  apiUrl: 'https://auth.yourapp.com',
  basePath: '/api/auth',
  authMode: 'apiKey',
  publishableKey: 'pk_live_xxxxxxxxxxxx',
});

// Server-side (secret key)
const adapter = new AuthSomeAdapter({
  apiUrl: 'https://auth.yourapp.com',
  basePath: '/api/auth',
  authMode: 'apiKey',
  secretKey: 'sk_live_xxxxxxxxxxxx', // Keep secret!
});
```

## Available Plugins

### Social Plugin
OAuth authentication with multiple providers:

```typescript
const adapter = new AuthSomeAdapter({
  apiUrl: 'https://auth.yourapp.com/api',
  plugins: ['social'],
});

// Now OAuth methods are enhanced with the social plugin
```

**Features:**
- OAuth sign-in with multiple providers
- Account linking/unlinking
- Provider discovery

### Passkey Plugin
WebAuthn/FIDO2 passwordless authentication:

```typescript
const adapter = new AuthSomeAdapter({
  apiUrl: 'https://auth.yourapp.com/api',
  plugins: ['passkey'],
});
```

**Features:**
- Passkey registration
- Passwordless login
- Credential management

### Magic Link Plugin
Email-based passwordless authentication:

```typescript
const adapter = new AuthSomeAdapter({
  apiUrl: 'https://auth.yourapp.com/api',
  plugins: ['magiclink'],
});
```

**Features:**
- Send magic link to email
- Verify magic link tokens

### Two-Factor Authentication Plugin
Multi-factor authentication support:

```typescript
const adapter = new AuthSomeAdapter({
  apiUrl: 'https://auth.yourapp.com/api',
  plugins: ['twofa'],
});
```

**Features:**
- TOTP setup and verification
- SMS/Email OTP
- Backup codes
- Trusted devices

### Phone Plugin
SMS-based authentication:

```typescript
const adapter = new AuthSomeAdapter({
  apiUrl: 'https://auth.yourapp.com/api',
  plugins: ['phone'],
});
```

**Features:**
- Send verification codes
- Phone number verification
- SMS sign-in

### MFA Plugin
Advanced multi-factor authentication:

```typescript
const adapter = new AuthSomeAdapter({
  apiUrl: 'https://auth.yourapp.com/api',
  plugins: ['mfa'],
});
```

**Features:**
- Multiple factor enrollment
- Challenge-based verification
- Device trust management
- Policy management

## Advanced Usage

### Direct Client Access

Access the underlying `@authsome/client` SDK for advanced features:

```typescript
const adapter = new AuthSomeAdapter({
  apiUrl: 'https://auth.yourapp.com',
  basePath: '/api/auth',
  plugins: ['social', 'passkey'],
});

// Initialize the adapter first
await adapter.initialize();

// Get the client instance (uses @authsome/client v0.0.2)
const client = adapter.getClient();

// Use client methods directly
const session = await client.getSession();
await client.updateUser({ name: 'New Name' });

// Make custom API requests
const customData = await client.request('POST', '/custom/endpoint', {
  body: { data: 'value' },
  auth: true,
});

// Access type-safe plugin registry
const mfa = client.$plugins.mfa();
if (mfa) {
  await mfa.enrollFactor({ type: 'totp', name: 'My Auth App' });
}
```

### Plugin Access

Access specific plugin instances for advanced plugin features:

```typescript
import type { SocialPlugin, PasskeyPlugin } from '@authsome/client';

const adapter = new AuthSomeAdapter({
  apiUrl: 'https://auth.yourapp.com',
  basePath: '/api/auth',
  plugins: ['social', 'passkey'],
});

await adapter.initialize();

// Option 1: Get plugin via adapter
const socialPlugin = adapter.getPlugin<SocialPlugin>('social');
if (socialPlugin) {
  // Use plugin methods directly
  await socialPlugin.linkAccount({
    provider: 'google',
    scopes: ['profile', 'email'],
  });
}

// Option 2: Use type-safe registry (recommended)
const client = adapter.getClient();
const social = client.$plugins.social();
if (social) {
  const { url } = await social.getAuthUrl({
    provider: 'google',
    redirectUri: 'http://localhost:3000/callback'
  });
}

// Get configuration
const config = adapter.getConfig();
console.log('Auth mode:', config.authMode);
console.log('Base path:', config.basePath);
console.log('Enabled plugins:', config.plugins);
```

### Plugin Requirement Matrix

Starting with version 0.1.7, plugin-specific methods **require** the corresponding plugin to be enabled. Clear error messages will guide you if a plugin is missing.

| Method | Required Plugin | Error if Missing |
|--------|----------------|------------------|
| `oauthSignIn()` | `social` | ✅ |
| `oauthCallback()` | `social` | ✅ |
| `getOAuthProviders()` | `social` | ✅ |
| `sendMagicLink()` | `magiclink` | ✅ |
| `verifyMagicLink()` | `magiclink` | ✅ |
| `sendPhoneCode()` | `phone` | ✅ |
| `verifyPhoneCode()` | `phone` | ✅ |
| `setupTwoFactor()` | `twofa` | ✅ |
| `verifyTwoFactor()` | `twofa` | ✅ |
| `disableTwoFactor()` | `twofa` | ✅ |
| `getTwoFactorStatus()` | `twofa` | ✅ |
| `registerPasskey()` | `passkey` | ✅ |
| `authenticatePasskey()` | `passkey` | ✅ |
| `listPasskeys()` | `passkey` | ✅ |
| `deletePasskey()` | `passkey` | ✅ |

**Example error message:**
```
Error: Plugin 'social' is not enabled. Add 'social' to the plugins array in your adapter configuration.
```

## Examples

### Next.js App with Bearer Auth

```typescript
import { AuthClient } from '@authsome/ui-core';
import { AuthSomeAdapter } from '@authsome/adapter-authsome';
import { AuthProvider } from '@authsome/ui-react';

const adapter = new AuthSomeAdapter({
  apiUrl: process.env.NEXT_PUBLIC_AUTHSOME_API_URL!,
  authMode: 'bearer',
  plugins: ['social', 'passkey', 'magiclink'],
  timeout: 30000,
});

const client = new AuthClient({ provider: adapter });

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider client={client}>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
```

### Next.js App with Cookie Auth (SSR)

```typescript
const adapter = new AuthSomeAdapter({
  apiUrl: process.env.NEXT_PUBLIC_AUTHSOME_API_URL!,
  basePath: '/api/auth',
  authMode: 'cookies',
  plugins: ['social', 'twofa'],
});
```

### Mobile App with Publishable Key

```typescript
const adapter = new AuthSomeAdapter({
  apiUrl: 'https://auth.yourapp.com',
  basePath: '/api/auth',
  authMode: 'apiKey',
  publishableKey: process.env.EXPO_PUBLIC_AUTHSOME_KEY!,
  plugins: ['phone', 'passkey'],
});
```

### Server-Side API with Secret Key

```typescript
// api/auth/[...route].ts
const adapter = new AuthSomeAdapter({
  apiUrl: process.env.AUTHSOME_API_URL!,
  basePath: '/api/auth',
  authMode: 'apiKey',
  secretKey: process.env.AUTHSOME_SECRET_KEY!, // Keep this secret!
});
```

## Supported Features

All AuthSome authentication flows are supported:

- ✅ Email/Password (always available)
- ✅ OAuth (multiple providers) - **requires `social` plugin**
- ✅ Magic Links - **requires `magiclink` plugin**
- ✅ Phone Auth (SMS) - **requires `phone` plugin**
- ✅ 2FA (TOTP, SMS, Email) - **requires `twofa` plugin**
- ✅ MFA (Advanced multi-factor) - **requires `mfa` plugin**
- ✅ Username Auth (always available)
- ✅ Passkeys/WebAuthn - **requires `passkey` plugin**
- ✅ Session Management (always available)
- ✅ User Profile Updates (always available)
- ✅ Direct client SDK access via `getClient()`
- ✅ Plugin instance access via `getPlugin()`

## Environment Variables

```bash
# Required
NEXT_PUBLIC_AUTHSOME_API_URL=https://auth.yourapp.com
NEXT_PUBLIC_AUTHSOME_BASE_PATH=/api/auth

# Required - Publishable key (client-side, safe to expose)
NEXT_PUBLIC_AUTHSOME_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxx

# Required - Secret key (server-side only, keep secret!)
AUTHSOME_SECRET_KEY=sk_live_xxxxxxxxxxxx
```

**Note:** Similar to Clerk, you must always provide an API key to identify your AuthSome instance. Use `publishableKey` for client-side code and `secretKey` for server-side code.

## Migration from Stub Implementation

If you're upgrading from the previous stub implementation:

### Breaking Changes

1. The adapter now uses the official `@authsome/client` SDK (v0.0.2)
2. **API URL structure changed**: `apiUrl` is now the base URL, use `basePath` for route prefix
   - **Before**: `apiUrl: 'https://auth.yourapp.com/api/auth'`
   - **After**: `apiUrl: 'https://auth.yourapp.com'`, `basePath: '/api/auth'`
3. Plugin initialization uses factory functions (internal change, no code changes needed)
4. New configuration options available (`authMode`, `plugins`, `basePath`, etc.)
5. **Plugin methods now require plugins to be enabled** (no silent fallbacks)

### Migration Steps

1. **Update your configuration (IMPORTANT):**
   ```typescript
   // Before (v0.0.1)
   const adapter = new AuthSomeAdapter({
     apiUrl: 'https://auth.yourapp.com/api/auth',
   });

   // After (v0.0.2+)
   const adapter = new AuthSomeAdapter({
     apiUrl: 'https://auth.yourapp.com',
     basePath: '/api/auth', // Separate base path
   });
   
   // Alternative (if no base path needed)
   const adapter = new AuthSomeAdapter({
     apiUrl: 'https://auth.yourapp.com/api/auth',
     basePath: '', // Empty string = no additional prefix
   });
   ```

2. **Optional: Enable plugins for enhanced features:**
   ```typescript
   const adapter = new AuthSomeAdapter({
     apiUrl: 'https://auth.yourapp.com',
     basePath: '/api/auth',
     plugins: ['social', 'passkey', 'magiclink', 'mfa'], // NEW!
   });
   ```

3. **Optional: Choose auth mode:**
   ```typescript
   const adapter = new AuthSomeAdapter({
     apiUrl: 'https://auth.yourapp.com',
     basePath: '/api/auth',
     authMode: 'cookies', // NEW! Default is 'bearer'
   });
   ```

4. **IMPORTANT: Enable plugins for plugin methods:**
   ```typescript
   // ❌ This will throw an error (plugin not enabled)
   const adapter = new AuthSomeAdapter({
     apiUrl: 'https://auth.yourapp.com',
     basePath: '/api/auth',
   });
   await adapter.oauthSignIn({ provider: 'google' });
   // Error: Plugin 'social' is not enabled...
   
   // ✅ Correct way
   const adapter = new AuthSomeAdapter({
     apiUrl: 'https://auth.yourapp.com',
     basePath: '/api/auth',
     plugins: ['social'], // Enable required plugins
   });
   await adapter.oauthSignIn({ provider: 'google' });
   ```

### Backward Compatibility

The adapter maintains backward compatibility for core authentication features (email/password, session management, etc.). Plugin methods now require explicit plugin enablement with clear error messages to guide configuration.

## Troubleshooting

### Plugin Not Working / Plugin Required Error

If you see an error like `Plugin 'social' is not enabled`, add the plugin to your configuration:

```typescript
const adapter = new AuthSomeAdapter({
  apiUrl: 'https://auth.yourapp.com',
  basePath: '/api/auth',
  plugins: ['social', 'passkey', 'magiclink', 'twofa', 'phone', 'mfa'],
});
```

The error message will tell you exactly which plugin you need to add.

### Missing API Key Error

Always provide a publishableKey or secretKey to identify your AuthSome instance:
```typescript
// Client-side
publishableKey: process.env.NEXT_PUBLIC_AUTHSOME_PUBLISHABLE_KEY

// Server-side
secretKey: process.env.AUTHSOME_SECRET_KEY
```

### Authentication Mode Issues

- **Bearer mode**: User tokens automatically managed after successful auth
- **Cookie mode**: User sessions managed via HTTP-only cookies
- **API key mode**: API key used for both identification and authentication

### CORS Issues

Ensure your AuthSome API is configured to accept requests from your domain:

```typescript
// The adapter automatically includes credentials for cookie mode
authMode: 'cookies'
```

## Changelog

### v0.1.8 (Latest)
- 🚀 Updated to `@authsome/client` v0.0.2
- ✨ Added `basePath` configuration for API route prefixes
- 🔧 Plugin initialization now uses factory functions
- 🎯 Added type-safe plugin registry support (`client.$plugins`)
- 📚 Updated documentation with new API structure

### v0.1.7
- ✅ Removed all fallback manual requests (client SDK only)
- ✅ Exposed client SDK for direct access
- ✅ Exposed plugin instances for advanced features
- ✅ Added plugin requirement validation

## Roadmap

- [x] Integrate official AuthSome JS client
- [x] Add plugin support for extended features
- [x] Add multiple authentication modes
- [x] Expose client SDK for direct access
- [x] Expose plugin instances for advanced features
- [x] Remove fallback manual requests (client SDK only)
- [x] Add `basePath` configuration support
- [x] Add type-safe plugin registry support
- [ ] Add WebSocket support for real-time session updates
- [ ] Add offline support with request queueing
- [ ] Add request/response interceptors
- [ ] Add comprehensive test coverage
- [ ] Add webhook support

## License

MIT