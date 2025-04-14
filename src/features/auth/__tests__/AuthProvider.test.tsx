import React from 'react';
import { render, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from '../AuthProvider';

// モックユーザーデータ
const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  image: 'https://example.com/image.jpg'
};

// Supabaseクライアントのモック
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: () => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: { user: mockUser } } }),
      signOut: jest.fn().mockResolvedValue({}),
      onAuthStateChange: jest.fn((callback) => {
        callback('SIGNED_IN', { user: mockUser });
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      })
    }
  })
}));

// テスト用のコンポーネント
const TestComponent = () => {
  const { user, loading, signOut } = useAuth();
  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : user ? (
        <div>
          <div data-testid="user-name">{user.name}</div>
          <button onClick={signOut}>Sign Out</button>
        </div>
      ) : (
        <div>Not authenticated</div>
      )}
    </div>
  );
};

describe('AuthProvider', () => {
  it('初期状態ではローディング状態を表示する', () => {
    const { getByText } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    expect(getByText('Loading...')).toBeInTheDocument();
  });

  it('認証状態が変更されたときにユーザー情報を更新する', async () => {
    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(getByTestId('user-name')).toHaveTextContent(mockUser.name);
  });

  it('サインアウト時に認証状態をクリアする', async () => {
    const { getByText } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const signOutButton = getByText('Sign Out');
    await act(async () => {
      signOutButton.click();
    });

    expect(getByText('Not authenticated')).toBeInTheDocument();
  });
}); 