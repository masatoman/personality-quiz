import { useState, useEffect } from 'react';

/**
 * メディアクエリの状態を監視するカスタムフック
 * @param query メディアクエリ文字列（例: '(max-width: 768px)'）
 * @returns メディアクエリがマッチするかどうか
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // 最新のブラウザ用
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else {
      // Safari 13.1以前用
      mediaQuery.addListener(handler);
    }

    return () => {
      // クリーンアップ
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler);
      } else {
        mediaQuery.removeListener(handler);
      }
    };
  }, [query]);

  return matches;
}; 