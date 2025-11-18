/**
 * Example OAuth callback handler using @authsome/ui-next
 * Copy this file to: app/auth/[...auth]/route.ts
 */

import { createOAuthCallbackHandler } from '@authsome/ui-next/server';
import { authsomeAdapter } from '@authsome/ui-adapter-authsome';

// Configure your auth (should match page.tsx config)
const config = {
  adapter: authsomeAdapter({
    apiKey: process.env.AUTHSOME_API_KEY!,
  }),
  session: {
    password: process.env.SESSION_SECRET!,
  },
};

// Export the OAuth callback handler
export const GET = createOAuthCallbackHandler(config);
