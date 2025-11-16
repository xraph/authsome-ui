export interface ComponentConfig {
  name: string;
  description: string;
  files: string[];
  dependencies?: string[];
  shadcnDeps?: string[]; // shadcn components this needs
}

export const COMPONENTS: Record<string, ComponentConfig> = {
  'sign-in-form': {
    name: 'Sign In Form',
    description: 'Email/password and social sign-in form',
    files: ['auth/sign-in-form.tsx'],
    dependencies: ['@authsome/ui-react'],
    shadcnDeps: ['button', 'input', 'label', 'card'],
  },
  'sign-up-form': {
    name: 'Sign Up Form',
    description: 'Registration form with email/password',
    files: ['auth/sign-up-form.tsx'],
    dependencies: ['@authsome/ui-react'],
    shadcnDeps: ['button', 'input', 'label', 'card'],
  },
  'auth-tabs': {
    name: 'Auth Tabs',
    description: 'Tabbed interface for sign in/sign up',
    files: ['auth/auth-tabs.tsx'],
    dependencies: ['@authsome/ui-react'],
    shadcnDeps: ['tabs', 'card', 'separator'],
  },
  'oauth-buttons': {
    name: 'OAuth Buttons',
    description: 'Social authentication buttons',
    files: ['auth/oauth-buttons.tsx'],
    dependencies: ['@authsome/ui-react'],
    shadcnDeps: ['button'],
  },
  'magic-link-form': {
    name: 'Magic Link Form',
    description: 'Passwordless authentication form',
    files: ['auth/magic-link-form.tsx'],
    dependencies: ['@authsome/ui-react'],
    shadcnDeps: ['button', 'input', 'label', 'card'],
  },
  'two-factor-form': {
    name: 'Two-Factor Form',
    description: '2FA code verification form',
    files: ['auth/two-factor-form.tsx'],
    dependencies: ['@authsome/ui-react'],
    shadcnDeps: ['button', 'input', 'label', 'card'],
  },
  'two-factor-setup': {
    name: 'Two-Factor Setup',
    description: '2FA setup with QR code',
    files: ['auth/two-factor-setup.tsx'],
    dependencies: ['@authsome/ui-react'],
    shadcnDeps: ['button', 'input', 'label', 'card'],
  },
  'phone-auth-form': {
    name: 'Phone Auth Form',
    description: 'Phone number authentication',
    files: ['auth/phone-auth-form.tsx'],
    dependencies: ['@authsome/ui-react'],
    shadcnDeps: ['button', 'input', 'label', 'card'],
  },
  'username-auth-form': {
    name: 'Username Auth Form',
    description: 'Username-based authentication',
    files: ['auth/username-auth-form.tsx'],
    dependencies: ['@authsome/ui-react'],
    shadcnDeps: ['button', 'input', 'label', 'card'],
  },
  'passkey-prompt': {
    name: 'Passkey Prompt',
    description: 'WebAuthn/passkey authentication',
    files: ['auth/passkey-prompt.tsx'],
    dependencies: ['@authsome/ui-react'],
    shadcnDeps: ['button', 'card'],
  },
  'auth-modal': {
    name: 'Auth Modal',
    description: 'Modal dialog for authentication flows',
    files: ['auth/auth-modal.tsx'],
    dependencies: ['@authsome/ui-react'],
    shadcnDeps: ['dialog', 'tabs', 'separator'],
  },
  'profile-menu': {
    name: 'Profile Menu',
    description: 'User profile dropdown menu',
    files: ['auth/profile-menu.tsx'],
    dependencies: ['@authsome/ui-react'],
    shadcnDeps: ['dropdown-menu', 'avatar', 'button'],
  },
  'session-list': {
    name: 'Session List',
    description: 'Active sessions management',
    files: ['auth/session-list.tsx'],
    dependencies: ['@authsome/ui-react'],
    shadcnDeps: ['card', 'button', 'badge'],
  },
  'auth-provider-wrapper': {
    name: 'Auth Provider Wrapper',
    description: 'Wrapper component with loading state',
    files: ['auth/auth-provider-wrapper.tsx'],
    dependencies: ['@authsome/ui-react'],
    shadcnDeps: [],
  },
};

