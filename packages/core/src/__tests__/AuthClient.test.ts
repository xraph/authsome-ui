import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthClient } from '../client';
import type { AuthProvider, SignInCredentials, AuthResponse, User, Session } from '../types';

// Mock provider
class MockProvider implements Partial<AuthProvider> {
  signIn = vi.fn<[SignInCredentials], Promise<AuthResponse>>();
  signUp = vi.fn();
  signOut = vi.fn();
  getCurrentUser = vi.fn<[], Promise<User | null>>();
  getCurrentSession = vi.fn<[], Promise<Session | null>>();
  refreshSession = vi.fn();
  initialize = vi.fn();
  destroy = vi.fn();
}

describe('AuthClient', () => {
  let client: AuthClient;
  let mockProvider: MockProvider;

  beforeEach(() => {
    mockProvider = new MockProvider();
    mockProvider.initialize.mockResolvedValue(undefined);
    
    client = new AuthClient({
      provider: mockProvider as unknown as AuthProvider,
      autoRefresh: false,
    });
  });

  describe('signIn', () => {
    it('should sign in user with valid credentials', async () => {
      const mockResponse: AuthResponse = {
        user: {
          id: '1',
          email: 'test@example.com',
          emailVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        session: {
          user: {
            id: '1',
            email: 'test@example.com',
            emailVerified: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          accessToken: 'token',
          expiresAt: new Date(Date.now() + 3600000).toISOString(),
        },
      };

      mockProvider.signIn.mockResolvedValue(mockResponse);

      const credentials: SignInCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await client.signIn(credentials);

      expect(result).toEqual(mockResponse);
      expect(mockProvider.signIn).toHaveBeenCalledWith(credentials);
      expect(client.getState().isAuthenticated).toBe(true);
      expect(client.getState().user).toEqual(mockResponse.user);
    });

    it('should handle sign in error', async () => {
      mockProvider.signIn.mockRejectedValue(new Error('Invalid credentials'));

      const credentials: SignInCredentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      await expect(client.signIn(credentials)).rejects.toThrow('Invalid credentials');
      expect(client.getState().isAuthenticated).toBe(false);
    });
  });

  describe('signOut', () => {
    it('should sign out user and clear state', async () => {
      // First sign in
      const mockResponse: AuthResponse = {
        user: {
          id: '1',
          email: 'test@example.com',
          emailVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        session: {
          user: {
            id: '1',
            email: 'test@example.com',
            emailVerified: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          accessToken: 'token',
          expiresAt: new Date(Date.now() + 3600000).toISOString(),
        },
      };

      mockProvider.signIn.mockResolvedValue(mockResponse);
      mockProvider.signOut.mockResolvedValue(undefined);

      await client.signIn({ email: 'test@example.com', password: 'password' });
      expect(client.getState().isAuthenticated).toBe(true);

      await client.signOut();

      expect(mockProvider.signOut).toHaveBeenCalled();
      expect(client.getState().isAuthenticated).toBe(false);
      expect(client.getState().user).toBeNull();
      expect(client.getState().session).toBeNull();
    });
  });

  describe('state management', () => {
    it('should notify subscribers on state change', async () => {
      const subscriber = vi.fn();
      const unsubscribe = client.subscribe(subscriber);

      const mockResponse: AuthResponse = {
        user: {
          id: '1',
          email: 'test@example.com',
          emailVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        session: {
          user: {
            id: '1',
            email: 'test@example.com',
            emailVerified: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          accessToken: 'token',
          expiresAt: new Date(Date.now() + 3600000).toISOString(),
        },
      };

      mockProvider.signIn.mockResolvedValue(mockResponse);

      await client.signIn({ email: 'test@example.com', password: 'password' });

      expect(subscriber).toHaveBeenCalled();
      expect(subscriber).toHaveBeenCalledWith(
        expect.objectContaining({
          isAuthenticated: true,
          user: mockResponse.user,
        })
      );

      unsubscribe();
    });

    it('should allow unsubscribing', async () => {
      const subscriber = vi.fn();
      const unsubscribe = client.subscribe(subscriber);

      unsubscribe();

      const mockResponse: AuthResponse = {
        user: {
          id: '1',
          email: 'test@example.com',
          emailVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        session: {
          user: {
            id: '1',
            email: 'test@example.com',
            emailVerified: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          accessToken: 'token',
          expiresAt: new Date(Date.now() + 3600000).toISOString(),
        },
      };

      mockProvider.signIn.mockResolvedValue(mockResponse);

      await client.signIn({ email: 'test@example.com', password: 'password' });

      expect(subscriber).not.toHaveBeenCalled();
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      const mockUser: User = {
        id: '1',
        email: 'test@example.com',
        emailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockProvider.getCurrentUser.mockResolvedValue(mockUser);

      const user = await client.getCurrentUser();

      expect(user).toEqual(mockUser);
      expect(mockProvider.getCurrentUser).toHaveBeenCalled();
    });

    it('should return null if no user', async () => {
      mockProvider.getCurrentUser.mockResolvedValue(null);

      const user = await client.getCurrentUser();

      expect(user).toBeNull();
    });
  });
});

