/**
 * Example middleware.ts for your Next.js app
 * Copy this file to the root of your Next.js project
 * 
 * File location: middleware.ts (root of your project)
 */

import { createAuthMiddleware } from '@authsome/ui-next/middleware';
import { authsomeAdapter } from '@authsome/ui-adapter-authsome';

// Initialize your auth adapter
const adapter = authsomeAdapter({
  apiKey: process.env.AUTHSOME_API_KEY!,
  // Add other adapter-specific config here
});

// Create and export the auth middleware
export default createAuthMiddleware({
  adapter,
  
  // Base path for auth routes (default: '/auth')
  basePath: '/auth',
  
  // Routes that don't require authentication
  publicRoutes: [
    '/',
    '/about',
    '/pricing',
    '/api/public/*',
  ],
  
  // Auth pages (redirect away if already logged in)
  authRoutes: [
    '/auth/signin',
    '/auth/signup',
  ],
  
  // Where to redirect after successful authentication
  afterAuthRedirect: '/dashboard',
  
  // Where to redirect after sign out
  afterSignOutRedirect: '/auth/signin',
  
  // Session configuration (must match your NextAuthConfig)
  session: {
    cookieName: 'authsome.session',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    secure: process.env.NODE_ENV === 'production',
  },
  
  // Page configuration (must match your NextAuthConfig)
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error',
  },
});

// Configure which routes the middleware should run on
export const config = {
  // Match all routes except:
  // - _next/static (static files)
  // - _next/image (image optimization)
  // - favicon.ico (favicon)
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

// Alternative: Use multiple matchers for more control
// export const config = {
//   matcher: [
//     '/dashboard/:path*',
//     '/settings/:path*',
//     '/admin/:path*',
//   ],
// };

