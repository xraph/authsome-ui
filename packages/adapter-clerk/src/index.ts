/**
 * Clerk adapter for AuthSome UI
 * Uses the official Clerk SDK
 */

import Clerk from '@clerk/clerk-js';
import type {
  AuthProvider,
  User,
  Session,
  AuthResponse,
  OAuthProvider,
} from '@authsome/ui-core';
import { AuthError } from '@authsome/ui-core';

export interface ClerkAdapterConfig {
  publishableKey: string;
  options?: {
    appearance?: any;
    localization?: any;
  };
}

export class ClerkAdapter implements AuthProvider {
  private clerk: Clerk | null = null;
  private config: ClerkAdapterConfig;
  private initPromise: Promise<void> | null = null;

  constructor(config: ClerkAdapterConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      try {
        this.clerk = new Clerk(this.config.publishableKey);
        await this.clerk.load(this.config.options);
      } catch (error) {
        throw new AuthError(
          `Failed to initialize Clerk: ${(error as Error).message}`,
          'INITIALIZATION_FAILED'
        );
      }
    })();

    return this.initPromise;
  }

  destroy(): void {
    // Clerk handles cleanup internally
    this.clerk = null;
  }

  private ensureInitialized(): Clerk {
    if (!this.clerk) {
      throw new AuthError('Clerk not initialized. Call initialize() first.', 'NOT_INITIALIZED');
    }
    return this.clerk;
  }

  // Transform Clerk user to our User type
  private transformUser(clerkUser: any): User {
    return {
      id: clerkUser.id,
      email: clerkUser.primaryEmailAddress?.emailAddress || '',
      username: clerkUser.username,
      emailVerified: !!clerkUser.primaryEmailAddress?.verification?.status === 'verified',
      phoneNumber: clerkUser.primaryPhoneNumber?.phoneNumber,
      phoneVerified: clerkUser.primaryPhoneNumber?.verification?.status === 'verified',
      metadata: clerkUser.publicMetadata,
      createdAt: new Date(clerkUser.createdAt).toISOString(),
      updatedAt: new Date(clerkUser.updatedAt).toISOString(),
    };
  }

  // Transform Clerk session to our Session type
  private transformSession(clerkSession: any): Session {
    return {
      user: this.transformUser(clerkSession.user),
      accessToken: clerkSession.lastActiveToken?.getRawString() || '',
      expiresAt: new Date(clerkSession.expireAt).toISOString(),
    };
  }

  private handleError(error: any): never {
    const message = error.errors?.[0]?.message || error.message || 'Authentication error';
    const code = this.getErrorCode(message);
    throw new AuthError(message, code);
  }

  private getErrorCode(message: string): string {
    if (message.includes('password')) return 'INVALID_CREDENTIALS';
    if (message.includes('email')) return 'INVALID_EMAIL';
    if (message.includes('exists')) return 'EMAIL_ALREADY_EXISTS';
    return 'AUTH_ERROR';
  }

  async signIn(credentials: SignInCredentials): Promise<AuthResponse> {
    const clerk = this.ensureInitialized();

    try {
      const signIn = await clerk.client.signIn.create({
        identifier: credentials.email || credentials.username || '',
        password: credentials.password,
      });

      if (signIn.status !== 'complete') {
        throw new AuthError('Sign in incomplete', 'SIGN_IN_INCOMPLETE');
      }

      await clerk.setActive({ session: signIn.createdSessionId });

      const session = clerk.session;
      if (!session) {
        throw new AuthError('No session created', 'NO_SESSION');
      }

      return {
        user: this.transformUser(session.user),
        session: this.transformSession(session),
      };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      this.handleError(error);
    }
  }

  async signUp(data: SignUpData): Promise<AuthResponse> {
    const clerk = this.ensureInitialized();

    try {
      const signUp = await clerk.client.signUp.create({
        emailAddress: data.email,
        password: data.password,
        username: data.username,
      });

      if (signUp.status !== 'complete') {
        // May need email verification
        throw new AuthError('Sign up incomplete - email verification required', 'EMAIL_VERIFICATION_REQUIRED');
      }

      await clerk.setActive({ session: signUp.createdSessionId });

      const session = clerk.session;
      if (!session) {
        throw new AuthError('No session created', 'NO_SESSION');
      }

      return {
        user: this.transformUser(session.user),
        session: this.transformSession(session),
      };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      this.handleError(error);
    }
  }

  async signOut(): Promise<void> {
    const clerk = this.ensureInitialized();

    try {
      await clerk.signOut();
    } catch (error) {
      this.handleError(error);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const clerk = this.ensureInitialized();

    try {
      const user = clerk.user;
      return user ? this.transformUser(user) : null;
    } catch (error) {
      return null;
    }
  }

  async getCurrentSession(): Promise<Session | null> {
    const clerk = this.ensureInitialized();

    try {
      const session = clerk.session;
      return session ? this.transformSession(session) : null;
    } catch (error) {
      return null;
    }
  }

  async refreshSession(): Promise<AuthResponse> {
    const clerk = this.ensureInitialized();

    try {
      const session = clerk.session;
      if (!session) {
        throw new AuthError('No active session', 'NO_SESSION');
      }

      await session.touch();

      return {
        user: this.transformUser(session.user),
        session: this.transformSession(session),
      };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      this.handleError(error);
    }
  }

  async initializeOAuth(provider: OAuthProvider, options?: { redirectUri?: string }): Promise<OAuthInitResponse> {
    const clerk = this.ensureInitialized();

    try {
      const signUp = clerk.client.signUp;
      await signUp.create({});
      await signUp.authenticateWithRedirect({
        strategy: `oauth_${provider}` as any,
        redirectUrl: options?.redirectUri || window.location.href,
        redirectUrlComplete: options?.redirectUri || window.location.href,
      });

      // Redirect happens, so this won't be reached
      return {
        url: '',
        state: '',
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async handleOAuthCallback(_params: OAuthCallbackParams): Promise<AuthResponse> {
    const clerk = this.ensureInitialized();

    try {
      // Clerk handles OAuth callback automatically
      const session = clerk.session;
      if (!session) {
        throw new AuthError('OAuth callback failed - no session', 'OAUTH_CALLBACK_FAILED');
      }

      return {
        user: this.transformUser(session.user),
        session: this.transformSession(session),
      };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      this.handleError(error);
    }
  }

  async sendMagicLink(email: string): Promise<void> {
    const clerk = this.ensureInitialized();

    try {
      const signIn = clerk.client.signIn;
      await signIn.create({
        identifier: email,
      });

      await signIn.createEmailLinkFlow();
    } catch (error) {
      this.handleError(error);
    }
  }

  async verifyMagicLink(_token: string): Promise<AuthResponse> {
    const clerk = this.ensureInitialized();

    try {
      // Clerk handles magic link verification via URL
      const session = clerk.session;
      if (!session) {
        throw new AuthError('Magic link verification failed', 'MAGIC_LINK_INVALID');
      }

      return {
        user: this.transformUser(session.user),
        session: this.transformSession(session),
      };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      this.handleError(error);
    }
  }

  // 2FA - Clerk has built-in MFA support
  async setup2FA(): Promise<any> {
    const clerk = this.ensureInitialized();

    try {
      const user = clerk.user;
      if (!user) {
        throw new AuthError('No user signed in', 'NO_USER');
      }

      const totp = await user.createTOTP();
      return {
        secret: totp.secret,
        qrCode: totp.uri,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async verify2FA(code: string): Promise<AuthResponse> {
    const clerk = this.ensureInitialized();

    try {
      const signIn = clerk.client.signIn;
      if (!signIn) {
        throw new AuthError('No sign in attempt', 'NO_SIGN_IN');
      }

      await signIn.attemptSecondFactor({
        strategy: 'totp',
        code,
      });

      const session = clerk.session;
      if (!session) {
        throw new AuthError('2FA verification failed', '2FA_INVALID');
      }

      return {
        user: this.transformUser(session.user),
        session: this.transformSession(session),
      };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      this.handleError(error);
    }
  }

  async disable2FA(): Promise<void> {
    const clerk = this.ensureInitialized();

    try {
      const user = clerk.user;
      if (!user) {
        throw new AuthError('No user signed in', 'NO_USER');
      }

      const totpFactors = user.twoFactorEnabled ? user.verifiedExternalAccounts : [];
      for (const factor of totpFactors) {
        await (factor as any).destroy();
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  // Passkeys - Clerk supports passkeys
  async registerPasskey(): Promise<any> {
    const clerk = this.ensureInitialized();

    try {
      const user = clerk.user;
      if (!user) {
        throw new AuthError('No user signed in', 'NO_USER');
      }

      return await user.createPasskey();
    } catch (error) {
      this.handleError(error);
    }
  }

  async authenticateWithPasskey(): Promise<AuthResponse> {
    const clerk = this.ensureInitialized();

    try {
      const signIn = clerk.client.signIn;
      await signIn.create({});
      await signIn.authenticateWithPasskey();

      const session = clerk.session;
      if (!session) {
        throw new AuthError('Passkey authentication failed', 'PASSKEY_AUTH_FAILED');
      }

      return {
        user: this.transformUser(session.user),
        session: this.transformSession(session),
      };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      this.handleError(error);
    }
  }

  async listPasskeys(): Promise<any[]> {
    const clerk = this.ensureInitialized();

    try {
      const user = clerk.user;
      if (!user) {
        return [];
      }

      return user.passkeys || [];
    } catch (error) {
      return [];
    }
  }

  async deletePasskey(passkeyId: string): Promise<void> {
    const clerk = this.ensureInitialized();

    try {
      const user = clerk.user;
      if (!user) {
        throw new AuthError('No user signed in', 'NO_USER');
      }

      const passkey = user.passkeys?.find((p: any) => p.id === passkeyId);
      if (passkey) {
        await (passkey as any).delete();
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  // Phone auth
  async sendPhoneVerification(phoneNumber: string): Promise<void> {
    const clerk = this.ensureInitialized();

    try {
      const signUp = clerk.client.signUp;
      await signUp.create({ phoneNumber });
      await signUp.preparePhoneNumberVerification();
    } catch (error) {
      this.handleError(error);
    }
  }

  async verifyPhone(code: string): Promise<AuthResponse> {
    const clerk = this.ensureInitialized();

    try {
      const signUp = clerk.client.signUp;
      await signUp.attemptPhoneNumberVerification({ code });

      await clerk.setActive({ session: signUp.createdSessionId });

      const session = clerk.session;
      if (!session) {
        throw new AuthError('Phone verification failed', 'PHONE_VERIFICATION_FAILED');
      }

      return {
        user: this.transformUser(session.user),
        session: this.transformSession(session),
      };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      this.handleError(error);
    }
  }

  // Username auth is supported natively by Clerk
  async signInWithUsername(username: string, password: string): Promise<AuthResponse> {
    return this.signIn({ username, password });
  }

  async signUpWithUsername(username: string, password: string, email: string): Promise<AuthResponse> {
    return this.signUp({ username, password, email });
  }

  // Organization methods (using Clerk's native organization support)
  async getOrganizations(): Promise<import('@authsome/ui-core').Organization[]> {
    const clerk = this.ensureInitialized();

    try {
      const user = clerk.user;
      if (!user) {
        return [];
      }

      const memberships = user.organizationMemberships || [];
      return memberships.map((membership: any) => ({
        id: membership.organization.id,
        name: membership.organization.name,
        slug: membership.organization.slug,
        logoUrl: membership.organization.imageUrl,
        createdAt: new Date(membership.organization.createdAt),
        metadata: membership.organization.publicMetadata,
      }));
    } catch (error) {
      console.error('[ClerkAdapter] Failed to get organizations:', error);
      return [];
    }
  }

  async getActiveOrganization(): Promise<import('@authsome/ui-core').Organization | null> {
    const clerk = this.ensureInitialized();

    try {
      const org = clerk.organization;
      if (!org) return null;

      return {
        id: org.id,
        name: org.name,
        slug: org.slug,
        logoUrl: org.imageUrl,
        createdAt: new Date(org.createdAt),
        metadata: org.publicMetadata,
      };
    } catch (error) {
      console.error('[ClerkAdapter] Failed to get active organization:', error);
      return null;
    }
  }

  async setActiveOrganization(organizationId: string): Promise<void> {
    const clerk = this.ensureInitialized();

    try {
      await clerk.setActive({ organization: organizationId });
    } catch (error) {
      this.handleError(error);
    }
  }

  async getOrganizationMemberships(): Promise<import('@authsome/ui-core').OrganizationMembership[]> {
    const clerk = this.ensureInitialized();

    try {
      const user = clerk.user;
      if (!user) {
        return [];
      }

      const memberships = user.organizationMemberships || [];
      return memberships.map((membership: any) => ({
        organization: {
          id: membership.organization.id,
          name: membership.organization.name,
          slug: membership.organization.slug,
          logoUrl: membership.organization.imageUrl,
          createdAt: new Date(membership.organization.createdAt),
          metadata: membership.organization.publicMetadata,
        },
        role: membership.role as 'owner' | 'admin' | 'member',
        permissions: membership.permissions || [],
      }));
    } catch (error) {
      console.error('[ClerkAdapter] Failed to get organization memberships:', error);
      return [];
    }
  }
}

export default ClerkAdapter;

