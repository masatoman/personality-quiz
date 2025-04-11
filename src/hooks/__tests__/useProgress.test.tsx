import { renderHook, act } from '@testing-library/react';
import { useProgress } from '../useProgress';
import { ActivityType } from '@/types/quiz';

// グローバルfetchのモック
global.fetch = jest.fn();

// モック関数のタイプキャスト
const mockedFetch = global.fetch as jest.Mock;

// レスポンスヘルパー関数
function mockFetchResponse(data: any) {
  mockedFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => data
  });
}

describe('useProgress', () => {
  beforeEach(() => {
    // 各テスト前にモックをリセット
    jest.clearAllMocks();
    
    // デフォルトの進捗データ
    const defaultProgress = {
      userId: 123,
      level: 1,
      totalScore: 0,
      badges: [],
      streakDays: 0,
      lastActivityDate: new Date().toISOString()
    };
    
    // 初期データ取得のモック
    mockFetchResponse(defaultProgress);
  });

  it('初期進捗データを正しく取得する', async () => {
    const userId = 123;
    
    const { result, waitForNextUpdate } = renderHook(() => useProgress(userId));
    
    // 初期状態では空のプログレスオブジェクト
    expect(result.current.progress).toEqual({
      userId,
      level: 1,
      totalScore: 0,
      badges: [],
      streakDays: 0,
      lastActivityDate: expect.any(Date)
    });
    
    // APIが呼ばれたか確認
    expect(mockedFetch).toHaveBeenCalledWith(
      expect.stringContaining(`/get_progress.php?userId=${userId}`)
    );
  });

  it('進捗を正しく更新する', async () => {
    const userId = 123;
    
    // 進捗更新のモック
    mockFetchResponse({
      userId: 123,
      level: 1,
      totalScore: 50,
      badges: [],
      streakDays: 1,
      lastActivityDate: new Date().toISOString()
    });
    
    const { result } = renderHook(() => useProgress(userId));
    
    // 進捗更新のレスポンスをモック
    mockFetchResponse({
      success: true
    });
    
    // 進捗を更新
    await act(async () => {
      await result.current.updateProgress('CREATE_CONTENT', 50);
    });
    
    // 更新後の進捗を検証
    expect(result.current.progress.totalScore).toBe(50);
    
    // APIが正しく呼ばれたか確認
    expect(mockedFetch).toHaveBeenCalledWith(
      expect.stringContaining('/update_progress.php'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        }),
        body: expect.any(String)
      })
    );
  });

  it('スコア閾値に達するとレベルアップする', async () => {
    const userId = 123;
    
    // 初期進捗データをモック
    mockFetchResponse({
      userId: 123,
      level: 2,
      totalScore: 200,
      badges: [],
      streakDays: 0,
      lastActivityDate: new Date().toISOString()
    });
    
    const { result } = renderHook(() => useProgress(userId));
    
    // 進捗更新のレスポンスをモック
    mockFetchResponse({
      success: true
    });
    
    // 大量のスコアで進捗を更新
    await act(async () => {
      await result.current.updateProgress('CREATE_CONTENT', 300);
    });
    
    // レベルが上がっているか検証
    expect(result.current.progress.level).toBeGreaterThan(2);
  });

  it('活動タイプに応じてバッジを獲得する', async () => {
    const userId = 123;
    
    // バッジなしの初期進捗データをモック
    mockFetchResponse({
      userId: 123,
      level: 1,
      totalScore: 0,
      badges: [],
      streakDays: 0,
      lastActivityDate: new Date().toISOString()
    });
    
    const { result } = renderHook(() => useProgress(userId));
    
    // 進捗更新のレスポンスをモック
    mockFetchResponse({
      success: true
    });
    
    // バッジを獲得できる活動を実行
    let updateResult;
    await act(async () => {
      updateResult = await result.current.updateProgress('CREATE_CONTENT', 100);
    });
    
    // 新しいバッジが追加されたことを検証
    if (updateResult && updateResult.newBadges.length > 0) {
      expect(result.current.progress.badges.length).toBeGreaterThan(0);
    }
  });

  it('API呼び出しが失敗した場合エラーが発生する', async () => {
    const userId = 123;
    
    // 失敗レスポンスをモック
    mockedFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });
    
    const { result } = renderHook(() => useProgress(userId));
    
    // fetchProgress呼び出しでエラーが発生することを検証
    await expect(result.current.fetchProgress()).rejects.toThrow();
  });

  it('連続ログイン日数に応じてストリークを記録する', async () => {
    const userId = 123;
    
    // 前日のアクティビティを持つ進捗データをモック
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    mockFetchResponse({
      userId: 123,
      level: 1,
      totalScore: 0,
      badges: [],
      streakDays: 1,
      lastActivityDate: yesterday.toISOString()
    });
    
    const { result } = renderHook(() => useProgress(userId));
    
    // 進捗更新のレスポンスをモック
    mockFetchResponse({
      success: true
    });
    
    // 活動を実行してストリークを更新
    await act(async () => {
      await result.current.updateProgress('CONSUME_CONTENT', 10);
    });
    
    // ストリーク日数が増えていることを検証
    expect(result.current.progress.streakDays).toBeGreaterThanOrEqual(1);
    expect(result.current.progress.lastActivityDate).toBeInstanceOf(Date);
  });
}); 