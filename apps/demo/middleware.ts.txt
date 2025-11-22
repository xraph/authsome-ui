/**
 * Next.js Middleware for Authentication
 * 
 * Automatically protects routes based on configuration.
 * Runs on Edge Runtime for optimal performance.
 * 
 * Route Protection Logic:
 * 1. Public routes are always accessible
 * 2. Auth routes (signin, signup) redirect to dashboard if already logged in
 * 3. All other routes require authentication
 * 
 * Features:
 * - Session validation via encrypted cookies
 * - Automatic redirects for protected routes
 * - Wildcard pattern matching (e.g., /api/public/*)
 * - OAuth callback handling
 */

import { createAuthMiddleware } from '@authsome/ui-next/middleware';
import { AuthSomeAdapter } from '@authsome/adapter-authsome';

// Validate required environment variables
if (!process.env.AUTHSOME_API_KEY) {
  console.error('AUTHSOME_API_KEY is not set');
}

if (!process.env.SESSION_SECRET) {
  console.error('SESSION_SECRET is not set');
}

// Create auth middleware with configuration
export default createAuthMiddleware({
  adapter: new AuthSomeAdapter(),
  adapterConfig: {
    apiUrl: process.env.AUTHSOME_API_URL || 'https://api.authsome.com',
    apiKey: process.env.AUTHSOME_API_KEY!,
  },
  
  // Routes that don't require authentication
  publicRoutes: [
    '/',                        // Home page
    '/about',                   // About page (if exists)
    '/pricing',                 // Pricing page (if exists)
    '/api/public/*',            // Public API routes
    '/examples',                // Examples listing page
    '/examples/*',              // All example pages (for demo purposes)
    '/playground',              // Playground page
  ],
  
  // Auth pages (redirect to dashboard if already logged in)
  authRoutes: [
    '/auth/signin',
    '/auth/signup',
    '/auth/forgot-password',
  ],
  
  // Where to redirect after successful authentication
  afterAuthRedirect: '/dashboard',
  
  // Where to redirect after sign out
  afterSignOutRedirect: '/',
  
  // Session configuration (must match auth-server.ts and auth-config.ts)
  session: {
    password: process.env.SESSION_SECRET!,
    cookieName: 'authsome.session',
    maxAge: 2592000, // 30 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  },
  
  // Base path for auth routes
  basePath: '/auth',
  
  // Custom page paths
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error',
  },
  
  // Custom authorization logic (optional)
  // requiresAuth: async (pathname) => {
  //   // Custom logic to determine if a route requires auth
  //   // Return true to require auth, false to allow public access
  //   if (pathname.startsWith('/admin')) {
  //     return true;
  //   }
  //   return false;
  // },
});

/**
 * Middleware matcher configuration
 * Determines which routes the middleware runs on
 * 
 * This configuration:
 * - Runs on all routes except static files and Next.js internals
 * - Includes API routes
 * - Includes auth routes
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

