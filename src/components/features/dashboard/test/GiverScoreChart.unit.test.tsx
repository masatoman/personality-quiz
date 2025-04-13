import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';
import GiverScoreChart from '../GiverScoreChart';

// GiverScoreChartコンポーネントの依存関係をモック
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
    LineChart: ({ children, ...props }: any) => (
      <div data-testid="line-chart" {...props}>
        {children}
      </div>
    ),
    Line: ({ ...props }: any) => <div data-testid="recharts-line" {...props} />,
    XAxis: ({ ...props }: any) => <div data-testid="recharts-xaxis" {...props} />,
    YAxis: ({ ...props }: any) => <div data-testid="recharts-yaxis" {...props} />,
    CartesianGrid: ({ ...props }: any) => <div data-testid="recharts-grid" {...props} />,
    Tooltip: ({ ...props }: any) => <div data-testid="recharts-tooltip" {...props} />,
    Legend: ({ ...props }: any) => <div data-testid="recharts-legend" {...props} />,
  };
});

// フェッチのモック化
// @ts-ignore - fetch型の不一致を無視
global.fetch = jest.fn();

describe('GiverScoreChart Component', () => {
  const mockUserId = 'test-user-123';
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ローディング状態が正しく表示されること', async () => {
    // フェッチがすぐには解決しないようにモック
    // @ts-ignore
    global.fetch.mockImplementation(() => new Promise(() => {}));
    
    render(<GiverScoreChart userId={mockUserId} />);
    
    // ローディングインジケータが表示されることを確認
    const loadingElement = screen.getByTestId('responsive-container').querySelector('.animate-spin');
    expect(loadingElement).toBeInTheDocument();
  });

  it('エラー状態が正しく表示されること', async () => {
    // 失敗するフェッチをモック
    // @ts-ignore
    global.fetch.mockRejectedValueOnce(new Error('API error'));
    
    render(<GiverScoreChart userId={mockUserId} />);
    
    // エラーメッセージが表示されるまで待機
    await waitFor(() => {
      expect(screen.getByText(/エラーが発生しました/i)).toBeInTheDocument();
    });
  });

  it('データが正しく表示され、グラフコンポーネントがレンダリングされること', async () => {
    // 成功するフェッチレスポンスをモック
    const mockData = {
      history: [
        { userId: mockUserId, score: 65, timestamp: '2023-04-01T00:00:00.000Z' },
        { userId: mockUserId, score: 70, timestamp: '2023-04-15T00:00:00.000Z' },
        { userId: mockUserId, score: 75, timestamp: '2023-04-30T00:00:00.000Z' }
      ]
    };
    
    // @ts-ignore
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });
    
    render(<GiverScoreChart userId={mockUserId} />);
    
    // ローディングが終了して、グラフコンポーネントが表示されるまで待機
    await waitFor(() => {
      // recharts コンポーネントが表示されていることを確認
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.getByTestId('recharts-line')).toBeInTheDocument();
      expect(screen.getByTestId('recharts-xaxis')).toBeInTheDocument();
      expect(screen.getByTestId('recharts-yaxis')).toBeInTheDocument();
    });
    
    // タイトルが正しく表示されていることを確認
    expect(screen.getByText('ギバースコア推移')).toBeInTheDocument();
  });

  it('期間切り替えボタンが正しく機能すること', async () => {
    // 成功するフェッチレスポンスをモック
    const mockData = {
      history: [
        { userId: mockUserId, score: 65, timestamp: '2023-04-01T00:00:00.000Z' },
        { userId: mockUserId, score: 70, timestamp: '2023-04-15T00:00:00.000Z' },
        { userId: mockUserId, score: 75, timestamp: '2023-04-30T00:00:00.000Z' }
      ]
    };
    
    // @ts-ignore
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });
    
    render(<GiverScoreChart userId={mockUserId} />);
    
    // データがロードされるまで待機
    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
    
    // 期間切り替えボタンをクリック
    fireEvent.click(screen.getByText('1週間'));
    
    // 新しいAPIリクエストが送信されたことを確認
    expect(global.fetch).toHaveBeenCalledTimes(2);
    
    // 3ヶ月ボタンをクリック
    fireEvent.click(screen.getByText('3ヶ月'));
    
    // さらに新しいAPIリクエストが送信されたことを確認
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it('APIが正しいURLとパラメータで呼び出されること', async () => {
    // 成功するフェッチレスポンスをモック
    // @ts-ignore
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ history: [] }),
    });
    
    render(<GiverScoreChart userId={mockUserId} />);
    
    // APIが呼び出されたことを確認
    expect(global.fetch).toHaveBeenCalledTimes(1);
    
    // URLに userId パラメータが含まれていることを確認
    const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0];
    expect(fetchCall).toContain(`userId=${mockUserId}`);
    expect(fetchCall).toContain(`/api/user/giver-score-history`);
  });
}); 