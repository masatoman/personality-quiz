import { renderHook, act } from '@testing-library/react';
import { useAuth } from './useAuth';
import supabaseClient from '@/lib/supabase';

// モックの型定義
interface MockUser {
  id: string;
  email: string;
  user_metadata: {
    name: string;
  };
  role?: string;
}

interface MockSession {
  user: MockUser;
  access_token: string;
  refresh_token: string;
}

// モックデータ
const mockUser: MockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {
    name: 'Test User'
  },
  role: 'user'
};

const mockSession: MockSession = {
  user: mockUser,
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token'
};

// Supabaseクライアントのモック
jest.mock('@/lib/supabase', () => ({
  auth: {
    getSession: jest.fn(),
    signInWithPassword: jest.fn(),
    signInWithOAuth: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn((callback: (event: string, session: MockSession | null) => void) => {
      callback('SIGNED_IN', mockSession);
      return {
        data: {
          subscription: {
            unsubscribe: jest.fn()
          }
        }
      };
    })
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() => ({
          data: { role: 'user' },
          error: null
        }))
      }))
    }))
  }))
}));

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('初期状態ではユーザーがnullでisLoadingがtrueである', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBeTruthy();
  });

  it('セッションチェックが成功した場合、ユーザー情報が設定される', async () => {
    (supabaseClient.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: mockSession },
      error: null
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isLoading).toBeFalsy();
  });

  it('サインインが成功した場合、ユーザー情報が設定される', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn('test@example.com', 'password');
    });

    expect(supabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password'
    });
  });

  it('サインアウトが成功した場合、ユーザー情報がクリアされる', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signOut();
    });

    expect(supabaseClient.auth.signOut).toHaveBeenCalled();
  });

  it('サインインが失敗した場合、エラーが返される', async () => {
    const mockError = new Error('Invalid credentials');
    (supabaseClient.auth.signInWithPassword as jest.Mock).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn('test@example.com', 'wrong-password');
    });

    expect(result.current.error).toEqual(mockError);
  });

  it('認証状態が変更された時に適切に更新される', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      const callback = (supabaseClient.auth.onAuthStateChange as jest.Mock).mock.calls[0][0];
      await callback('SIGNED_IN', mockSession);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isLoading).toBeFalsy();
  });
});