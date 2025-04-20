import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ActivityTypeChart from '../ActivityTypeChart';

// ActivityTypeChartコンポーネントの依存関係をモック
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      prefetch: jest.fn(),
    };
  },
}));

// recharts コンポーネントをモック
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children, ...props }: any) => (
      <div data-testid="responsive-container" {...props}>
        {children}
      </div>
    ),
    PieChart: ({ children, ...props }: any) => (
      <div data-testid="pie-chart" {...props}>
        {children}
      </div>
    ),
    Pie: ({ children, ...props }: any) => (
      <div data-testid="recharts-pie" {...props}>
        {children}
      </div>
    ),
    Cell: ({ ...props }: any) => <div data-testid="recharts-cell" {...props} />,
    Tooltip: ({ ...props }: any) => <div data-testid="recharts-tooltip" {...props} />,
    Legend: ({ ...props }: any) => <div data-testid="recharts-legend" {...props} />,
  };
});

// フェッチのモック化
// @ts-ignore - fetch型の不一致を無視
global.fetch = jest.fn();

describe('ActivityTypeChart Component', () => {
  const mockUserId = 'test-user-123';
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ローディング状態が正しく表示されること', async () => {
    // フェッチがすぐには解決しないようにモック
    // @ts-ignore
    global.fetch.mockImplementation(() => new Promise(() => {}));
    
    render(<ActivityTypeChart userId={mockUserId} />);
    
    // ローディングインジケータが表示されることを確認
    const loadingElement = screen.getByText(/。/i).closest('div')?.querySelector('.animate-spin');
    expect(loadingElement).toBeInTheDocument();
  });

  it('エラー状態が正しく表示されること', async () => {
    // 失敗するフェッチをモック
    // @ts-ignore
    global.fetch.mockRejectedValueOnce(new Error('API error'));
    
    render(<ActivityTypeChart userId={mockUserId} />);
    
    // エラーメッセージが表示されるまで待機
    await waitFor(() => {
      expect(screen.getByText(/エラーが発生しました/i)).toBeInTheDocument();
    });
  });

  it('データが正しく表示され、グラフコンポーネントがレンダリングされること', async () => {
    // 成功するフェッチレスポンスをモック
    const mockData = {
      activityCounts: {
        'CREATE_CONTENT': 12,
        'PROVIDE_FEEDBACK': 23,
        'CONSUME_CONTENT': 45,
        'RECEIVE_FEEDBACK': 18,
        'SHARE_RESOURCE': 7,
        'ASK_QUESTION': 15,
        'COMPLETE_RESOURCE': 8,
        'START_RESOURCE': 5,
        'QUIZ_COMPLETE': 10,
        'DAILY_LOGIN': 3
      }
    };
    
    // @ts-ignore
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });
    
    render(<ActivityTypeChart userId={mockUserId} />);
    
    // ローディングが終了して、グラフコンポーネントが表示されるまで待機
    await waitFor(() => {
      // recharts コンポーネントが表示されていることを確認
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
      expect(screen.getByTestId('recharts-pie')).toBeInTheDocument();
    });
    
    // タイトルが正しく表示されていることを確認
    expect(screen.getByText('活動種類の割合')).toBeInTheDocument();
    
    // 各活動タイプのラベルが表示されていることを確認
    expect(screen.getByText(/コンテンツ作成/)).toBeInTheDocument();
    expect(screen.getByText(/フィードバック提供/)).toBeInTheDocument();
    expect(screen.getByText(/コンテンツ利用/)).toBeInTheDocument();
    expect(screen.getByText(/リソース完了/)).toBeInTheDocument();
    
    // 総活動数が表示されていることを確認
    const totalActivities = Object.values(mockData.activityCounts).reduce((sum, count) => sum + count, 0);
    expect(screen.getByText(`総活動数: ${totalActivities}回`)).toBeInTheDocument();
  });

  it('データがない場合のメッセージが表示されること', async () => {
    // 空のデータをモック
    const mockEmptyData = {
      activityCounts: {}
    };
    
    // @ts-ignore
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockEmptyData,
    });
    
    render(<ActivityTypeChart userId={mockUserId} />);
    
    // データがないメッセージが表示されるまで待機
    await waitFor(() => {
      expect(screen.getByText(/まだ活動データがありません/i)).toBeInTheDocument();
    });
  });

  it('APIが正しいURLとパラメータで呼び出されること', async () => {
    // 成功するフェッチレスポンスをモック
    // @ts-ignore
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ activityCounts: {} }),
    });
    
    render(<ActivityTypeChart userId={mockUserId} />);
    
    // APIが呼び出されたことを確認
    expect(global.fetch).toHaveBeenCalledTimes(1);
    
    // URLに userId パラメータが含まれていることを確認
    const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0];
    expect(fetchCall).toContain(`userId=${mockUserId}`);
    expect(fetchCall).toContain(`/api/user/activity-stats`);
  });
  
  it('ヘルプテキストが表示されること', async () => {
    // 成功するフェッチレスポンスをモック
    // @ts-ignore
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ activityCounts: { 'CREATE_CONTENT': 1 } }),
    });
    
    render(<ActivityTypeChart userId={mockUserId} />);
    
    // ヘルプテキストが表示されるまで待機
    await waitFor(() => {
      expect(screen.getByText(/ギバースコアの向上には/i)).toBeInTheDocument();
      expect(screen.getByText(/特に「コンテンツ作成」と「フィードバック提供」が効果的です/i)).toBeInTheDocument();
    });
  });
}); 