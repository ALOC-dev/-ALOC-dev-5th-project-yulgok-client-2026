import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../api/client-api.js';
import { AuthProvider, useAuth } from './AuthContext.jsx';
import { removeAccessToken } from './tokenStorage.js';

vi.mock('../api/client-api.js', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('./tokenStorage.js', () => ({
  getAccessToken: vi.fn(() => 'test-access-token'),
  setAccessToken: vi.fn(),
  removeAccessToken: vi.fn(),
}));

function AuthConsumer() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <button
        type="button"
        onClick={() => Promise.resolve(logout()).catch(() => {})}
      >
        logout
      </button>
    </>
  );
}

describe('AuthProvider logout', () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
    apiClient.get.mockResolvedValue({});
  });

  it('requests backend logout with credentials and expires local auth', async () => {
    apiClient.post.mockResolvedValue({});

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'logout' }));

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/auth/logout',
        undefined,
        { withCredentials: true },
      );
      expect(removeAccessToken).toHaveBeenCalledOnce();
      expect(screen.getByTestId('authenticated').textContent).toBe('false');
    });
  });

  it('expires local auth when the backend logout request fails', async () => {
    apiClient.post.mockRejectedValue(new Error('backend unavailable'));

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'logout' }));

    await waitFor(() => {
      expect(removeAccessToken).toHaveBeenCalledOnce();
      expect(screen.getByTestId('authenticated').textContent).toBe('false');
    });
  });
});
