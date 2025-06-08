import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { usePathname, useRouter } from 'next/navigation';
import Navbar from '../Navbar';

// モック
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

// Supabaseモック
const mockGetSession = jest.fn();
const mockSignOut = jest.fn();
const mockOnAuthStateChange = jest.fn(() => ({
  data: { subscription: { unsubscribe: jest.fn() } }
}));

jest.mock('@/lib/supabase/client', () => ({
  getClient: () => ({
    auth: {
      getSession: mockGetSession,
      signOut: mockSignOut,
      onAuthStateChange: mockOnAuthStateChange,
    }
  })
}));

describe('Navbar', () => {
  beforeEach(() => {
    // パスネームのモックをリセット
    (usePathname as jest.Mock).mockReturnValue('/');
    
    // デフォルトでログアウト状態に設定
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockSignOut.mockResolvedValue({ error: null });
    
    jest.clearAllMocks();
  });

  it('非ログイン時にログインと新規登録ボタンを表示する', async () => {
    render(<Navbar />);
    
    await waitFor(() => {
      expect(screen.getByText('ログイン')).toBeInTheDocument();
      expect(screen.getByText('新規登録')).toBeInTheDocument();
    });
  });

  it('ログイン時にマイアカウントメニューを表示する', async () => {
    // ログイン状態をシミュレート
    mockGetSession.mockResolvedValue({ 
      data: { session: { user: { id: 'test-user-id' } } } 
    });
    
    render(<Navbar />);
    
    await waitFor(() => {
      expect(screen.getByText('マイアカウント')).toBeInTheDocument();
    });
  });

  it('プロフィールメニューの開閉が正しく動作する', async () => {
    // ログイン状態をシミュレート
    mockGetSession.mockResolvedValue({ 
      data: { session: { user: { id: 'test-user-id' } } } 
    });
    
    render(<Navbar />);
    
    // マイアカウントボタンを表示
    const accountButton = await waitFor(() => screen.getByText('マイアカウント'));
    
    // メニューを開く
    fireEvent.click(accountButton);
    expect(screen.getByText('プロフィール')).toBeInTheDocument();
    expect(screen.getByText('設定')).toBeInTheDocument();
    expect(screen.getByText('ログアウト')).toBeInTheDocument();
    
    // メニューを閉じる
    fireEvent.click(accountButton);
    await waitFor(() => {
      expect(screen.queryByText('プロフィール')).not.toBeInTheDocument();
    });
  });

  it('ログアウトが正しく動作する', async () => {
    // ログイン状態をシミュレート
    mockGetSession.mockResolvedValue({ 
      data: { session: { user: { id: 'test-user-id' } } } 
    });
    const router = { push: jest.fn() };
    (useRouter as jest.Mock).mockReturnValue(router);
    
    render(<Navbar />);
    
    // マイアカウントメニューを開く
    const accountButton = await waitFor(() => screen.getByText('マイアカウント'));
    fireEvent.click(accountButton);
    
    // ログアウトボタンをクリック
    fireEvent.click(screen.getByText('ログアウト'));
    
    // Supabaseのログアウト関数が呼ばれたことを確認
    expect(mockSignOut).toHaveBeenCalled();
    expect(router.push).toHaveBeenCalledWith('/');
  });

  it('現在のパスに応じてメニューアイテムがハイライトされる', () => {
    // パスを/exploreに設定
    (usePathname as jest.Mock).mockReturnValue('/explore');
    
    render(<Navbar />);
    
    const exploreLink = screen.getByText('教材探索').closest('a');
    expect(exploreLink).toHaveClass('font-bold');
  });
}); 