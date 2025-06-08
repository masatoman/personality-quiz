// シンプルなメモリキャッシュ実装
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

export function getCache(key: string): any {
  const item = cache.get(key);
  if (!item) return null;
  
  if (Date.now() > item.timestamp + item.ttl) {
    cache.delete(key);
    return null;
  }
  
  return item.data;
}

export function setCache(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl
  });
}

export function clearCache(key?: string): void {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
} 