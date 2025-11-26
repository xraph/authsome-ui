/**
 * Shared auth configuration for client-side components
 * Use this in NextAuthProvider and client components
 * 
 * This demo showcases all AuthSome adapter features:
 * - Multiple authentication modes (bearer, cookies, apiKey)
 * - Optional plugins (social, passkey, magiclink, twofa, phone, mfa)
 * - Production-ready configuration
 */

'use client';

import { AuthSomeAdapter } from '@authsome/adapter-authsome';
import type { NextAuthConfig } from '@authsome/ui-next';
import type { AuthSomeAdapterConfig } from '@authsome/adapter-authsome';

// Import UI components
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

// Validation
if (!process.env.NEXT_PUBLIC_AUTHSOME_API_URL) {
  console.warn('Warning: NEXT_PUBLIC_AUTHSOME_API_URL not configured. Using default localhost.');
}

// Note: SESSION_SECRET is server-only and not accessible in client components
// The middleware and server actions will validate it at runtime

/**
 * Parse enabled plugins from environment variable
 * Format: "social,passkey,magiclink" -> ['social', 'passkey', 'magiclink']
 */
const getEnabledPlugins = (): string[] => {
  const pluginsEnv = process.env.NEXT_PUBLIC_AUTHSOME_PLUGINS || '';
  if (!pluginsEnv) return ['social', 'passkey', 'magiclink', 'twofa', 'phone', 'mfa']; // Default: all plugins
  return pluginsEnv.split(',').map(p => p.trim()).filter(Boolean);
};

/**
 * Get authentication mode from environment
 */
const getAuthMode = (): 'bearer' | 'cookies' | 'apiKey' => {
  const mode = process.env.NEXT_PUBLIC_AUTHSOME_AUTH_MODE;
  if (mode === 'cookies' || mode === 'apiKey') return mode;
  return 'bearer'; // Default
};

/**
 * Create adapter configuration with all features enabled
 */
const createAdapterConfig = (): AuthSomeAdapterConfig => {
  const config: AuthSomeAdapterConfig = {
    apiUrl: process.env.NEXT_PUBLIC_AUTHSOME_API_URL || 'http://localhost:8080/api',
    authMode: getAuthMode(),
    basePath: process.env.NEXT_PUBLIC_AUTHSOME_BASE_PATH || '/api/identity',
    apiKey: process.env.NEXT_PUBLIC_AUTHSOME_PUBLISHABLE_KEY,
    plugins: getEnabledPlugins(),
    timeout: parseInt(process.env.NEXT_PUBLIC_AUTHSOME_TIMEOUT || '30000', 10),
  };

  // Add API keys based on auth mode
  if (config.authMode === 'apiKey') {
    if (process.env.NEXT_PUBLIC_AUTHSOME_PUBLISHABLE_KEY) {
      config.publishableKey = process.env.NEXT_PUBLIC_AUTHSOME_PUBLISHABLE_KEY;
    } else if (process.env.AUTHSOME_SECRET_KEY) {
      config.secretKey = process.env.AUTHSOME_SECRET_KEY;
    }
  }

  return config;
};

/**
 * Initialize adapter with configuration
 * The adapter needs to be initialized with config before passing to NextAuthProvider
 */
const initializeAdapter = async () => {
  const adapter = new AuthSomeAdapter();
  await adapter.initialize(createAdapterConfig());
  return adapter;
};

// Create adapter instance (will be initialized by NextAuthProvider)
const adapter = new AuthSomeAdapter();

/**
 * Client-side auth configuration
 * Used in NextAuthProvider and auth components
 */
export const authConfig: NextAuthConfig = {
  adapter,
  uiComponents: {
    Input,
    Button,
    Checkbox,
    Field: {
      Field: ({ children }: { children: React.ReactNode }) => (
        <div className="space-y-2">{children}</div>
      ),
      FieldLabel: Label,
      FieldDescription: ({ children }: { children: React.ReactNode }) => (
        <p className="text-sm text-muted-foreground">{children}</p>
      ),
      FieldError: ({ children }: { children: React.ReactNode }) => (
        <p className="text-sm font-medium text-destructive">{children}</p>
      ),
    },
  },

  rendererConfig: {
    authMethods: {
      emailPassword: true,
      oauth: {
        // providers: [OAuthProvider.GOOGLE, OAuthProvider.GITHUB],
        providers: ['google', 'github', 'microsoft'],
      },
      magicLink: true,
      passwordReset: true,
      emailVerification: {
        method: 'both', // Support both code and link verification
      },
    },
    signIn: {
      showRememberMe: true,
      showForgotPassword: true,
      forgotPasswordUrl: '/auth/forgot-password',
    },
    signUp: {
      customFields: [
        {
          name: "role",
          label: "Your Role",
          type: "select",
          required: true,
          options: [
            { value: "developer", label: "Developer" },
            { value: "designer", label: "Designer" },
            { value: "manager", label: "Product Manager" },
            { value: "other", label: "Other" },
          ],
        },
      ],
      showTermsCheckbox: true,
      termsText: "terms and conditions",
      termsUrl: "/terms",
    },
    socialFirst: false,
  },
  session: {
    password: process.env.SESSION_SECRET!,
    cookieName: 'authsome.session',
    maxAge: 2592000, // 30 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  },
  basePath: '/auth',
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/auth/verify-email',
  },
  callbacks: {
    signIn: async (user, _session) => {
      console.log('User signed in:', user.email);
      return '/dashboard';
    },
    signOut: async () => {
      console.log('User signed out');
      return '/';
    },
  },
};

// Initialize adapter with configuration
adapter.initialize(createAdapterConfig()).catch(err => {
  console.error('Failed to initialize AuthSome adapter:', err);
}).then(() => {
  console.log('AuthSome adapter initialized', createAdapterConfig());
});

// Export helper for programmatic initialization
export { initializeAdapter };

