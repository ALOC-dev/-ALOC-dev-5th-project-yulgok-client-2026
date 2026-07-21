import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '../../auth/AuthContext.jsx';
import MyPage from './MyPage.jsx';

vi.mock('../../auth/AuthContext.jsx', () => ({
  useAuth: vi.fn(),
}));

function createDeferred() {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, resolve, reject };
}

describe('MyPage logout button', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('invokes logout once and disables repeated clicks while pending', () => {
    const request = createDeferred();
    const logout = vi.fn(() => request.promise);
    useAuth.mockReturnValue({ logout });

    render(<MyPage />);

    const button = screen.getByRole('button', { name: '로그아웃' });
    fireEvent.click(button);
    fireEvent.click(button);

    expect(logout).toHaveBeenCalledOnce();
    expect(
      screen.getByRole('button', { name: '로그아웃 중...' }).disabled,
    ).toBe(true);
  });

  it('handles a backend logout failure and restores the button state', async () => {
    const error = new Error('backend unavailable');
    const logout = vi.fn().mockRejectedValue(error);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    useAuth.mockReturnValue({ logout });

    render(<MyPage />);
    fireEvent.click(screen.getByRole('button', { name: '로그아웃' }));

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith('로그아웃 요청 실패', error);
      expect(screen.getByRole('button', { name: '로그아웃' }).disabled).toBe(false);
    });
  });
});
