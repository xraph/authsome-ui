# @authsome/adapter-generic

Generic adapter for AuthSome UI - works with **any custom auth backend**.

## Installation

```bash
pnpm add @authsome/adapter-generic
```

## Usage

```typescript
import { AuthClient } from '@authsome/ui-core';
import { GenericAdapter } from '@authsome/adapter-generic';

const authClient = new AuthClient({
  provider: new GenericAdapter({
    baseUrl: 'https://api.example.com',
    endpoints: {
      signIn: '/auth/login',
      signUp: '/auth/register',
      signOut: '/auth/logout',
      getCurrentUser: '/auth/me',
      getCurrentSession: '/auth/session',
    },
  }),
});
```

## Configuration

```typescript
interface GenericAdapterConfig {
  baseUrl: string;
  endpoints: {
    signIn?: string;
    signUp?: string;
    signOut?: string;
    getCurrentUser?: string;
    getCurrentSession?: string;
    refreshSession?: string;
    updateUser?: string;
    changePassword?: string;
    requestPasswordReset?: string;
    confirmPasswordReset?: string;
    oauthSignIn?: string;
    oauthCallback?: string;
    sendMagicLink?: string;
    verifyMagicLink?: string;
    sendPhoneCode?: string;
    verifyPhoneCode?: string;
    setupTwoFactor?: string;
    verifyTwoFactor?: string;
    disableTwoFactor?: string;
    registerPasskey?: string;
    authenticatePasskey?: string;
    listPasskeys?: string;
    deletePasskey?: string;
  };
  transforms?: {
    transformSignInRequest?: (req) => Record<string, unknown>;
    transformSignUpRequest?: (req) => Record<string, unknown>;
    transformAuthResponse?: (res) => AuthResponse;
    transformUser?: (res) => User;
    transformSession?: (res) => Session;
    transformError?: (error) => AuthError;
  };
  headers?: Record<string, string>;
}
```

## Custom Transformers

Transform your API responses to match AuthSome UI format:

```typescript
const adapter = new GenericAdapter({
  baseUrl: 'https://api.example.com',
  endpoints: {
    signIn: '/login',
    getCurrentUser: '/user/me',
  },
  transforms: {
    // Transform your API's user format
    transformUser: (apiUser) => ({
      id: apiUser.userId,
      email: apiUser.userEmail,
      emailVerified: apiUser.verified,
      createdAt: apiUser.created,
      updatedAt: apiUser.modified,
    }),
    // Transform your API's error format
    transformError: (apiError) => ({
      message: apiError.errorMessage,
      code: apiError.errorCode,
      statusCode: apiError.status,
    }),
  },
});
```

## Custom Headers

Add authentication headers or custom headers:

```typescript
const adapter = new GenericAdapter({
  baseUrl: 'https://api.example.com',
  endpoints: { /* ... */ },
  headers: {
    'X-API-Key': 'your-api-key',
    'X-Client-Version': '1.0.0',
  },
});
```

## Complete Example

```typescript
import { AuthClient } from '@authsome/ui-core';
import { GenericAdapter } from '@authsome/adapter-generic';

const adapter = new GenericAdapter({
  baseUrl: process.env.NEXT_PUBLIC_API_URL!,
  endpoints: {
    // Auth
    signIn: '/api/auth/login',
    signUp: '/api/auth/register',
    signOut: '/api/auth/logout',
    
    // User
    getCurrentUser: '/api/user/me',
    updateUser: '/api/user/update',
    
    // Session
    getCurrentSession: '/api/auth/session',
    refreshSession: '/api/auth/refresh',
    
    // Password
    changePassword: '/api/auth/password/change',
    requestPasswordReset: '/api/auth/password/reset/request',
    confirmPasswordReset: '/api/auth/password/reset/confirm',
    
    // OAuth
    oauthSignIn: '/api/auth/oauth/:provider',
    oauthCallback: '/api/auth/oauth/callback',
    
    // Magic Link
    sendMagicLink: '/api/auth/magic-link/send',
    verifyMagicLink: '/api/auth/magic-link/verify',
    
    // 2FA
    setupTwoFactor: '/api/auth/2fa/setup',
    verifyTwoFactor: '/api/auth/2fa/verify',
    disableTwoFactor: '/api/auth/2fa/disable',
  },
  transforms: {
    transformUser: (data: any) => ({
      id: data.user_id,
      email: data.email_address,
      emailVerified: data.email_verified,
      username: data.display_name,
      metadata: data.custom_data,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }),
  },
  headers: {
    'Content-Type': 'application/json',
  },
});

const client = new AuthClient({ provider: adapter });
```

## Supported Features

All features are supported if your backend provides the corresponding endpoints:

- ✅ Email/Password
- ✅ OAuth (any providers)
- ✅ Magic Links
- ✅ Phone Auth
- ✅ 2FA
- ✅ Passkeys
- ✅ Username Auth
- ✅ Password Reset
- ✅ User Updates
- ⚠️ Organizations (optional - requires custom implementation)

## Organization Support

Organizations can be supported by adding organization endpoints to your backend and extending the generic adapter:

```typescript
import { GenericAdapter } from '@authsome/adapter-generic';

class CustomAdapter extends GenericAdapter {
  async getOrganizations() {
    const response = await fetch(`${this.baseUrl}/organizations`, {
      headers: this.headers,
      credentials: 'include',
    });
    return response.json();
  }
  
  async getActiveOrganization() {
    const response = await fetch(`${this.baseUrl}/organizations/active`, {
      headers: this.headers,
      credentials: 'include',
    });
    return response.json();
  }
  
  async setActiveOrganization(orgId: string) {
    await fetch(`${this.baseUrl}/organizations/${orgId}/activate`, {
      method: 'POST',
      headers: this.headers,
      credentials: 'include',
    });
  }
  
  async getOrganizationMemberships() {
    const response = await fetch(`${this.baseUrl}/organizations/memberships`, {
      headers: this.headers,
      credentials: 'include',
    });
    return response.json();
  }
}
```

Then use your custom adapter:
```typescript
const adapter = new CustomAdapter({
  baseUrl: 'https://api.example.com',
  endpoints: { /* ... */ },
});
```

## License

MIT

