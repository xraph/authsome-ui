/**
 * Example auth page using @authsome/ui-next
 * Copy this file to: app/auth/[...auth]/page.tsx
 * 
 * Note: Make sure you've also created the layout.tsx file with NextAuthProvider
 * (see layout.template.tsx)
 */

import { redirect } from 'next/navigation';
import { AuthFlowClient } from '@authsome/ui-next';
import { getAuthPageProps, createAuthMetadata } from '@authsome/ui-next/server';
import { authsomeAdapter } from '@authsome/ui-adapter-authsome';

// Config for server-side operations (session management)
// UI components and adapter are provided by NextAuthProvider in layout.tsx
const config = {
  adapter: authsomeAdapter({
    apiKey: process.env.AUTHSOME_API_KEY!,
  }),
  session: {
    password: process.env.SESSION_SECRET!,
  },
};

export default async function AuthPage(props: any) {
  const pageProps = await getAuthPageProps({ ...props, config });

  // Handle redirects (e.g., already logged in, sign out)
  if (pageProps.redirect) {
    redirect(pageProps.redirect);
  }

  return <AuthFlowClient {...pageProps} />;
}

// Generate page metadata
export const generateMetadata = createAuthMetadata();
