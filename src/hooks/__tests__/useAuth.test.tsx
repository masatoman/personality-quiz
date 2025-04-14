import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';
import supabase from '@/lib/supabase';

// Supabaseクライアントのモック
jest.mock('@/lib/supabase', () => ({
  auth: {
    getSession: jest.fn(),
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    resetPasswordForEmail: jest.fn(),
    onAuthStateChange: jest.fn(),
  },
}));

describe('useAuth Hook', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
  };

  const mockSession = {
    user: mockUser,
    access_token: 'test-token',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // 初期セッションの設定
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });
    // 認証状態変更リスナーの設定
    (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    });
  });

  describe('初期化', () => {
    it('初期状態が正しく設定される', async () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.loading).toBe(true);
      expect(result.current.user).toBeNull();
      expect(result.current.error).toBeNull();

      // 非同期処理の完了を待つ
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.error).toBeNull();
    });

    it('セッション取得エラー時の処理', async () => {
      const mockError = new Error('Session error');
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: mockError,
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('サインアップ', () => {
    it('正常なサインアップ処理', async () => {
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        const response = await result.current.signUp('test@example.com', 'password');
        expect(response).toEqual({ user: mockUser, error: null });
      });

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
    });

    it('サインアップエラー時の処理', async () => {
      const mockError = new Error('Signup error');
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: mockError,
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        const response = await result.current.signUp('test@example.com', 'password');
        expect(response).toEqual({ user: null, error: mockError });
      });
    });
  });

  describe('サインイン', () => {
    it('正常なサインイン処理', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        const response = await result.current.signIn('test@example.com', 'password');
        expect(response).toEqual({ user: mockUser, error: null });
      });

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
    });

    it('サインインエラー時の処理', async () => {
      const mockError = new Error('Signin error');
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: mockError,
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        const response = await result.current.signIn('test@example.com', 'password');
        expect(response).toEqual({ user: null, error: mockError });
      });
    });
  });

  describe('サインアウト', () => {
    it('正常なサインアウト処理', async () => {
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signOut();
      });

      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(result.current.user).toBeNull();
    });

    it('サインアウトエラー時の処理', async () => {
      const mockError = new Error('Signout error');
      (supabase.auth.signOut as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signOut();
      });

      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('パスワードリセット', () => {
    it('正常なパスワードリセット処理', async () => {
      (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        const response = await result.current.resetPassword('test@example.com');
        expect(response).toEqual({ error: null });
      });

      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('パスワードリセットエラー時の処理', async () => {
      const mockError = new Error('Password reset error');
      (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
        error: mockError,
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        const response = await result.current.resetPassword('test@example.com');
        expect(response).toEqual({ error: mockError });
      });
    });
  });

  describe('認証状態の変更', () => {
    it('認証状態の変更が正しく監視される', async () => {
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const [[event, callback]] = (supabase.auth.onAuthStateChange as jest.Mock).mock.calls;
      
      // 認証状態の変更をシミュレート
      act(() => {
        callback('SIGNED_IN', mockSession);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.session).toEqual(mockSession);
    });
  });
}); 