/**
 * Storage abstraction for auth tokens and data
 */

/**
 * Storage interface
 */
export interface Storage {
  /**
   * Get item from storage
   */
  getItem(key: string): Promise<string | null> | string | null;

  /**
   * Set item in storage
   */
  setItem(key: string, value: string): Promise<void> | void;

  /**
   * Remove item from storage
   */
  removeItem(key: string): Promise<void> | void;

  /**
   * Clear all items from storage
   */
  clear(): Promise<void> | void;
}

/**
 * Storage adapter for localStorage
 */
export class LocalStorageAdapter implements Storage {
  getItem(key: string): string | null {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(key);
  }

  setItem(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(key, value);
  }

  removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(key);
  }

  clear(): void {
    if (typeof window === 'undefined') return;
    window.localStorage.clear();
  }
}

/**
 * Storage adapter for sessionStorage
 */
export class SessionStorageAdapter implements Storage {
  getItem(key: string): string | null {
    if (typeof window === 'undefined') return null;
    return window.sessionStorage.getItem(key);
  }

  setItem(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    window.sessionStorage.setItem(key, value);
  }

  removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    window.sessionStorage.removeItem(key);
  }

  clear(): void {
    if (typeof window === 'undefined') return;
    window.sessionStorage.clear();
  }
}

/**
 * In-memory storage adapter (for testing or SSR)
 */
export class MemoryStorageAdapter implements Storage {
  private store: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

