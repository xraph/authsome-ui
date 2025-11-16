# @authsome/adapter-supabase

Supabase adapter for AuthSome UI using the official **Supabase JS client**.

## Installation

```bash
pnpm add @authsome/adapter-supabase @supabase/supabase-js
```

## Usage

```typescript
import { AuthClient } from '@authsome/ui-core';
import { SupabaseAdapter } from '@authsome/adapter-supabase';

const authClient = new AuthClient({
  provider: new SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  }),
});
```

## Configuration

```typescript
interface SupabaseAdapterConfig {
  url: string;
  anonKey: string;
  options?: {
    auth?: {
      autoRefreshToken?: boolean;      // Default: true
      persistSession?: boolean;        // Default: true
      detectSessionInUrl?: boolean;    // Default: true
    };
  };
}
```

## Supported Features

| Feature | Supported | Notes |
|---------|-----------|-------|
| Email/Password | ✅ | Full support |
| OAuth | ✅ | Google, GitHub, Azure, etc. |
| Magic Links | ✅ | Via OTP |
| Phone Auth | ✅ | SMS OTP |
| 2FA (TOTP) | ✅ | Multi-factor authentication |
| 2FA (SMS) | ✅ | Phone-based MFA |
| Username Auth | ❌ | Not natively supported |
| Passkeys | ❌ | Not yet supported by Supabase |
| Organizations | ❌ | Not currently implemented (see below) |

## Organization Support

Organizations are not currently implemented for the Supabase adapter. However, you can implement organization/tenant support in your Supabase backend using:

1. **Custom Tables**: Create `organizations` and `organization_members` tables
2. **Row Level Security (RLS)**: Use Supabase RLS policies to enforce tenant isolation
3. **Custom Adapter**: Extend the Supabase adapter to implement the optional organization methods

Example schema:
```sql
CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE organization_members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid REFERENCES organizations(id),
  user_id uuid REFERENCES auth.users(id),
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  created_at timestamptz DEFAULT now()
);
```

Then extend the adapter:
```typescript
import { SupabaseAdapter } from '@authsome/adapter-supabase';

class CustomSupabaseAdapter extends SupabaseAdapter {
  async getOrganizations() {
    // Implement using your custom tables
  }
  
  async setActiveOrganization(orgId: string) {
    // Store in user metadata or session
  }
}
```

## Example

```typescript
import { AuthProvider } from '@authsome/ui-react';
import { SignInForm } from '@authsome/ui-react-shadcn';
import { SupabaseAdapter } from '@authsome/adapter-supabase';

const adapter = new SupabaseAdapter({
  url: 'https://your-project.supabase.co',
  anonKey: 'your-anon-key',
});

function App() {
  return (
    <AuthProvider client={new AuthClient({ provider: adapter })}>
      <SignInForm onSuccess={() => console.log('Signed in!')} />
    </AuthProvider>
  );
}
```

## Using with Server Components

```typescript
// app/auth-client.ts
import { createClient } from '@supabase/supabase-js';
import { SupabaseAdapter } from '@authsome/adapter-supabase';

export function getAuthClient() {
  return new SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    options: {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    },
  });
}
```

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## License

MIT

