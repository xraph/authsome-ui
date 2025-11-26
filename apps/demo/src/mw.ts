import { AuthSomeAdapter } from "@authsome/adapter-authsome";
import { createAuthMiddleware } from "@authsome/ui-next/middleware";

import type { NextProxy } from "next/server";

const adapter = new AuthSomeAdapter();
adapter.initialize({
  apiUrl:
    process.env.NEXT_PUBLIC_AUTHSOME_API_URL ||
    "http://localhost:4400",
  basePath: process.env.NEXT_PUBLIC_AUTHSOME_BASE_PATH || '/api/identity',
  apiKey: process.env.NEXT_PUBLIC_AUTHSOME_PUBLISHABLE_KEY!,
});

export const authMiddleware: NextProxy = createAuthMiddleware({
  adapter,
  publicRoutes: ["/about", "/api/public/*", '/examples', '/examples/*', '/playground', '/'],
  // Auth pages (accessible without login, redirect if authenticated)
  authRoutes: [
    "/auth/signin",
    "/auth/signup",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/verify-email",
  ],
  // Session config - must match auth-config.tsx
  session: {
    password: process.env.SESSION_SECRET!,
    cookieName: 'authsome.session',
    maxAge: 2592000, // 30 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  },
  basePath: '/auth',
  afterAuthRedirect: "/dashboard",
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/auth/verify-email',
  },
}) as unknown as NextProxy;
