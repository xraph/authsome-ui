# @authsome/adapter-authsome

AuthSome adapter for AuthSome UI.

> **⚠️ Note:** This is currently a stub implementation. Once AuthSome releases its official JS client, this adapter will be updated to use it.

## Installation

```bash
pnpm add @authsome/adapter-authsome
```

## Usage

```typescript
import { AuthClient } from '@authsome/ui-core';
import { AuthSomeAdapter } from '@authsome/adapter-authsome';

const authClient = new AuthClient({
  provider: new AuthSomeAdapter({
    apiUrl: 'https://auth.yourapp.com/api',
  }),
});
```

## Configuration

```typescript
interface AuthSomeAdapterConfig {
  /** Base URL of your AuthSome API */
  apiUrl: string;
  
  /** Optional timeout for requests (ms) */
  timeout?: number;
  
  /** Optional custom headers */
  headers?: Record<string, string>;
}
```

## Example

```typescript
const adapter = new AuthSomeAdapter({
  apiUrl: process.env.NEXT_PUBLIC_AUTHSOME_API_URL!,
  timeout: 30000, // 30 seconds
  headers: {
    'X-Client-Version': '1.0.0',
  },
});

const client = new AuthClient({ provider: adapter });

// Use with React
import { AuthProvider } from '@authsome/ui-react';

function App() {
  return (
    <AuthProvider client={client}>
      {/* Your app */}
    </AuthProvider>
  );
}
```

## Supported Features

All AuthSome authentication flows are supported:

- ✅ Email/Password
- ✅ OAuth (multiple providers)
- ✅ Magic Links
- ✅ Phone Auth (SMS)
- ✅ 2FA (TOTP, SMS, Email)
- ✅ Username Auth
- ✅ Passkeys/WebAuthn

## Environment Variables

```bash
NEXT_PUBLIC_AUTHSOME_API_URL=https://auth.yourapp.com/api
```

## Roadmap

- [ ] Replace with official AuthSome JS client when released
- [ ] Add WebSocket support for real-time session updates
- [ ] Add offline support with request queueing
- [ ] Add request/response interceptors

## License

MIT

