// アナリティクス用React Hooks
import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { dataCollector } from '@/lib/analytics/dataCollector';

/**
 * ページビュートラッキング用Hook
 */
export const usePageTracking = (materialId?: string) => {
  const _router = useRouter();
  const previousPath = useRef<string>('');

  useEffect(() => {
    const currentPath = window.location.pathname;
    
    // 前回と異なるパスの場合のみ記録
    if (currentPath !== previousPath.current) {
      dataCollector.logPageView(currentPath, materialId);
      previousPath.current = currentPath;
    }
  }, [materialId]);
};

/**
 * 教材学習トラッキング用Hook
 */
export const useLearningSessionTracking = (materialId: string) => {
  const startTimeRef = useRef<Date | null>(null);
  const lastPositionRef = useRef<number>(0);

  const startSession = useCallback(() => {
    startTimeRef.current = new Date();
    dataCollector.startLearningSession(materialId);
  }, [materialId]);

  const updateProgress = useCallback((position: number) => {
    lastPositionRef.current = position;
    
    if (startTimeRef.current) {
      const timeSpent = Math.round((Date.now() - startTimeRef.current.getTime()) / 1000);
      dataCollector.updateLearningSession(materialId, {
        last_position: position,
        total_time_spent: timeSpent
      });
    }
  }, [materialId]);

  const completeSession = useCallback((ratings: {
    difficulty?: number;
    satisfaction?: number;
    usefulness?: number;
    will_recommend?: boolean;
  }) => {
    dataCollector.completeLearningSession(materialId, ratings);
  }, [materialId]);

  const bookmarkMaterial = useCallback((isBookmarked: boolean) => {
    dataCollector.updateLearningSession(materialId, {
      is_bookmarked: isBookmarked
    });
  }, [materialId]);

  // コンポーネントマウント時にセッション開始
  useEffect(() => {
    startSession();
    
    // アンマウント時に最終的な時間を記録
    return () => {
      if (startTimeRef.current) {
        const finalTimeSpent = Math.round((Date.now() - startTimeRef.current.getTime()) / 1000);
        dataCollector.updateLearningSession(materialId, {
          total_time_spent: finalTimeSpent,
          last_position: lastPositionRef.current
        });
      }
    };
  }, [materialId, startSession]);

  return {
    updateProgress,
    completeSession,
    bookmarkMaterial
  };
};

/**
 * クイズ結果トラッキング用Hook
 */
export const useQuizTracking = (materialId: string) => {
  const quizStartTime = useRef<Date | null>(null);

  const startQuiz = useCallback(() => {
    quizStartTime.current = new Date();
  }, []);

  const submitQuizResult = useCallback((result: {
    correct_answers: number;
    total_questions: number;
    score: number;
  }) => {
    if (quizStartTime.current) {
      const timeTaken = Math.round((Date.now() - quizStartTime.current.getTime()) / 1000);
      dataCollector.logQuizResult(materialId, {
        ...result,
        time_taken: timeTaken
      });
    }
  }, [materialId]);

  return {
    startQuiz,
    submitQuizResult
  };
};

/**
 * コメント投稿トラッキング用Hook
 */
export const useCommentTracking = (materialId: string) => {
  const commentStartTime = useRef<Date | null>(null);

  const startWritingComment = useCallback(() => {
    commentStartTime.current = new Date();
  }, []);

  const submitComment = useCallback((commentData: {
    comment_length: number;
    parent_comment_id?: string;
  }) => {
    if (commentStartTime.current) {
      const timeToWrite = Math.round((Date.now() - commentStartTime.current.getTime()) / 1000);
      dataCollector.logCommentPosted(materialId, {
        ...commentData,
        time_to_write: timeToWrite
      });
    }
  }, [materialId]);

  const voteHelpful = useCallback((commentId: string, isHelpful: boolean) => {
    dataCollector.logHelpfulVote(materialId, commentId, isHelpful);
  }, [materialId]);

  return {
    startWritingComment,
    submitComment,
    voteHelpful
  };
};

/**
 * 検索トラッキング用Hook
 */
export const useSearchTracking = () => {
  const logSearch = useCallback((searchQuery: string, resultCount: number, category?: string) => {
    dataCollector.logSearch(searchQuery, resultCount, category);
  }, []);

  return { logSearch };
};

/**
 * 要素クリックトラッキング用Hook
 */
export const useClickTracking = (materialId?: string) => {
  const trackClick = useCallback((elementId: string, elementType: string) => {
    dataCollector.logElementClick(elementId, elementType, materialId);
  }, [materialId]);

  // 自動クリックトラッキング用のref
  const trackingRef = useCallback((element: HTMLElement | null) => {
    if (!element) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const elementId = target.id || target.className || `${target.tagName.toLowerCase()}-${Date.now()}`;
      trackClick(elementId, target.tagName.toLowerCase());
    };

    element.addEventListener('click', handleClick);
    
    return () => {
      element.removeEventListener('click', handleClick);
    };
  }, [trackClick]);

  return {
    trackClick,
    trackingRef
  };
};

/**
 * スクロール深度トラッキング用Hook
 */
export const useScrollTracking = (materialId?: string) => {
  const lastDepthRef = useRef<number>(0);

  useEffect(() => {
    if (!materialId) return;

    let scrollTimeout: ReturnType<typeof setTimeout>;
    
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
        const currentDepth = Math.round((scrollTop / documentHeight) * 100);
        
        // 10%以上の変化があった場合のみ記録
        if (Math.abs(currentDepth - lastDepthRef.current) >= 10) {
          dataCollector.logScrollDepth(materialId, currentDepth);
          lastDepthRef.current = currentDepth;
        }
      }, 1000);
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [materialId]);
};

/**
 * 包括的なページアナリティクスHook
 * - ページビュー、スクロール、基本的なクリックを自動追跡
 */
export const usePageAnalytics = (materialId?: string) => {
  // 各種トラッキングを組み合わせ
  usePageTracking(materialId);
  useScrollTracking(materialId);
  
  const { trackClick } = useClickTracking(materialId);
  
  // ページ離脱時の処理
  useEffect(() => {
    const handleBeforeUnload = () => {
      // 必要に応じて最終データを送信
      if (materialId) {
        dataCollector.updateLearningSession(materialId, {
          // 最終位置や時間を更新
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [materialId]);

  return {
    trackClick
  };
};
