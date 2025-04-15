import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { createClient } from '@supabase/supabase-js';

// Supabaseクライアントのモック
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn()
}));

describe('useAuth', () => {
  const mockSupabase = {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
      signInWithPassword: jest.fn(),
      signInWithOAuth: jest.fn(),
      signOut: jest.fn()
    }
  };

  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    user_metadata: {
      name: 'Test User'
    }
  };

  beforeEach(() => {
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    mockSupabase.auth.onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('初期状態が正しいこと', async () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('セッションがある場合にユーザー情報が設定されること', async () => {
    mockSupabase.auth.getSession.mockResolvedValueOnce({
      data: { session: { user: mockUser } },
      error: null
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.user).toEqual({
      id: mockUser.id,
      email: mockUser.email,
      name: mockUser.user_metadata.name
    });
    expect(result.current.isLoading).toBe(false);
  });

  it('メールとパスワードでログインできること', async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn('test@example.com', 'password123');
    });

    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
    expect(result.current.user).toEqual({
      id: mockUser.id,
      email: mockUser.email,
      name: mockUser.user_metadata.name
    });
  });

  it('Googleログインが機能すること', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signInWithGoogle();
    });

    expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: expect.stringContaining('/auth/callback')
      }
    });
  });

  it('GitHubログインが機能すること', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signInWithGithub();
    });

    expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'github',
      options: {
        redirectTo: expect.stringContaining('/auth/callback')
      }
    });
  });

  it('ログアウトが機能すること', async () => {
    mockSupabase.auth.signOut.mockResolvedValueOnce({
      error: null
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signOut();
    });

    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
  });

  it('エラーハンドリングが機能すること', async () => {
    const mockError = new Error('認証エラー');
    mockSupabase.auth.signInWithPassword.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      try {
        await result.current.signIn('test@example.com', 'password123');
      } catch (error) {
        expect(error).toBe(mockError);
      }
    });

    expect(result.current.error).toEqual(mockError);
  });
}); 