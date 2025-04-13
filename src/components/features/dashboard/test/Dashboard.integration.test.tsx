import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardPage from '@/components/features/dashboard/DashboardPage';
import { useAuth } from '@/hooks/useAuth';

// 依存関係のモック
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      prefetch: jest.fn(),
    };
  },
}));

// コンポーネントのモック
jest.mock('../ActivitySummary', () => {
  return jest.fn(({ userId }) => (
    <div data-testid="activity-summary" data-user-id={userId}>
      ActivitySummary コンポーネント
    </div>
  ));
});

jest.mock('../GiverScoreChart', () => {
  return jest.fn(({ userId }) => (
    <div data-testid="giver-score-chart" data-user-id={userId}>
      GiverScoreChart コンポーネント
    </div>
  ));
});

jest.mock('../ActivityTypeChart', () => {
  return jest.fn(({ userId }) => (
    <div data-testid="activity-type-chart" data-user-id={userId}>
      ActivityTypeChart コンポーネント
    </div>
  ));
});

// フェッチのモック化
// @ts-ignore - fetch型の不一致を無視
global.fetch = jest.fn();

describe('Dashboard Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // デフォルトのAuthモック
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'test-user-123', email: 'test@example.com' },
      loading: false,
    });
    
    // @ts-ignore
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
  });

  it('認証済みユーザーがダッシュボードを閲覧できること', async () => {
    render(<DashboardPage />);
    
    // ダッシュボードの見出しが表示されていることを確認
    expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
    
    // サブコンポーネントが適切にレンダリングされていることを確認
    await waitFor(() => {
      expect(screen.getByTestId('activity-summary')).toBeInTheDocument();
      expect(screen.getByTestId('giver-score-chart')).toBeInTheDocument();
      expect(screen.getByTestId('activity-type-chart')).toBeInTheDocument();
    });
    
    // ユーザーIDが正しくサブコンポーネントに渡されていることを確認
    expect(screen.getByTestId('activity-summary').getAttribute('data-user-id')).toBe('test-user-123');
    expect(screen.getByTestId('giver-score-chart').getAttribute('data-user-id')).toBe('test-user-123');
    expect(screen.getByTestId('activity-type-chart').getAttribute('data-user-id')).toBe('test-user-123');
    
    // ナビゲーションタブが表示されていることを確認
    expect(screen.getByText('すべて')).toBeInTheDocument();
    expect(screen.getByText('未完了')).toBeInTheDocument();
    expect(screen.getByText('完了済み')).toBeInTheDocument();
  });
  
  it('認証中のローディング状態が表示されること', async () => {
    // 認証ローディング中
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: true,
    });
    
    render(<DashboardPage />);
    
    // ローディングインジケータが表示されていることを確認
    const loadingElement = document.querySelector('.animate-spin');
    expect(loadingElement).toBeInTheDocument();
    
    // サブコンポーネントが表示されていないことを確認
    expect(screen.queryByTestId('activity-summary')).not.toBeInTheDocument();
    expect(screen.queryByTestId('giver-score-chart')).not.toBeInTheDocument();
    expect(screen.queryByTestId('activity-type-chart')).not.toBeInTheDocument();
  });
  
  it('未認証ユーザーにはログインメッセージが表示されること', async () => {
    // 未認証状態
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
    });
    
    render(<DashboardPage />);
    
    // ログインが必要なメッセージが表示されていることを確認
    expect(screen.getByText('ログインが必要です')).toBeInTheDocument();
    
    // サブコンポーネントが表示されていないことを確認
    expect(screen.queryByTestId('activity-summary')).not.toBeInTheDocument();
    expect(screen.queryByTestId('giver-score-chart')).not.toBeInTheDocument();
    expect(screen.queryByTestId('activity-type-chart')).not.toBeInTheDocument();
  });
  
  it('ユーザー名が正しく表示されること', async () => {
    // Emailからユーザー名を抽出するテスト
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'test-user-123', email: 'testuser@example.com' },
      loading: false,
    });
    
    render(<DashboardPage />);
    
    // メールアドレスから抽出したユーザー名が表示されていることを確認
    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });
  });
  
  it('レコメンドセクションが表示されること', async () => {
    render(<DashboardPage />);
    
    // レコメンドセクションが表示されていることを確認
    expect(screen.getByText('今日のレコメンド')).toBeInTheDocument();
    
    // レコメンドアイテムが表示されていることを確認
    expect(screen.getByText('英語学習の基本ガイド')).toBeInTheDocument();
    expect(screen.getByText('文法マスターへの道')).toBeInTheDocument();
    expect(screen.getByText('効果的な単語学習法')).toBeInTheDocument();
  });
  
  it('最近の活動が表示されること', async () => {
    render(<DashboardPage />);
    
    // 最近の活動セクションが表示されていることを確認
    expect(screen.getByText('最近の活動')).toBeInTheDocument();
    
    // 活動アイテムが表示されていることを確認
    expect(screen.getByText(/教材「英語リスニング上達のコツ」を作成しました/)).toBeInTheDocument();
  });
}); 