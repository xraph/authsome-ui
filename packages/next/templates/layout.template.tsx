/**
 * Example auth layout using @authsome/ui-next
 * Copy this file to: app/auth/layout.tsx
 * 
 * The NextAuthProvider wraps all auth pages and provides configuration
 * to child components like AuthFlowClient.
 */

import { NextAuthProvider } from '@authsome/ui-next';
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

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <NextAuthProvider config={config}>{children}</NextAuthProvider>;
}

