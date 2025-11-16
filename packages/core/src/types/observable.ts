/**
 * Observable pattern for state management across frameworks
 */

export type Listener<T> = (value: T) => void;
export type Unsubscribe = () => void;

/**
 * Observable state container
 */
export class Observable<T> {
  private value: T;
  private listeners: Set<Listener<T>> = new Set();

  constructor(initialValue: T) {
    this.value = initialValue;
  }

  /**
   * Get current value
   */
  getValue(): T {
    return this.value;
  }

  /**
   * Set new value and notify listeners
   */
  setValue(newValue: T): void {
    if (this.value !== newValue) {
      this.value = newValue;
      this.notify();
    }
  }

  /**
   * Update value with a function
   */
  update(updater: (current: T) => T): void {
    this.setValue(updater(this.value));
  }

  /**
   * Subscribe to value changes
   */
  subscribe(listener: Listener<T>): Unsubscribe {
    this.listeners.add(listener);
    // Immediately call listener with current value
    listener(this.value);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners
   */
  private notify(): void {
    this.listeners.forEach((listener) => listener(this.value));
  }

  /**
   * Clear all listeners
   */
  clearListeners(): void {
    this.listeners.clear();
  }

  /**
   * Get number of listeners
   */
  getListenerCount(): number {
    return this.listeners.size;
  }
}

