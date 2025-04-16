import { unstable_cache } from 'next/cache';

type CacheData<T> = {
  data: T;
  timestamp: number;
};

const CACHE_TTL = 60 * 60 * 1000; // 1時間

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const cached = await unstable_cache(
      async () => {
        return null;
      },
      [key]
    )();

    if (!cached) return null;

    const cacheData = cached as CacheData<T>;
    if (Date.now() - cacheData.timestamp > CACHE_TTL) {
      return null;
    }

    return cacheData.data;
  } catch (error) {
    console.error('キャッシュの取得に失敗しました:', error);
    return null;
  }
}

export async function setCache<T>(key: string, data: T): Promise<void> {
  try {
    const cacheData: CacheData<T> = {
      data,
      timestamp: Date.now(),
    };

    await unstable_cache(
      async () => {
        return cacheData;
      },
      [key]
    )();
  } catch (error) {
    console.error('キャッシュの設定に失敗しました:', error);
  }
} 