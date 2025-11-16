# AuthSome UI as a shadcn/ui Plugin

## Philosophy

AuthSome UI follows the **shadcn/ui philosophy**: **copy-paste, not install**.

Instead of being a component library that you install via npm, AuthSome UI is a **CLI tool** that copies component code directly into your project. This gives you:

- ✅ **Full ownership** - The code lives in your project
- ✅ **Complete control** - Modify styling and behavior as needed
- ✅ **Zero bloat** - Only add components you use
- ✅ **Easy customization** - It's just your code
- ✅ **shadcn integration** - Works with your existing shadcn setup

## How It Works

### Traditional Component Library (Old Way)

```tsx
// ❌ Install package
npm install @authsome/ui-react-shadcn

// ❌ Import from node_modules
import { SignInForm } from '@authsome/ui-react-shadcn';

// ❌ Limited customization
<SignInForm theme="dark" />
```

**Problems:**
- Entire library in your bundle
- Can't easily modify component code
- Locked into provided styling
- Updates require package updates

### shadcn Philosophy (New Way)

```bash
# ✅ Copy component to your project
npx authsome-ui add sign-in-form

# ✅ Import from your project
import { SignInForm } from '@/components/auth/sign-in-form';

# ✅ Modify the code directly
// Edit components/auth/sign-in-form.tsx however you want!
```

**Benefits:**
- Component code in your repository
- Full TypeScript support
- Customize anything
- No package dependencies for UI
- Perfect for design systems

## CLI Commands

### Initialize Project

```bash
npx authsome-ui init
```

**What it does:**
1. Checks for shadcn/ui (installs if missing)
2. Installs `@authsome/ui-core` and `@authsome/ui-react`
3. Prompts for auth provider (AuthSome, Supabase, Clerk, Generic)
4. Installs chosen adapter package
5. Creates `lib/auth-client.ts` with configuration

**Output:**
```
lib/auth-client.ts      # Your auth client setup
.env.local              # Environment variables template
```

### Add Components

```bash
# Add specific component
npx authsome-ui add sign-in-form

# Add multiple components
npx authsome-ui add sign-in-form sign-up-form oauth-buttons

# Interactive selection
npx authsome-ui add

# Add all components
npx authsome-ui add --all
```

**What it does:**
1. Copies component template to your project
2. Checks for required shadcn/ui components
3. Prompts to install missing shadcn components
4. Updates imports to match your project structure

**Output:**
```
components/auth/sign-in-form.tsx     # Your component
components/auth/sign-up-form.tsx     # Your component
```

### List Available Components

```bash
npx authsome-ui list
```

Shows all available components with descriptions.

## Component Structure

### Where Components Go

The CLI automatically detects your project structure:

```
Project with /src:
src/
  components/
    auth/
      sign-in-form.tsx
      sign-up-form.tsx

Project without /src:
components/
  auth/
    sign-in-form.tsx
    sign-up-form.tsx
```

Respects your `components.json` configuration from shadcn/ui.

### Component Template

Each component is a self-contained file:

```tsx
// components/auth/sign-in-form.tsx
'use client';

import { useState } from 'react';
import { useSignIn } from '@authsome/ui-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export function SignInForm({ onSuccess, onError }: Props) {
  const { signIn, loading, error } = useSignIn();
  // ... your component code
}
```

**You can modify everything:**
- Styling (Tailwind classes)
- Behavior (event handlers)
- Structure (JSX)
- Validation
- Error messages

## Available Components

### Core Auth
- `sign-in-form` - Email/password sign in
- `sign-up-form` - Registration form
- `auth-tabs` - Combined sign in/up with tabs
- `oauth-buttons` - Social authentication
- `magic-link-form` - Passwordless auth

### Advanced Auth
- `two-factor-form` - 2FA verification
- `two-factor-setup` - 2FA setup with QR
- `phone-auth-form` - Phone verification
- `username-auth-form` - Username login
- `passkey-prompt` - WebAuthn/passkeys

### UI Helpers
- `auth-modal` - Modal for auth flows
- `profile-menu` - User dropdown menu
- `session-list` - Active sessions
- `auth-provider-wrapper` - Wrapper with loading

## Usage Example

### 1. Initialize

```bash
npx authsome-ui init
```

Choose Supabase, it creates:

```typescript
// lib/auth-client.ts
import { AuthClient } from '@authsome/ui-core';
import { SupabaseAdapter } from '@authsome/adapter-supabase';

export const authClient = new AuthClient({
  provider: new SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  }),
});
```

### 2. Add Component

```bash
npx authsome-ui add sign-in-form
```

Creates:

```tsx
// components/auth/sign-in-form.tsx
export function SignInForm({ onSuccess }: Props) {
  // Full component code here
}
```

### 3. Use in Your App

```tsx
// app/login/page.tsx
import { AuthProvider } from '@authsome/ui-react';
import { SignInForm } from '@/components/auth/sign-in-form';
import { authClient } from '@/lib/auth-client';

export default function LoginPage() {
  return (
    <AuthProvider client={authClient}>
      <SignInForm onSuccess={() => router.push('/dashboard')} />
    </AuthProvider>
  );
}
```

### 4. Customize

Edit `components/auth/sign-in-form.tsx`:

```tsx
// Change button color
<Button className="w-full bg-purple-600 hover:bg-purple-700">
  Sign In
</Button>

// Add remember me checkbox
<div className="flex items-center">
  <Checkbox id="remember" />
  <label htmlFor="remember">Remember me</label>
</div>

// Customize error display
{error && (
  <Alert variant="destructive">
    <AlertTitle>Oops!</AlertTitle>
    <AlertDescription>{error.message}</AlertDescription>
  </Alert>
)}
```

## Dependencies

### Required (Installed by CLI)
- `@authsome/ui-core` - Auth engine
- `@authsome/ui-react` - React hooks
- `@authsome-ui/adapter-*` - Your chosen adapter

### Peer Dependencies (Used by components)
- shadcn/ui components (`button`, `input`, `card`, etc.)
- React 18+
- Tailwind CSS

The CLI checks for missing shadcn components and prompts you to install them.

## Comparison

| Feature | Component Library | shadcn Plugin (AuthSome UI) |
|---------|------------------|------------------------------|
| Installation | `npm install` | `npx authsome-ui add` |
| Location | `node_modules` | Your `components/` |
| Customization | Props only | Edit source code |
| Updates | Update package | Re-run add command |
| Bundle size | Entire library | Only what you use |
| Ownership | Vendor | You |
| TypeScript | External types | Your codebase |
| Styling | Theme system | Direct Tailwind |

## Advanced Usage

### Custom Component Path

```bash
npx authsome-ui add sign-in-form --path src/components/custom
```

### Overwrite Existing

```bash
npx authsome-ui add sign-in-form --overwrite
```

### Multiple Providers

```tsx
// lib/auth-clients.ts
export const supabaseClient = new AuthClient({
  provider: new SupabaseAdapter({ /* ... */ }),
});

export const clerkClient = new AuthClient({
  provider: new ClerkAdapter({ /* ... */ }),
});
```

## Integration with Design Systems

Since components are in your codebase, you can:

1. **Wrap with your components:**
```tsx
import { YourButton } from '@/components/ui/your-button';

// Replace shadcn Button with yours
<YourButton onClick={handleSignIn}>Sign In</YourButton>
```

2. **Use your theme:**
```tsx
// Use your design tokens
<Card className="bg-brand-primary text-brand-text">
```

3. **Add your analytics:**
```tsx
const handleSignIn = () => {
  analytics.track('sign_in_attempted');
  signIn({ email, password });
};
```

## Why This Approach?

### Inspired by shadcn/ui

shadcn/ui revolutionized how we think about component libraries:

> "Components are not installed as dependencies. They are copied into your project."

AuthSome UI extends this philosophy to authentication:

1. **You own the code** - It's in your repo, under your control
2. **Easy to customize** - Just edit the file
3. **No black boxes** - See exactly what's happening
4. **Better DX** - Jump to definition lands in your code
5. **Framework agnostic** - Works with any React setup

### Perfect for:
- ✅ Custom design systems
- ✅ Enterprise applications
- ✅ Agencies with multiple clients
- ✅ Projects that need full control
- ✅ Teams that want to own their auth UI

## Next Steps

1. **Initialize your project:**
   ```bash
   npx authsome-ui init
   ```

2. **Add your first component:**
   ```bash
   npx authsome-ui add sign-in-form
   ```

3. **Customize it** - Edit the component file

4. **Build your auth flow** - Add more components as needed

---

**This is the shadcn way. This is the AuthSome UI way.** 🎉

