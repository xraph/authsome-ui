/**
 * Token management utilities
 */

import { Storage, LocalStorageAdapter } from '../types';

const TOKEN_KEY = 'authsome_token';
const REFRESH_TOKEN_KEY = 'authsome_refresh_token';

/**
 * Token manager class
 */
export class TokenManager {
  private storage: Storage;

  constructor(storage: Storage = new LocalStorageAdapter()) {
    this.storage = storage;
  }

  /**
   * Get access token
   */
  async getToken(): Promise<string | null> {
    return await Promise.resolve(this.storage.getItem(TOKEN_KEY));
  }

  /**
   * Set access token
   */
  async setToken(token: string): Promise<void> {
    await Promise.resolve(this.storage.setItem(TOKEN_KEY, token));
  }

  /**
   * Remove access token
   */
  async removeToken(): Promise<void> {
    await Promise.resolve(this.storage.removeItem(TOKEN_KEY));
  }

  /**
   * Get refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    return await Promise.resolve(this.storage.getItem(REFRESH_TOKEN_KEY));
  }

  /**
   * Set refresh token
   */
  async setRefreshToken(token: string): Promise<void> {
    await Promise.resolve(this.storage.setItem(REFRESH_TOKEN_KEY, token));
  }

  /**
   * Remove refresh token
   */
  async removeRefreshToken(): Promise<void> {
    await Promise.resolve(this.storage.removeItem(REFRESH_TOKEN_KEY));
  }

  /**
   * Clear all tokens
   */
  async clearTokens(): Promise<void> {
    await this.removeToken();
    await this.removeRefreshToken();
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      if (!payload.exp) return false;

      // Check if token expires in the next 60 seconds
      const expiresAt = (payload.exp as number) * 1000;
      const now = Date.now();
      return (expiresAt - now) < 60000;
    } catch {
      return true;
    }
  }

  /**
   * Decode JWT token (without verification)
   */
  private decodeToken(token: string): Record<string, unknown> {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const payload = parts[1];
    const decoded = atob(payload);
    return JSON.parse(decoded);
  }
}

