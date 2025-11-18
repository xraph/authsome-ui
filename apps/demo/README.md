# AuthSome UI Demo App

A comprehensive demonstration of AuthSome UI with Next.js App Router integration.

## Features

- 🔐 **Complete Auth Flows**: Sign in, sign up, OAuth, magic links, 2FA, passkeys
- 🎨 **Beautiful UI**: Pre-styled components with shadcn/ui
- 🚀 **Next.js App Router**: Server Components, Server Actions, and middleware
- 🛡️ **Route Protection**: Automatic authentication via middleware
- 🔒 **Secure Sessions**: Encrypted cookie-based sessions
- 📱 **Responsive Design**: Mobile-first design with Tailwind CSS

## Quick Start

### 1. Install Dependencies

```bash
# From the root of the monorepo
pnpm install

# Or from this directory
pnpm install
```

### 2. Set Up Environment Variables

```bash
# Copy the example env file
cp .env.local.example .env.local

# Generate a secure session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Edit .env.local and add:
# - Your AUTHSOME_API_KEY from https://authsome.com
# - The generated SESSION_SECRET (must be 64 hex characters / 32 bytes)
```

Your `.env.local` should look like:

```env
AUTHSOME_API_KEY=ask_live_1234567890abcdef
SESSION_SECRET=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
NODE_ENV=development
```

### 3. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the demo.

## Project Structure

```
apps/demo/
├── src/
│   ├── app/
│   │   ├── auth/
│   │   │   ├── [...auth]/
│   │   │   │   ├── page.tsx       # Catch-all auth route
│   │   │   │   └── route.ts       # OAuth callback handler
│   │   │   └── layout.tsx         # Auth pages layout
│   │   ├── dashboard/
│   │   │   ├── page.tsx           # Protected dashboard (Server Component)
│   │   │   └── dashboard-client.tsx # Client-side dashboard UI
│   │   ├── examples/              # Auth flow examples
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── signout/
│   │   │           └── route.ts   # Sign out API
│   │   ├── layout.tsx             # Root layout with NextAuthProvider
│   │   └── page.tsx               # Home page
│   ├── lib/
│   │   ├── auth-server.ts         # Server-side auth client
│   │   └── auth-config.ts         # Client-side auth config
│   └── components/
│       └── ui/                    # shadcn/ui components
├── middleware.ts                  # Route protection middleware
├── .env.local.example            # Environment variables template
└── package.json
```

## Key Files Explained

### Authentication Configuration

#### `lib/auth-server.ts`
Server-side auth client for use in Server Components, Server Actions, and API routes.

```tsx
import { authServer } from '@/lib/auth-server';

// In a Server Component
const user = await authServer.getUser();

// In a Server Action
await authServer.signOut();
```

#### `lib/auth-config.ts`
Client-side auth configuration for use in React components and providers.

```tsx
import { authConfig } from '@/lib/auth-config';

<NextAuthProvider config={authConfig}>
  {children}
</NextAuthProvider>
```

### Route Handlers

#### `app/auth/[...auth]/page.tsx`
Catch-all route that handles all authentication pages:
- `/auth/signin` - Sign in page
- `/auth/signup` - Sign up page
- `/auth/forgot-password` - Password reset request
- `/auth/callback` - OAuth callback handler

#### `app/auth/[...auth]/route.ts`
OAuth callback API route that:
- Exchanges OAuth codes for tokens
- Creates user sessions
- Handles provider-specific logic

### Middleware

#### `middleware.ts`
Protects routes based on authentication status:
- Public routes: accessible to everyone
- Auth routes: redirect to dashboard if logged in
- Protected routes: require authentication

## Available Routes

### Public Routes
- `/` - Home page
- `/examples/*` - Auth flow examples
- `/playground` - Interactive playground

### Auth Routes
- `/auth/signin` - Sign in page
- `/auth/signup` - Sign up page
- `/auth/forgot-password` - Request password reset
- `/auth/reset-password` - Reset password with token
- `/auth/callback` - OAuth callback handler

### Protected Routes
- `/dashboard` - User dashboard (requires authentication)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AUTHSOME_API_KEY` | Yes | Your AuthSome API key from the dashboard |
| `SESSION_SECRET` | Yes | 64-character hex string (32 bytes) for session encryption |
| `NODE_ENV` | No | Environment mode (development/production) |

## Development

### Type Checking

```bash
pnpm type-check
```

### Linting

```bash
pnpm lint
```

### Building

```bash
pnpm build
```

### Production

```bash
pnpm build
pnpm start
```

## Authentication Flows

### Email/Password
1. User enters email and password
2. Server validates credentials
3. Session created and stored in encrypted cookie
4. User redirected to dashboard

### OAuth (Google, GitHub, etc.)
1. User clicks OAuth provider button
2. Redirected to provider's consent screen
3. Provider redirects to `/auth/callback` with code
4. Server exchanges code for tokens
5. Session created with user data
6. User redirected to dashboard

### Magic Link
1. User enters email
2. Server sends magic link to email
3. User clicks link with token
4. Server validates token
5. Session created
6. User redirected to dashboard

### Two-Factor Authentication
1. User signs in with email/password
2. Server prompts for 2FA code
3. User enters code from authenticator app
4. Server validates code
5. Full session created
6. User redirected to dashboard

## Security Features

- ✅ **Encrypted Sessions**: Using iron-session with AES-256-GCM
- ✅ **HTTP-Only Cookies**: Session cookies not accessible to JavaScript
- ✅ **CSRF Protection**: SameSite cookie policy
- ✅ **Secure Cookies**: HTTPS-only in production
- ✅ **Route Protection**: Middleware validates all requests
- ✅ **Server-Side Validation**: Auth checks on every request

## Troubleshooting

### "Session password must be at least 32 characters"

Generate a proper session secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### OAuth callback not working

1. Verify callback URL in OAuth provider settings
2. Check that both `page.tsx` and `route.ts` exist in `app/auth/[...auth]/`
3. Ensure `SESSION_SECRET` is set
4. Check browser console and server logs

### Middleware redirecting incorrectly

1. Verify public routes are configured correctly in `middleware.ts`
2. Check that `SESSION_SECRET` matches across all config files
3. Ensure middleware matcher excludes static assets

### Build errors

```bash
# Clean build artifacts
rm -rf .next
rm -rf node_modules
pnpm install
pnpm build
```

## Learn More

- [AuthSome UI Documentation](https://docs.authsome.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [iron-session](https://github.com/vvo/iron-session)

## Support

- GitHub Issues: [https://github.com/xraph/authsome-ui/issues](https://github.com/xraph/authsome-ui/issues)
- Documentation: [https://docs.authsome.com](https://docs.authsome.com)

## License

MIT
