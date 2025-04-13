import { renderHook, act } from '@testing-library/react';
import { useActivityLog } from '../useActivityLog';
import { ActivityType } from '@/types/quiz';
import { calculateScoreChange } from '@/utils/score';

// calculateScoreChangeをモック
jest.mock('@/utils/score', () => ({
  calculateScoreChange: jest.fn()
}));

// グローバルfetchのモック
global.fetch = jest.fn();

// モック関数のタイプキャスト
const mockedFetch = global.fetch as jest.Mock;
const mockedCalculateScoreChange = calculateScoreChange as jest.Mock;

describe('useActivityLog', () => {
  beforeEach(() => {
    // 各テスト前にモックをリセット
    jest.clearAllMocks();
    
    // デフォルトのスコア変更をモック
    mockedCalculateScoreChange.mockReturnValue({
      giver: 5,
      taker: 0,
      matcher: 2
    });
    
    // fetchのレスポンスをモック
    mockedFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    });
  });

  it('新しい活動をログに記録する', async () => {
    const userId = 123;
    const { result } = renderHook(() => useActivityLog(userId));
    
    expect(result.current.activityLogs).toEqual([]);
    expect(result.current.currentScores).toEqual({
      giver: 0,
      taker: 0,
      matcher: 0
    });
    
    // 新しい活動を記録
    await act(async () => {
      await result.current.logActivity('CREATE_CONTENT');
    });
    
    // 活動ログにエントリが追加されたことを確認
    expect(result.current.activityLogs.length).toBe(1);
    expect(result.current.activityLogs[0]).toEqual(expect.objectContaining({
      userId,
      activityType: 'CREATE_CONTENT'
    }));
    
    // スコアが更新されたことを確認
    expect(result.current.currentScores).toEqual({
      giver: 5,
      taker: 0,
      matcher: 2
    });
    
    // APIが呼ばれたことを確認
    expect(mockedFetch).toHaveBeenCalledWith(
      expect.stringContaining('/log_activity.php'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      })
    );
  });

  it('複数の活動による累積スコアを計算する', async () => {
    const userId = 123;
    const { result } = renderHook(() => useActivityLog(userId));
    
    // コンテンツ作成活動のスコア変化
    mockedCalculateScoreChange.mockReturnValueOnce({
      giver: 5,
      taker: 0,
      matcher: 2
    });
    
    // 最初の活動を記録
    await act(async () => {
      await result.current.logActivity('CREATE_CONTENT');
    });
    
    // フィードバック提供活動のスコア変化
    mockedCalculateScoreChange.mockReturnValueOnce({
      giver: 3,
      taker: 0,
      matcher: 1
    });
    
    // 2つ目の活動を記録
    await act(async () => {
      await result.current.logActivity('PROVIDE_FEEDBACK');
    });
    
    // 累積スコアを確認
    expect(result.current.currentScores).toEqual({
      giver: 8,  // 5 + 3
      taker: 0,  // 0 + 0
      matcher: 3 // 2 + 1
    });
    
    // 活動ログに2つのエントリがあることを確認
    expect(result.current.activityLogs.length).toBe(2);
  });

  it('最近の活動履歴を取得する', async () => {
    const userId = 123;
    const mockActivities = [
      {
        id: 1,
        userId,
        activityType: 'CREATE_CONTENT',
        scoreChange: { giver: 5, taker: 0, matcher: 2 },
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        userId,
        activityType: 'PROVIDE_FEEDBACK',
        scoreChange: { giver: 3, taker: 0, matcher: 1 },
        createdAt: new Date().toISOString()
      }
    ];
    
    // 活動履歴取得のレスポンスをモック
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ activities: mockActivities })
    });
    
    const { result } = renderHook(() => useActivityLog(userId));
    
    // 活動履歴を取得
    await act(async () => {
      await result.current.getRecentActivities(5);
    });
    
    // 返されたデータを確認
    expect(result.current.activityLogs).toEqual(mockActivities);
    
    // APIが正しく呼ばれたことを確認
    expect(mockedFetch).toHaveBeenCalledWith(
      expect.stringContaining(`/get_activities.php?userId=${userId}&limit=5`)
    );
  });

  it('API呼び出しが失敗した場合にエラーを投げる', async () => {
    const userId = 123;
    
    // 失敗レスポンスをモック
    mockedFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });
    
    const { result } = renderHook(() => useActivityLog(userId));
    
    // logActivityが例外を投げることを確認
    await expect(result.current.logActivity('CREATE_CONTENT')).rejects.toThrow();
  });
}); 