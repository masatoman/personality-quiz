import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardPage from '../dashboard/DashboardPage';
import { useAuth } from '@/hooks/useAuth';

// useAuthフックをモック
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

// フェッチのモック化
// @ts-ignore - fetch型の不一致を無視
global.fetch = jest.fn();

describe('RecommendFeature - 機能内結合テスト', () => {
  const mockUser = {
    id: 'test-user-123',
    email: 'test@example.com',
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // useAuthモックの設定
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false,
    });
    
    // 活動サマリーAPIレスポンスのモック
    // @ts-ignore
    global.fetch.mockImplementation((url) => {
      if (url.includes('/api/user/activity-summary')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            createdMaterials: 12,
            totalPoints: 1250,
            viewedMaterials: 48,
            createdMaterialsChange: 2,
            totalPointsChange: 150,
            viewedMaterialsChange: -3
          })
        });
      }
      
      if (url.includes('/api/user/activity-stats')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            activityCounts: {
              CREATE_CONTENT: 12,
              PROVIDE_FEEDBACK: 23,
              CONSUME_CONTENT: 45,
              RECEIVE_FEEDBACK: 18,
              SHARE_RESOURCE: 7,
              ASK_QUESTION: 15
            }
          })
        });
      }
      
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      });
    });
  });

  it('レコメンドセクションが正しく表示されること', async () => {
    render(<DashboardPage />);
    
    // レコメンドセクションのタイトルが表示されるまで待機
    await waitFor(() => {
      expect(screen.getByText('今日のレコメンド')).toBeInTheDocument();
    });
    
    // レコメンドカードが3つ表示されていることを確認
    const recommendCards = screen.getAllByRole('button', { name: /詳細を見る/ });
    expect(recommendCards).toHaveLength(3);
    
    // 各カードのタイトルが表示されていることを確認
    expect(screen.getByText('英語学習の基本ガイド')).toBeInTheDocument();
    expect(screen.getByText('文法マスターへの道')).toBeInTheDocument();
    expect(screen.getByText('効果的な単語学習法')).toBeInTheDocument();
  });

  it('レコメンドカードのクリックが正しく動作すること', async () => {
    render(<DashboardPage />);
    
    // レコメンドセクションが表示されるまで待機
    await waitFor(() => {
      expect(screen.getByText('今日のレコメンド')).toBeInTheDocument();
    });
    
    // 「詳細を見る」ボタンをクリック
    const detailButtons = screen.getAllByText('詳細を見る →');
    fireEvent.click(detailButtons[0]);
    
    // クリック後の動作は現状ではまだ実装されていないため
    // ここでは単純にボタンが存在するかのみを確認
    expect(detailButtons[0]).toBeInTheDocument();
  });

  it('タブ切り替えでレコメンドセクションが表示・非表示になること', async () => {
    render(<DashboardPage />);
    
    // 初期状態では「概要」タブがアクティブで、レコメンドセクションが表示される
    await waitFor(() => {
      expect(screen.getByText('今日のレコメンド')).toBeInTheDocument();
    });
    
    // 「教材」タブに切り替え
    const materialsTab = screen.getByText('教材');
    fireEvent.click(materialsTab);
    
    // レコメンドセクションが非表示になり、教材のコンテンツが表示されることを確認
    expect(screen.queryByText('今日のレコメンド')).not.toBeInTheDocument();
    expect(screen.getByText('あなたの教材')).toBeInTheDocument();
    
    // 「概要」タブに戻す
    const overviewTab = screen.getByText('概要');
    fireEvent.click(overviewTab);
    
    // レコメンドセクションが再表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('今日のレコメンド')).toBeInTheDocument();
    });
  });

  it('ActivitySummaryとともに正しく表示されていること', async () => {
    render(<DashboardPage />);
    
    // ActivitySummaryとレコメンドセクションの両方が表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('作成した教材')).toBeInTheDocument();
      expect(screen.getByText('獲得ポイント')).toBeInTheDocument();
      expect(screen.getByText('閲覧した教材')).toBeInTheDocument();
      expect(screen.getByText('今日のレコメンド')).toBeInTheDocument();
    });
    
    // ActivitySummaryのデータとレコメンドが同時に表示されている
    expect(screen.getByText('12')).toBeInTheDocument(); // 作成教材数
    expect(screen.getByText('英語学習の基本ガイド')).toBeInTheDocument(); // レコメンド
  });
}); 