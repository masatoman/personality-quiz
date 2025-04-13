import { useState, useEffect } from 'react';
import { DashboardData } from '@/types/dashboard';

interface UseDashboardDataResult {
  data: DashboardData | null;
  error: string | null;
  loading: boolean;
}

export const useDashboardData = (userId: string): UseDashboardDataResult => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/dashboard?userId=${userId}`);
        if (!response.ok) {
          throw new Error('データの取得に失敗しました');
        }
        const json = await response.json();
        setData(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  return { data, error, loading };
}; 