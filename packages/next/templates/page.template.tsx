/**
 * Example auth page using @authsome/ui-next
 * Copy this file to: app/auth/[...auth]/page.tsx
 */

import { redirect } from 'next/navigation';
import { AuthFlowClient } from '@authsome/ui-next';
import { getAuthPageProps, createAuthMetadata } from '@authsome/ui-next/server';
import { authsomeAdapter } from '@authsome/ui-adapter-authsome';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from '@/components/ui/field';

// Configure your auth
const config = {
  adapter: authsomeAdapter({
    apiKey: process.env.AUTHSOME_API_KEY!,
  }),
  uiComponents: {
    Input,
    Button,
    Field: {
      Field,
      FieldLabel,
      FieldDescription,
      FieldError,
    },
  },
  session: {
    password: process.env.SESSION_SECRET!,
  },
};

export default async function AuthPage(props: any) {
  const pageProps = await getAuthPageProps({ ...props, config });

  // Handle redirects
  if (pageProps.redirect) {
    redirect(pageProps.redirect);
  }

  return <AuthFlowClient {...pageProps} />;
}

// Generate page metadata
export const generateMetadata = createAuthMetadata();
