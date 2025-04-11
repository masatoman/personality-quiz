import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';
import supabase from '@/lib/supabase';

// モックの設定
jest.mock('@/lib/supabase', () => ({
  auth: {
    getSession: jest.fn(),
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    resetPasswordForEmail: jest.fn(),
    onAuthStateChange: jest.fn(() => ({ 
      data: { subscription: { unsubscribe: jest.fn() } } 
    })),
  }
}));

describe('useAuth', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    role: 'user'
  };
  
  const mockSession = {
    user: mockUser,
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token'
  };
  
  const mockAuthError = {
    message: '認証エラーが発生しました'
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // デフォルトのモック応答をセット
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: mockSession },
      error: null
    });
  });
  
  it('初期状態はローディング中で情報はnullである', async () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
    expect(result.current.error).toBeNull();
  });
  
  it('セッションが取得できるとユーザー情報がセットされる', async () => {
    const { result, rerender } = renderHook(() => useAuth());
    
    // セッション取得をシミュレート
    await act(async () => {
      await Promise.resolve();
      rerender();
    });
    
    expect(result.current.loading).toBe(false);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.session).toEqual(mockSession);
    expect(supabase.auth.getSession).toHaveBeenCalled();
  });
  
  it('セッション取得エラーを適切に処理する', async () => {
    // エラーを返すようにモックを設定
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: null },
      error: mockAuthError
    });
    
    const { result, rerender } = renderHook(() => useAuth());
    
    // セッション取得をシミュレート
    await act(async () => {
      await Promise.resolve();
      rerender();
    });
    
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual(mockAuthError);
  });
  
  it('signUpメソッドが正しく動作する', async () => {
    // サインアップ成功のモック
    (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null
    });
    
    const { result } = renderHook(() => useAuth());
    
    let signUpResult;
    await act(async () => {
      signUpResult = await result.current.signUp('test@example.com', 'password123');
    });
    
    expect(signUpResult).toEqual({ user: mockUser, error: null });
    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });
  
  it('signUpエラーを適切に処理する', async () => {
    // サインアップエラーのモック
    (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
      data: { user: null },
      error: mockAuthError
    });
    
    const { result } = renderHook(() => useAuth());
    
    let signUpResult;
    await act(async () => {
      signUpResult = await result.current.signUp('test@example.com', 'password123');
    });
    
    expect(signUpResult).toEqual({ user: null, error: mockAuthError });
  });
  
  it('signInメソッドが正しく動作する', async () => {
    // サインイン成功のモック
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null
    });
    
    const { result } = renderHook(() => useAuth());
    
    let signInResult;
    await act(async () => {
      signInResult = await result.current.signIn('test@example.com', 'password123');
    });
    
    expect(signInResult).toEqual({ user: mockUser, error: null });
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });
  
  it('signInエラーを適切に処理する', async () => {
    // サインインエラーのモック
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      data: { user: null },
      error: mockAuthError
    });
    
    const { result } = renderHook(() => useAuth());
    
    let signInResult;
    await act(async () => {
      signInResult = await result.current.signIn('test@example.com', 'password123');
    });
    
    expect(signInResult).toEqual({ user: null, error: mockAuthError });
  });
  
  it('signOutメソッドが正しく動作する', async () => {
    // サインアウト成功のモック
    (supabase.auth.signOut as jest.Mock).mockResolvedValueOnce({
      error: null
    });
    
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      await result.current.signOut();
    });
    
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });
  
  it('resetPasswordメソッドが正しく動作する', async () => {
    // パスワードリセット成功のモック
    (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValueOnce({
      data: {},
      error: null
    });
    
    const { result } = renderHook(() => useAuth());
    
    let resetResult;
    await act(async () => {
      resetResult = await result.current.resetPassword('test@example.com');
    });
    
    expect(resetResult).toEqual({ error: null });
    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('test@example.com');
  });
  
  it('resetPasswordエラーを適切に処理する', async () => {
    // パスワードリセットエラーのモック
    (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValueOnce({
      data: {},
      error: mockAuthError
    });
    
    const { result } = renderHook(() => useAuth());
    
    let resetResult;
    await act(async () => {
      resetResult = await result.current.resetPassword('test@example.com');
    });
    
    expect(resetResult).toEqual({ error: mockAuthError });
  });
}); 