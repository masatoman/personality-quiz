import { renderHook, act } from '@testing-library/react';
import { useDashboardData } from '../useDashboardData';
import type { DashboardData } from '@/types/dashboard';

describe('useDashboardData', () => {
  const mockDashboardData: DashboardData = {
    summary: {
      createdMaterials: 10,
      earnedPoints: 100,
      viewedMaterials: 20
    },
    giverScores: [
      { date: '2024-01-01', score: 80 },
      { date: '2024-01-02', score: 85 }
    ],
    activityDistribution: [
      { type: '教材作成', percentage: 35 },
      { type: '教材閲覧', percentage: 25 }
    ]
  };

  beforeEach(() => {
    // グローバルのfetchをモック化
    global.fetch = jest.fn(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockDashboardData)
      })
    ) as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('データを正常に取得できる', async () => {
    const { result } = renderHook(() => useDashboardData());

    // 初期状態を確認
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeNull();

    // データ取得の完了を待つ
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // 最終状態を確認
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.data).toEqual(mockDashboardData);
  });

  it('APIエラーを適切に処理する', async () => {
    const errorMessage = 'Failed to fetch data';
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: errorMessage
      })
    );

    const { result } = renderHook(() => useDashboardData());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(`Error: ${errorMessage}`);
    expect(result.current.data).toBeNull();
  });

  it('ネットワークエラーを適切に処理する', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.reject(new Error('Network error'))
    );

    const { result } = renderHook(() => useDashboardData());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Error: Network error');
    expect(result.current.data).toBeNull();
  });
}); 