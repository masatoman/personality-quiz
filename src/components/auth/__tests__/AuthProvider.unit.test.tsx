import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthProvider';
import { Session, User } from '@supabase/supabase-js';

// Supabaseクライアントのモック
const mockSession: Session = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: 1234567890,
  user: {
    id: 'mock-user-id',
    email: 'test@example.com',
    role: 'authenticated',
    aud: 'authenticated',
    created_at: '2024-01-01',
  } as User,
};

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: mockSession } }),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: {
          subscription: {
            unsubscribe: jest.fn(),
          },
        },
      }),
    },
  },
}));

// テスト用のコンポーネント
function TestComponent() {
  const { loading, session, user } = useAuth();
  if (loading) return <div>Loading...</div>;
  return (
    <div>
      <div>Session: {session ? 'Active' : 'None'}</div>
      <div>User Email: {user?.email}</div>
    </div>
  );
}

describe('AuthProvider', () => {
  it('初期状態ではローディング状態を表示する', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('セッションが取得できたらユーザー情報を表示する', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Session: Active')).toBeInTheDocument();
      expect(screen.getByText('User Email: test@example.com')).toBeInTheDocument();
    });
  });

  it('AuthProviderの外でuseAuthを使用するとエラーをスローする', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestComponent />)).toThrow(
      'useAuth must be used within an AuthProvider'
    );
    consoleError.mockRestore();
  });
}); 