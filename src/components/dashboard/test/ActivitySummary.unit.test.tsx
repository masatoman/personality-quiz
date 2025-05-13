import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ActivitySummary from '@/components/dashboard/ActivitySummary';

// ActivitySummaryコンポーネントのAPIをモック
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      prefetch: jest.fn(),
    };
  },
}));

// フェッチのモック化
// @ts-ignore - fetch型の不一致を無視
global.fetch = jest.fn();

describe('ActivitySummary Component', () => {
  const mockUserId = 'test-user-123';
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ローディング状態が正しく表示されること', async () => {
    // フェッチがすぐには解決しないようにモック
    // @ts-ignore
    global.fetch.mockImplementation(() => new Promise(() => {}));
    
    render(<ActivitySummary userId={mockUserId} />);
    
    // ローディングインジケータ要素（animate-pulse）が表示されることを確認
    const loadingElements = document.querySelectorAll('.animate-pulse');
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it('エラー状態が正しく表示されること', async () => {
    // 失敗するフェッチをモック
    // @ts-ignore
    global.fetch.mockRejectedValueOnce(new Error('API error'));
    
    render(<ActivitySummary userId={mockUserId} />);
    
    // エラーメッセージが表示されるまで待機
    await waitFor(() => {
      expect(screen.getByText(/エラーが発生しました/i)).toBeInTheDocument();
    });
  });

  it('データが正しく表示されること', async () => {
    // 成功するフェッチレスポンスをモック
    const mockData = {
      createdMaterials: 12,
      totalPoints: 1250,
      viewedMaterials: 48,
      createdMaterialsChange: 2, 
      totalPointsChange: 150,
      viewedMaterialsChange: -3
    };
    
    // @ts-ignore
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });
    
    render(<ActivitySummary userId={mockUserId} />);
    
    // データが表示されるまで待機
    await waitFor(() => {
      // 各データ項目が表示されていることを確認
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('1250')).toBeInTheDocument();
      expect(screen.getByText('48')).toBeInTheDocument();
    });
    
    // タイトルが正しく表示されていることを確認
    expect(screen.getByText('作成した教材')).toBeInTheDocument();
    expect(screen.getByText('獲得ポイント')).toBeInTheDocument();
    expect(screen.getByText('閲覧した教材')).toBeInTheDocument();
    
    // 前週比の変化が表示されていることを確認
    await waitFor(() => {
      // 正の変化
      const positiveChanges = screen.getAllByText(/2/);
      expect(positiveChanges.length).toBeGreaterThan(0);
      
      // 正の変化
      const positivePointChanges = screen.getAllByText(/150/);
      expect(positivePointChanges.length).toBeGreaterThan(0);
      
      // 負の変化
      const negativeChanges = screen.getAllByText(/3/);
      expect(negativeChanges.length).toBeGreaterThan(0);
    });
  });

  it('APIが正しいURLで呼び出されること', async () => {
    // 成功するフェッチレスポンスをモック
    // @ts-ignore
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });
    
    render(<ActivitySummary userId={mockUserId} />);
    
    // APIが正しいURLとパラメータで呼び出されたか確認
    expect(global.fetch).toHaveBeenCalledWith(`/api/user/activity-summary?userId=${mockUserId}`);
  });
  
  it('データが存在しない場合は代替コンテンツが表示されること', async () => {
    // 空のレスポンスをモック
    // @ts-ignore
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => null,
    });
    
    render(<ActivitySummary userId={mockUserId} />);
    
    // ローディングが終了するまで待機
    await waitFor(() => {
      // ローディング要素が消えることを確認
      const loadingElements = document.querySelectorAll('.animate-pulse');
      expect(loadingElements.length).toBe(0);
    });
    
    // 実際のコンポーネントの実装に合わせてテストを修正
    // ActivitySummaryがnullを返す代わりに何も表示しない場合
    // もしくはスケルトンローダーを表示し続ける場合は、
    // その実装に合わせたアサーションに変更する
    expect(document.body.textContent).not.toContain('作成した教材');
    expect(document.body.textContent).not.toContain('獲得ポイント');
    expect(document.body.textContent).not.toContain('閲覧した教材');
  });

  const mockProps = {
    createdMaterials: 12,
    earnedPoints: 1250,
    viewedMaterials: 48
  };
  
  it('ユーザーの活動サマリー情報が正しく表示されること', () => {
    render(<ActivitySummary {...mockProps} />);
    
    // 各データ項目のタイトルと値が表示されていることを確認
    expect(screen.getByText('作成した教材')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    
    expect(screen.getByText('獲得ポイント')).toBeInTheDocument();
    expect(screen.getByText('1250')).toBeInTheDocument();
    
    expect(screen.getByText('閲覧した教材')).toBeInTheDocument();
    expect(screen.getByText('48')).toBeInTheDocument();
  });
  
  it('空の値でもコンポーネントが正しく表示されること', () => {
    const emptyProps = {
      createdMaterials: 0,
      earnedPoints: 0,
      viewedMaterials: 0
    };
    
    render(<ActivitySummary {...emptyProps} />);
    
    // ゼロ値が正しく表示されることを確認
    expect(screen.getByText('作成した教材')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });
}); 