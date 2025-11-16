# @authsome/ui-react-shadcn

**shadcn/ui-style auth components for your project.**

This is **not** a component library. Following the shadcn/ui philosophy, this CLI tool copies auth component code directly into your project, giving you full ownership and control.

## Philosophy

Instead of installing pre-built components:

```bash
# ❌ Old way (component library)
pnpm add @authsome/ui-react-shadcn
import { SignInForm } from '@authsome/ui-react-shadcn'
```

We copy the code to your project:

```bash
# ✅ New way (shadcn philosophy)
npx authsome-ui add sign-in-form
import { SignInForm } from '@/components/auth/sign-in-form'
```

**Benefits:**
- ✅ You own the code
- ✅ Full styling control
- ✅ No package bloat
- ✅ Easy customization
- ✅ Works with your shadcn setup

## Quick Start

### 1. Initialize

```bash
npx authsome-ui init
```

This will:
- Check for shadcn/ui (install if needed)
- Install AuthSome UI dependencies
- Set up your auth provider
- Create auth client configuration

### 2. Add Components

```bash
# Add specific components
npx authsome-ui add sign-in-form sign-up-form

# Add all components
npx authsome-ui add --all

# Interactive selection
npx authsome-ui add
```

### 3. Use in Your Project

```tsx
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

## Available Components

Run `npx authsome-ui list` to see all available components.

### Core Auth Components
- `sign-in-form` - Email/password sign in
- `sign-up-form` - Registration form
- `auth-tabs` - Combined sign in/up tabs
- `oauth-buttons` - Social auth buttons
- `magic-link-form` - Passwordless auth

### Advanced Auth
- `two-factor-form` - 2FA verification
- `two-factor-setup` - 2FA setup with QR
- `phone-auth-form` - Phone verification
- `username-auth-form` - Username login
- `passkey-prompt` - WebAuthn/FIDO2

### UI Components
- `auth-modal` - Modal for auth flows
- `profile-menu` - User profile dropdown
- `session-list` - Active sessions
- `auth-provider-wrapper` - Wrapper with loading

## Requirements

- React 18+
- Next.js 13+ (App Router or Pages Router)
- Tailwind CSS
- shadcn/ui components

The CLI will help you install missing dependencies.

## How It Works

### Component Templates

Components are stored as templates in `templates/auth/`. When you run `npx authsome-ui add`, the CLI:

1. Copies the component template to your project
2. Checks for required shadcn/ui components
3. Prompts to install missing dependencies
4. Updates imports to match your project structure

### Project Structure Detection

The CLI automatically detects:
- `/src` directory
- App Router vs Pages Router
- Component path from `components.json`
- TypeScript configuration

### Customization

Since the code is copied to your project, you can:
- Modify styling
- Change behavior
- Add/remove fields
- Integrate with your design system

## Examples

### Add Sign In Form

```bash
npx authsome-ui add sign-in-form
```

Creates: `components/auth/sign-in-form.tsx`

```tsx
import { SignInForm } from '@/components/auth/sign-in-form';

<SignInForm 
  onSuccess={() => router.push('/dashboard')}
  onError={(error) => toast.error(error.message)}
/>
```

### Add OAuth Buttons

```bash
npx authsome-ui add oauth-buttons
```

Creates: `components/auth/oauth-buttons.tsx`

```tsx
import { OAuthButtons } from '@/components/auth/oauth-buttons';

<OAuthButtons 
  providers={['google', 'github']}
  redirectUri="/dashboard"
/>
```

### Add All Components

```bash
npx authsome-ui add --all
```

Adds all auth components to your project.

## Configuration

### Custom Component Path

```bash
npx authsome-ui add sign-in-form --path src/components/custom
```

### Overwrite Existing

```bash
npx authsome-ui add sign-in-form --overwrite
```

## Comparison with Component Libraries

| Feature | Component Library | AuthSome UI CLI |
|---------|------------------|-----------------|
| Installation | npm install | Copy to project |
| Updates | Update package | Re-run add command |
| Customization | Limited | Full control |
| Bundle size | Entire library | Only what you use |
| Styling | Fixed/themed | Your choice |
| Dependencies | In node_modules | In your project |

## shadcn/ui Dependencies

Components use these shadcn/ui primitives:
- `button`
- `input`
- `label`
- `card`
- `tabs`
- `dialog`
- `dropdown-menu`
- `avatar`

The CLI will check if these are installed and prompt you to add them.

## TypeScript

All components are TypeScript-first with full type safety:

```tsx
interface SignInFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}
```

## Styling

Components use Tailwind CSS and follow shadcn/ui styling patterns:

```tsx
<Button className="w-full" variant="default">
  Sign In
</Button>
```

You can customize by:
1. Editing the copied component directly
2. Using className props
3. Modifying your Tailwind config

## Integration

Works seamlessly with:
- ✅ Next.js App Router
- ✅ Next.js Pages Router  
- ✅ React with Vite
- ✅ Any React setup with Tailwind

## Learn More

- [AuthSome UI Documentation](https://github.com/xraph/authsome-ui)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)

## License

MIT
