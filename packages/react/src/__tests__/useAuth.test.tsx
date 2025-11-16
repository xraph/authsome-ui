import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { AuthProvider } from '../context/AuthProvider';
import { useAuth } from '../hooks/useAuth';
import { AuthClient } from '@authsome/ui-core';
import type { ReactNode } from 'react';

// Mock AuthClient
class MockAuthClient {
  private state = {
    user: null,
    session: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };

  private observers: Array<(state: any) => void> = [];

  getState() {
    return this.state;
  }

  subscribe(callback: (state: any) => void) {
    this.observers.push(callback);
    return () => {
      this.observers = this.observers.filter((obs) => obs !== callback);
    };
  }

  async signIn(credentials: any) {
    this.state = {
      ...this.state,
      user: { id: '1', email: credentials.email, emailVerified: true, createdAt: '', updatedAt: '' },
      session: { user: { id: '1', email: credentials.email, emailVerified: true, createdAt: '', updatedAt: '' }, accessToken: 'token', expiresAt: '' },
      isAuthenticated: true,
    };
    this.notifyObservers();
    return { user: this.state.user, session: this.state.session };
  }

  async signOut() {
    this.state = {
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    };
    this.notifyObservers();
  }

  async getCurrentUser() {
    return this.state.user;
  }

  async getCurrentSession() {
    return this.state.session;
  }

  private notifyObservers() {
    this.observers.forEach((callback) => callback(this.state));
  }
}

describe('useAuth', () => {
  let mockClient: MockAuthClient;

  beforeEach(() => {
    mockClient = new MockAuthClient();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider client={mockClient as unknown as AuthClient}>{children}</AuthProvider>
  );

  it('should provide auth state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
  });

  it('should update state after sign in', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await result.current.signIn({ email: 'test@example.com', password: 'password' });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(
        expect.objectContaining({
          id: '1',
          email: 'test@example.com',
        })
      );
    });
  });

  it('should update state after sign out', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Sign in first
    await result.current.signIn({ email: 'test@example.com', password: 'password' });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    // Sign out
    await result.current.signOut();

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });

  it('should throw error if used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within AuthProvider');
  });
});

