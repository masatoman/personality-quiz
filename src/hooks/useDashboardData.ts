import { useState, useEffect, useCallback, useMemo } from 'react';
import { unstable_cache } from 'next/cache';
import type { DashboardData } from '@/types/dashboard';

const CACHE_KEY = 'dashboard_data';
const CACHE_TTL = 5 * 60 * 1000; // 5分
const BATCH_SIZE = 50; // 一度に処理するデータ数

interface UseDashboardDataResult {
  data: DashboardData | null;
  error: string | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

// メモリ内キャッシュ
const memoryCache = new Map<string, { data: DashboardData; timestamp: number }>();

// ダッシュボードデータ取得をキャッシュ化
const fetchDashboardData = unstable_cache(
  async (userId: string) => {
    // メモリキャッシュをチェック
    const cached = memoryCache.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return { data: cached.data };
    }

    const response = await fetch(`/api/dashboard?userId=${userId}`);
    if (!response.ok) {
      throw new Error('データの取得に失敗しました');
    }
    const result = await response.json();

    // メモリキャッシュを更新
    memoryCache.set(userId, {
      data: result.data,
      timestamp: Date.now()
    });

    return result;
  },
  ['dashboard'],
  { revalidate: 300 } // 5分でキャッシュを再検証
);

// データの非同期処理
const processDashboardData = async (data: DashboardData): Promise<DashboardData> => {
  const processedData = { ...data };
  
  // 大量データを持つプロパティを非同期で処理
  if (data.activities && data.activities.length > BATCH_SIZE) {
    const processedActivities = [];
    for (let i = 0; i < data.activities.length; i += BATCH_SIZE) {
      const batch = data.activities.slice(i, i + BATCH_SIZE);
      // 各アクティビティの処理（例：日付のフォーマット、データの正規化など）
      const processed = batch.map(activity => ({
        ...activity,
        timestamp: new Date(activity.timestamp).toISOString(),
        // 他の必要な処理
      }));
      processedActivities.push(...processed);
      
      // バッチ処理の間に短い遅延を入れる
      if (i + BATCH_SIZE < data.activities.length) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    processedData.activities = processedActivities;
  }
  
  return processedData;
};

export const useDashboardData = (userId: string): UseDashboardDataResult => {
  const [data, setData] = useState<DashboardData | null>(() => {
    // 初期値としてローカルストレージのキャッシュを使用
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!data);

  // メモ化したフェッチ関数
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchDashboardData(userId);
      const processedData = await processDashboardData(result.data);
      setData(processedData);
      // キャッシュを更新
      localStorage.setItem(CACHE_KEY, JSON.stringify(processedData));
      localStorage.setItem(`${CACHE_KEY}_timestamp`, Date.now().toString());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
      // キャッシュされたデータがある場合は、それを使用
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        setData(JSON.parse(cached));
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // キャッシュの有効性をチェックするメモ化関数
  const isCacheValid = useMemo(() => {
    const lastUpdate = localStorage.getItem(`${CACHE_KEY}_timestamp`);
    if (!lastUpdate) return false;
    return Date.now() - Number(lastUpdate) <= CACHE_TTL;
  }, []);

  useEffect(() => {
    if (!isCacheValid) {
      fetchData();
    }
  }, [fetchData, isCacheValid]);

  return { data, error, loading, refetch: fetchData };
}; 