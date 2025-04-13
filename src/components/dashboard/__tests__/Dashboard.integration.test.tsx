import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../Dashboard';
import { createClient } from '@supabase/supabase-js';

// Supabaseクライアントのモック
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          data: [
            {
              created_materials_count: 5,
              earned_points: 1200,
              viewed_materials_count: 15,
              giver_scores: [
                { date: '2024-03-01', score: 65 },
                { date: '2024-03-02', score: 68 },
                { date: '2024-03-03', score: 72 }
              ],
              activity_distribution: [
                { type: '教材作成', percentage: 35 },
                { type: '教材閲覧', percentage: 25 },
                { type: 'フィードバック', percentage: 20 },
                { type: 'その他', percentage: 20 }
              ]
            }
          ],
          error: null
        }))
      }))
    }))
  }))
}));

// framer-motionのモック
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('Dashboard Integration Tests', () => {
  const mockUserId = 'test-user-id';

  beforeEach(() => {
    // テスト前にモックをリセット
    jest.clearAllMocks();
  });

  it('ダッシュボード全体が正しくレンダリングされ、データが表示される', async () => {
    render(<Dashboard userId={mockUserId} />);

    // ヘッダーが表示されることを確認
    expect(screen.getByText('マイダッシュボード')).toBeInTheDocument();

    // ActivitySummaryのデータが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('5件')).toBeInTheDocument();
      expect(screen.getByText('1200pt')).toBeInTheDocument();
      expect(screen.getByText('15件')).toBeInTheDocument();
    });

    // チャートのタイトルが表示されることを確認
    expect(screen.getByText('ギバースコア推移')).toBeInTheDocument();
    expect(screen.getByText('活動種類別')).toBeInTheDocument();
  });

  it('データ取得中にローディング状態が表示される', async () => {
    render(<Dashboard userId={mockUserId} />);

    // ローディング表示を確認
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();

    // データ表示後にローディングが消えることを確認
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });
  });

  it('データ取得エラー時にエラーメッセージが表示される', async () => {
    // エラーを発生させるようにモックを変更
    (createClient as jest.Mock).mockImplementationOnce(() => ({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            data: null,
            error: new Error('データの取得に失敗しました')
          }))
        }))
      }))
    }));

    render(<Dashboard userId={mockUserId} />);

    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('データの取得に失敗しました')).toBeInTheDocument();
    });
  });

  it('各コンポーネントが適切なデータを受け取っていることを確認', async () => {
    render(<Dashboard userId={mockUserId} />);

    await waitFor(() => {
      // ActivitySummaryのデータ確認
      expect(screen.getByText('活動サマリー')).toBeInTheDocument();
      expect(screen.getByText('5件')).toBeInTheDocument();

      // GiverScoreChartのデータ確認
      expect(screen.getByText('ギバースコア推移')).toBeInTheDocument();
      expect(screen.getByText('過去の活動によるスコア変化を確認できます')).toBeInTheDocument();

      // ActivityPieChartのデータ確認
      expect(screen.getByText('活動種類別')).toBeInTheDocument();
    });
  });
}); 