import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider } from '@authsome/ui-react';
import { SignInForm } from '../components/SignInForm';
import { AuthClient } from '@authsome/ui-core';

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
    if (credentials.password === 'wrongpassword') {
      throw new Error('Invalid credentials');
    }
    
    this.state = {
      ...this.state,
      user: { id: '1', email: credentials.email, emailVerified: true, createdAt: '', updatedAt: '' },
      session: { user: { id: '1', email: credentials.email, emailVerified: true, createdAt: '', updatedAt: '' }, accessToken: 'token', expiresAt: '' },
      isAuthenticated: true,
    };
    this.notifyObservers();
    return { user: this.state.user, session: this.state.session };
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

describe('SignInForm', () => {
  const mockClient = new MockAuthClient();

  const renderForm = (props = {}) => {
    return render(
      <AuthProvider client={mockClient as unknown as AuthClient}>
        <SignInForm {...props}>
          {({ email, setEmail, password, setPassword, handleSubmit, loading, error }) => (
            <form onSubmit={handleSubmit} data-testid="form">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                data-testid="email-input"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                data-testid="password-input"
              />
              <button type="submit" disabled={loading} data-testid="submit-button">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
              {error && <div data-testid="error-message">{error.message}</div>}
            </form>
          )}
        </SignInForm>
      </AuthProvider>
    );
  };

  it('should render form with inputs', () => {
    renderForm();

    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  it('should update input values', () => {
    renderForm();

    const emailInput = screen.getByTestId('email-input') as HTMLInputElement;
    const passwordInput = screen.getByTestId('password-input') as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('should call onSuccess on successful sign in', async () => {
    const onSuccess = vi.fn();
    renderForm({ onSuccess });

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('submit-button');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('should display error on failed sign in', async () => {
    const onError = vi.fn();
    renderForm({ onError });

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('submit-button');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Invalid credentials');
      expect(onError).toHaveBeenCalled();
    });
  });

  it('should show loading state during submission', async () => {
    renderForm();

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('submit-button') as HTMLButtonElement;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.click(submitButton);

    // Check loading state (may be very brief)
    expect(submitButton.textContent).toBe('Signing in...');
    expect(submitButton.disabled).toBe(true);
  });
});

