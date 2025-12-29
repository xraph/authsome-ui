/**
 * OAuth Callback Page
 * 
 * Handles OAuth callbacks from providers like Google, GitHub, etc.
 * Uses the OAuthCallbackClient component from @authsome/ui-next
 * which provides automatic cookie handling and session verification.
 * 
 * UI components and configuration are automatically retrieved from AuthProvider context.
 */

import { OAuthCallbackClient } from '@authsome/ui-next';

interface OAuthCallbackPageProps {
  params: Promise<{ provider: string }>;
}

export default async function OAuthCallbackPage({ params }: OAuthCallbackPageProps) {
  const { provider } = await params;
  
  return <OAuthCallbackClient provider={provider} />;
}

