import React from 'react';
import { render, screen, act } from '@testing-library/react';
import AuthGuard from '../organisms/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';

// モックの設定
jest.mock('@/hooks/useAuth');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

describe('AuthGuard', () => {
  // モックの初期化
  const mockRouter = {
    push: jest.fn(),
  };
  const mockPathname = '/protected-page';

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (usePathname as jest.Mock).mockReturnValue(mockPathname);
  });

  it('ローディング中はLoadingStateを表示する', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: true,
    });

    render(
      <AuthGuard>
        <div>保護されたコンテンツ</div>
      </AuthGuard>
    );

    expect(screen.getByText('認証状態を確認中...')).toBeInTheDocument();
  });

  it('未認証の場合、ログインページにリダイレクトする', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
    });

    render(
      <AuthGuard>
        <div>保護されたコンテンツ</div>
      </AuthGuard>
    );

    expect(screen.getByText('アクセス制限')).toBeInTheDocument();
    expect(screen.getByText('認証が必要なページです。ログインしてください。')).toBeInTheDocument();

    // リダイレクトの確認
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    const expectedRedirect = '/auth/login?redirect=%2Fprotected-page';
    expect(mockRouter.push).toHaveBeenCalledWith(expectedRedirect);
  });

  it('認証済みの場合、子コンポーネントを表示する', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: '1', email: 'test@example.com' },
      loading: false,
    });

    render(
      <AuthGuard>
        <div>保護されたコンテンツ</div>
      </AuthGuard>
    );

    expect(screen.getByText('保護されたコンテンツ')).toBeInTheDocument();
  });

  it('必要なロールがある場合、ロールチェックを行う', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { 
        id: '1', 
        email: 'test@example.com',
        profile: { role: 'admin' }
      },
      loading: false,
    });

    render(
      <AuthGuard requiredRole="admin">
        <div>管理者用コンテンツ</div>
      </AuthGuard>
    );

    expect(screen.getByText('管理者用コンテンツ')).toBeInTheDocument();
  });

  it('必要なロールがない場合、アクセスを拒否する', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { 
        id: '1', 
        email: 'test@example.com',
        profile: { role: 'user' }
      },
      loading: false,
    });

    render(
      <AuthGuard requiredRole="admin">
        <div>管理者用コンテンツ</div>
      </AuthGuard>
    );

    expect(screen.getByText('アクセス制限')).toBeInTheDocument();
  });

  it('複数のロールを許可する場合、いずれかのロールがあればアクセスを許可する', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { 
        id: '1', 
        email: 'test@example.com',
        profile: { role: 'editor' }
      },
      loading: false,
    });

    render(
      <AuthGuard requiredRole={['admin', 'editor']}>
        <div>編集者用コンテンツ</div>
      </AuthGuard>
    );

    expect(screen.getByText('編集者用コンテンツ')).toBeInTheDocument();
  });

  it('カスタムメッセージを表示できる', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
    });

    const customMessage = 'このページは管理者専用です';
    render(
      <AuthGuard message={customMessage}>
        <div>保護されたコンテンツ</div>
      </AuthGuard>
    );

    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('カスタムフォールバックを表示できる', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
    });

    render(
      <AuthGuard fallback={<div>カスタムフォールバック</div>}>
        <div>保護されたコンテンツ</div>
      </AuthGuard>
    );

    expect(screen.getByText('カスタムフォールバック')).toBeInTheDocument();
  });

  it('カスタムリダイレクトURLを使用できる', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
    });

    const customRedirectUrl = '/custom-login';
    render(
      <AuthGuard redirectUrl={customRedirectUrl}>
        <div>保護されたコンテンツ</div>
      </AuthGuard>
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    const expectedRedirect = '/custom-login?redirect=%2Fprotected-page';
    expect(mockRouter.push).toHaveBeenCalledWith(expectedRedirect);
  });

  it('必要なロールがない場合、アクセスを拒否する', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: '1', email: 'test@example.com', profile: { role: 'user' } },
      loading: false
    });

    render(
      <AuthGuard requiredRole="admin">
        <div>管理者専用コンテンツ</div>
      </AuthGuard>
    );

    expect(screen.getByText('アクセス制限')).toBeInTheDocument();
  });

  it('複数のロールを許可できる', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: '1', email: 'test@example.com', profile: { role: 'editor' } },
      loading: false
    });

    render(
      <AuthGuard requiredRole={['admin', 'editor']}>
        <div>管理者・編集者専用コンテンツ</div>
      </AuthGuard>
    );

    expect(screen.getByText('管理者・編集者専用コンテンツ')).toBeInTheDocument();
  });

  it('カスタムメッセージを表示できる', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false
    });

    const customMessage = 'このページは会員限定です。';
    render(
      <AuthGuard message={customMessage}>
        <div>保護されたコンテンツ</div>
      </AuthGuard>
    );

    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('リダイレクトパラメータが正しくエンコードされる', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false
    });

    (usePathname as jest.Mock).mockReturnValue('/path with spaces/日本語');

    render(
      <AuthGuard>
        <div>保護されたコンテンツ</div>
      </AuthGuard>
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    const expectedRedirect = '/auth/login?redirect=%2Fpath%20with%20spaces%2F%E6%97%A5%E6%9C%AC%E8%AA%9E';
    expect(mockRouter.push).toHaveBeenCalledWith(expectedRedirect);
  });

  it('認証状態が変更された時に適切に再評価する', async () => {
    // 初期状態：未認証
    const mockAuth: { user: any; loading: boolean } = {
      user: null,
      loading: false
    };
    (useAuth as jest.Mock).mockReturnValue(mockAuth);

    const { rerender } = render(
      <AuthGuard>
        <div>保護されたコンテンツ</div>
      </AuthGuard>
    );

    expect(screen.getByText('アクセス制限')).toBeInTheDocument();

    // 認証状態を変更
    mockAuth.user = { id: '1', email: 'test@example.com' };
    (useAuth as jest.Mock).mockReturnValue({ ...mockAuth });

    // コンポーネントを再レンダリング
    rerender(
      <AuthGuard>
        <div>保護されたコンテンツ</div>
      </AuthGuard>
    );

    expect(screen.getByText('保護されたコンテンツ')).toBeInTheDocument();
  });

  it('リダイレクト時に現在のURLを正しくエンコードする', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false
    });

    // 日本語を含むURLをテスト
    (usePathname as jest.Mock).mockReturnValue('/プロフィール/設定');

    render(
      <AuthGuard>
        <div>保護されたコンテンツ</div>
      </AuthGuard>
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    const expectedRedirect = `/auth/login?redirect=${encodeURIComponent('/プロフィール/設定')}`;
    expect(mockRouter.push).toHaveBeenCalledWith(expectedRedirect);
  });

  it('非同期リダイレクトが適切なタイミングで実行される', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false
    });

    jest.useFakeTimers();

    render(
      <AuthGuard>
        <div>保護されたコンテンツ</div>
      </AuthGuard>
    );

    // リダイレクトがまだ実行されていないことを確認
    expect(mockRouter.push).not.toHaveBeenCalled();

    // タイマーを進める
    await act(async () => {
      jest.advanceTimersByTime(100);
    });

    // リダイレクトが実行されたことを確認
    expect(mockRouter.push).toHaveBeenCalledWith(expect.stringContaining('/auth/login'));

    jest.useRealTimers();
  });
}); 