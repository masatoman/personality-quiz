'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef, TouchEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { useDebounce } from 'use-debounce';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import DashboardLayout from './DashboardLayout';
import TodoList from '@/components/features/todo/TodoList';
import { GiverScoreDisplay } from '@/components/features/giver-score/GiverScoreDisplay';
import { FaChartLine, FaCalendarAlt, FaExclamationTriangle } from 'react-icons/fa';

interface ActivitySummaryProps {
  createdMaterialsCount: number;
  completedActivitiesCount: number;
  helpedUsersCount: number;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  score: number;
  activities: number;
  level: number;
  nextLevelScore: number;
  progressPercentage: number;
  personalityType: 'giver' | 'taker' | 'matcher';
}

interface ActivityData {
  activityType: string;
  imageUrl?: string;
}

interface Activity {
  id: string;
  type: string;
  points: number;
  timestamp: string;
  title: string;
  imageUrl?: string;
  description?: string;
}

interface ErrorState {
  message: string;
  code: string;
}

// モックデータ
const initialUserData: UserData = {
  id: '',
  name: 'ユーザー',
  email: 'user@example.com',
  score: 0,
  activities: 0,
  level: 1,
  nextLevelScore: 10,
  progressPercentage: 0,
  personalityType: 'matcher',
};

const ActivitySummaryComponent = React.memo<ActivitySummaryProps>(({
  createdMaterialsCount,
  completedActivitiesCount,
  helpedUsersCount,
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  return (
    <section 
      aria-labelledby="activity-summary-title"
      className={`grid ${
        isMobile 
          ? 'grid-cols-1 gap-4' 
          : isTablet 
            ? 'grid-cols-2 gap-4' 
            : 'grid-cols-3 gap-6'
      } p-4`}
    >
      <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
        <h3 id="created-content-title" className="text-lg font-semibold">作成したコンテンツ</h3>
        <p aria-labelledby="created-content-title" className={`text-2xl ${isMobile ? 'text-center' : ''}`}>
          {createdMaterialsCount}
        </p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
        <h3 id="completed-activities-title" className="text-lg font-semibold">完了したアクティビティ</h3>
        <p aria-labelledby="completed-activities-title" className={`text-2xl ${isMobile ? 'text-center' : ''}`}>
          {completedActivitiesCount}
        </p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
        <h3 id="helped-users-title" className="text-lg font-semibold">助けたユーザー</h3>
        <p aria-labelledby="helped-users-title" className={`text-2xl ${isMobile ? 'text-center' : ''}`}>
          {helpedUsersCount}
        </p>
      </div>
    </section>
  );
});

ActivitySummaryComponent.displayName = 'ActivitySummaryComponent';

const ActivityItem = React.memo(({ activity, style, isMobile }: {
  activity: Activity;
  style: React.CSSProperties;
  isMobile: boolean;
}) => {
  const [imageError, setImageError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    if (contentRef.current) {
      const element = contentRef.current;
      setIsOverflowing(element.scrollHeight > element.clientHeight);
    }
  }, [activity.title]);

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'completed': return { bg: '#e6f3ff', text: '#0066cc' };
      case 'helped': return { bg: '#fff2e6', text: '#cc6600' };
      case 'created': return { bg: '#e6ffe6', text: '#006600' };
      default: return { bg: '#f5f5f5', text: '#333333' };
    }
  };

  const { bg, text } = getActivityColor(activity.type);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleRetryLoad = async () => {
    setIsRetrying(true);
    try {
      await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = activity.imageUrl || '';
      });
      setImageError(false);
    } catch (error) {
      console.error('画像の再読み込みに失敗しました:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      style={{
        ...style,
        padding: isMobile ? '12px 16px' : '8px 12px',
        backgroundColor: bg,
        color: text,
        borderRadius: '8px',
        margin: '4px 0',
        fontSize: isMobile ? '14px' : '16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px'
      }}
    >
      {activity.imageUrl && !imageError ? (
        <div className="relative w-12 h-12 flex-shrink-0">
          <img
            src={activity.imageUrl}
            alt=""
            className="w-full h-full object-cover rounded"
            onError={handleImageError}
            loading="lazy"
          />
        </div>
      ) : activity.imageUrl && imageError ? (
        <div className="relative w-12 h-12 flex-shrink-0 bg-gray-100 rounded flex items-center justify-center">
          {isRetrying ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
          ) : (
            <button
              onClick={handleRetryLoad}
              className="text-xs text-gray-500 hover:text-gray-700 focus:outline-none"
              title="画像を再読み込み"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          )}
        </div>
      ) : null}
      <div className="flex-grow min-w-0">
        <div
          ref={contentRef}
          className={`relative ${isExpanded ? '' : 'max-h-16 overflow-hidden'}`}
        >
          <span className="block font-medium break-words">
            {activity.title}
          </span>
          {activity.description && (
            <p className="text-sm text-gray-600 mt-1 break-words">
              {activity.description}
            </p>
          )}
          {isOverflowing && !isExpanded && (
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent"></div>
          )}
        </div>
        {isOverflowing && (
          <button
            onClick={toggleExpand}
            className="text-xs text-blue-500 hover:text-blue-700 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded"
          >
            {isExpanded ? '折りたたむ' : 'もっと見る'}
          </button>
        )}
        <time className="text-xs text-gray-600 block mt-1">
          {new Intl.DateTimeFormat('ja-JP', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }).format(new Date(activity.timestamp))}
        </time>
      </div>
      <span className="text-sm font-medium whitespace-nowrap flex-shrink-0">
        {activity.points > 0 ? `+${activity.points}` : activity.points} pts
      </span>
    </div>
  );
});

ActivityItem.displayName = 'ActivityItem';

const VirtualizedActivityList = React.memo(({ 
  activities,
  onLoadMore,
  isLoading,
  hasError,
  errorMessage
}: { 
  activities: Activity[];
  onLoadMore: () => void;
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const listRef = useRef<FixedSizeList>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // IntersectionObserverの設定
  useEffect(() => {
    if (loadingRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !isLoading && !isRefreshing) {
            onLoadMore();
          }
        },
        { 
          threshold: 0.5,
          rootMargin: '100px'
        }
      );
      observerRef.current.observe(loadingRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [onLoadMore, isLoading, isRefreshing]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
    setIsScrolling(false);
  }, []);

  const handleTouchMove = useCallback(async (e: TouchEvent) => {
    if (!isScrolling) {
      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;
      const deltaX = Math.abs(touchX - touchStartX);
      const deltaY = Math.abs(touchY - touchStartY);

      // 縦方向のスクロールを優先
      if (deltaY > deltaX) {
        setIsScrolling(true);
        const pull = touchY - touchStartY;

        if (pull > 100 && !isRefreshing && !isLoading) {
          setIsRefreshing(true);
          try {
            await onLoadMore();
          } finally {
            setIsRefreshing(false);
          }
        }
      }
    }
  }, [isRefreshing, isLoading, onLoadMore, touchStartX, touchStartY, isScrolling]);

  const handleResize = useMemo(
    () => debounce(() => {
      if (listRef.current) {
        // @ts-expect-error: resetAfterIndexはreact-windowの内部APIとして存在します
        listRef.current.resetAfterIndex(0, true);
      }
    }, 100),
    []
  );

  useEffect(() => {
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [handleResize]);

  const listHeight = useMemo(() => {
    if (isMobile) {
      return window.innerHeight * 0.6;
    }
    return window.innerHeight * 0.7;
  }, [isMobile]);

  const itemSize = useMemo(() => {
    return isMobile ? 80 : 60;
  }, [isMobile]);

  const ActivityRow = useCallback(({ index, style }: ListChildComponentProps) => {
    const activity = activities[index];
    return (
      <ActivityItem
        activity={activity}
        style={style}
        isMobile={isMobile}
      />
    );
  }, [activities, isMobile]);

  return (
    <div 
      ref={containerRef}
      className="activities-list-container relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      style={{
        maxHeight: `${listHeight}px`,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {hasError ? (
        <div role="alert" className="error-message p-4 bg-red-50 text-red-700 rounded">
          <div className="flex items-center mb-2">
            <FaExclamationTriangle className="mr-2" />
            <span className="font-semibold">エラーが発生しました</span>
          </div>
          <p className="text-sm">{errorMessage || 'データの取得に失敗しました。'}</p>
        </div>
      ) : (
        <>
          <FixedSizeList
            ref={listRef}
            height={listHeight}
            width="100%"
            itemCount={activities.length}
            itemSize={itemSize}
            onScroll={handleResize}
            overscanCount={5}
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#CBD5E0 #EDF2F7'
            }}
          >
            {ActivityRow}
          </FixedSizeList>
          <div 
            ref={loadingRef} 
            className="loading-indicator-container"
            style={{ 
              height: '40px',
              margin: '10px 0',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {isLoading && (
              <div className="loading-indicator flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                <span className="text-sm text-gray-600">読み込み中...</span>
              </div>
            )}
          </div>
        </>
      )}
      {isRefreshing && (
        <div className="refresh-indicator absolute top-0 left-0 right-0 bg-blue-500 text-white text-center py-2 text-sm">
          更新中...
        </div>
      )}
    </div>
  );
});

VirtualizedActivityList.displayName = 'VirtualizedActivityList';

// ユーティリティ関数
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const DashboardClient = React.memo(() => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  const [userData, setUserData] = useState<UserData>(initialUserData);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activityCounts, setActivityCounts] = useState({
    CREATE_CONTENT: 0,
    PROVIDE_FEEDBACK: 0,
    CONSUME_CONTENT: 0,
    COMPLETE_QUIZ: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // アクティビティデータをメモ化
  const paginatedActivities = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return activities.slice(start, start + ITEMS_PER_PAGE);
  }, [activities, page]);

  // ユーザーデータを取得する関数
  const fetchUserData = async (userId: string) => {
      try {
        setIsLoading(true);
        
        // ローカルストレージからデータを取得
        const localScore = parseInt(localStorage.getItem('giverScore') || '0', 10);
        const localActivitiesStr = localStorage.getItem('activities');
        
      let localActivities: ActivityData[] = [];
        if (localActivitiesStr) {
          try {
            localActivities = JSON.parse(localActivitiesStr);
          } catch (error) {
            console.error('ローカルストレージからの活動データの解析に失敗しました:', error);
          }
        }
        
      // APIからデータ取得
        try {
        const response = await fetch(`/api/activities/user/${userId}`);
          
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.success) {
          updateUserDataFromAPI(data.data, userId);
        } else {
          throw new Error(data.error || 'Unknown error');
        }
      } catch (apiError) {
        console.error('APIからのデータ取得に失敗しました:', apiError);
        updateUserDataFromLocal(localScore, localActivities, userId);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // APIデータでユーザー情報を更新
  const updateUserDataFromAPI = (data: { giverScore: number; activities: ActivityData[] }, userId: string) => {
    const giverScore = data.giverScore || 0;
    const activities = data.activities || [];
    
    const { level, nextLevelScore, progressPercentage, personalityType } = calculateUserStats(giverScore);
            
            setUserData({
      id: userId,
              name: initialUserData.name,
              email: initialUserData.email,
              score: giverScore,
              activities: activities.length,
              level,
              nextLevelScore,
              progressPercentage,
      personalityType,
    });
    
    updateActivityCounts(activities);
    
    // キャッシュの更新
            localStorage.setItem('activities', JSON.stringify(activities));
            localStorage.setItem('giverScore', giverScore.toString());
  };

  // ローカルデータでユーザー情報を更新
  const updateUserDataFromLocal = (localScore: number, localActivities: ActivityData[], userId: string) => {
    const { level, nextLevelScore, progressPercentage, personalityType } = calculateUserStats(localScore);
          
          setUserData({
      id: userId,
            name: initialUserData.name,
            email: initialUserData.email,
            score: localScore,
            activities: localActivities.length,
            level,
            nextLevelScore,
            progressPercentage,
      personalityType,
    });
    
    updateActivityCounts(localActivities);
  };

  // ユーザー統計を計算
  const calculateUserStats = (score: number) => {
    const level = Math.min(10, Math.floor(score / 10) + 1);
    const nextLevelScore = level * 10;
    const progressPercentage = Math.min(100, ((score % 10) / 10) * 100);
    const personalityType = score >= 67 ? 'giver' : (score >= 34 ? 'matcher' : 'taker');
    
    return {
      level,
      nextLevelScore,
      progressPercentage,
      personalityType: personalityType as 'giver' | 'taker' | 'matcher'
    };
  };

  // アクティビティカウントを更新
  const updateActivityCounts = (activities: ActivityData[]) => {
          const counts = {
      CREATE_CONTENT: activities.filter(a => a.activityType === 'CREATE_CONTENT').length,
      PROVIDE_FEEDBACK: activities.filter(a => a.activityType === 'PROVIDE_FEEDBACK').length,
      CONSUME_CONTENT: activities.filter(a => a.activityType === 'CONSUME_CONTENT').length,
      COMPLETE_QUIZ: activities.filter(a => a.activityType === 'COMPLETE_QUIZ').length
          };
          setActivityCounts(counts);
  };

  const [debouncedFetch] = useDebounce(
    (userId: string) => fetchActivities(userId),
    300
  );

  const fetchActivities = useCallback(async (userId: string) => {
    if (isLoadingMore) return;

    try {
      setIsLoadingMore(true);
      setError(null);
      
      const fetchOptions = {
        headers: {
          'Cache-Control': 'max-age=300',
          'Save-Data': 'on',
          'Accept-Encoding': 'gzip, deflate'
        }
      };
      
      const response = await fetch(
        `/api/activities/user/${userId}?page=${page}&limit=${ITEMS_PER_PAGE}`,
        fetchOptions
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'データの取得に失敗しました');
      }
      
      const data = await response.json();
      if (data.success) {
        setActivities(prevActivities => {
          const newActivities = [...prevActivities, ...data.activities];
          // 重複を除去し、最新のデータを保持
          const uniqueActivities = Array.from(
            new Map(newActivities.map(item => [item.id, item])).values()
          );
          // メモリ使用量を制限（最新500件のみ保持）
          return uniqueActivities.slice(-500);
        });

        // キャッシュの更新
        if (page === 1) {
          localStorage.setItem('cachedActivities', JSON.stringify(data.activities.slice(0, 20)));
          localStorage.setItem('activitiesLastUpdated', new Date().toISOString());
        }
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('アクティビティの取得に失敗しました:', error);
      setError({
        message: error instanceof Error ? error.message : 'データの取得に失敗しました',
        code: 'FETCH_ACTIVITIES_ERROR'
      });

      // エラー時にキャッシュからデータを読み込む
      const cachedData = localStorage.getItem('cachedActivities');
      if (cachedData) {
        const activities = JSON.parse(cachedData);
        setActivities(activities);
      }
    } finally {
      setIsLoadingMore(false);
    }
  }, [page, isLoadingMore]);

  const loadMoreActivities = useCallback(() => {
    if (!isLoadingMore && !error) {
      setPage(prev => prev + 1);
    }
  }, [isLoadingMore, error]);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    const newUserId = storedUserId || 'user_' + uuidv4();
    
    if (!storedUserId) {
      localStorage.setItem('userId', newUserId);
    }
    
    fetchUserData(newUserId);
    fetchActivities(newUserId);
  }, [page, fetchActivities]);
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <main className={`container mx-auto px-4 ${isMobile ? 'max-w-full' : 'max-w-screen-xl'}`}>
        <div className={`grid grid-cols-1 ${
          isMobile 
            ? 'gap-4' 
            : isTablet 
              ? 'lg:grid-cols-2 gap-4' 
              : 'lg:grid-cols-3 gap-6'
        } mb-4 lg:mb-6`}>
          <div className={`${
            isMobile 
              ? 'order-2' 
              : isTablet 
                ? 'lg:col-span-1 order-2 lg:order-1' 
                : 'lg:col-span-2 order-2 lg:order-1'
          }`}>
            <ActivitySummaryComponent
            createdMaterialsCount={activityCounts.CREATE_CONTENT}
              completedActivitiesCount={activityCounts.COMPLETE_QUIZ}
              helpedUsersCount={activityCounts.PROVIDE_FEEDBACK}
            />
          </div>
          <div className="order-1 lg:order-2">
            <GiverScoreDisplay
              score={{
                level: Math.min(Math.floor(userData.score / 10) + 1, 10),
                points: userData.score,
                progress: ((userData.score % 10) / 10) * 100,
                pointsToNextLevel: (Math.floor(userData.score / 10) + 1) * 10 - userData.score,
                personalityType: userData.personalityType
              }}
          />
        </div>
      </div>
      
        <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'md:grid-cols-2 gap-4 lg:gap-6'}`}>
          <section aria-labelledby="recent-activities-title">
            <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
              <h2 id="recent-activities-title" className="text-xl font-bold mb-4 flex items-center">
                <FaChartLine className="mr-2 text-blue-500" aria-hidden="true" />
              最近の活動
            </h2>
              {activities.length > 0 ? (
                <VirtualizedActivityList 
                  activities={paginatedActivities}
                  onLoadMore={loadMoreActivities}
                  isLoading={isLoadingMore}
                  hasError={!!error}
                  errorMessage={error?.message}
                />
              ) : error ? (
                <div className="text-center py-6" role="alert">
                  <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                    <FaExclamationTriangle className="inline-block mr-2" />
                    <p className="inline-block">{error.message}</p>
                    <button 
                      onClick={() => fetchActivities(userData.id)}
                      className="mt-2 w-full px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                      再読み込み
                    </button>
                  </div>
                    </div>
            ) : (
                <div className="text-center py-6 text-gray-500" role="status">
                  <p className="text-lg">まだ活動がありません</p>
                <p className="text-sm mt-1">活動を開始してポイントを獲得しましょう</p>
              </div>
            )}
          </div>
          </section>
        
        <div>
            <TodoList />
            
            <section aria-labelledby="next-event-title" className="bg-white rounded-lg shadow-md p-4 lg:p-6 mt-4 lg:mt-6">
              <h2 id="next-event-title" className="text-xl font-bold mb-4 flex items-center">
                <FaCalendarAlt className="mr-2 text-blue-500" aria-hidden="true" />
              次のイベント
            </h2>
            <div className="p-3 bg-yellow-50 rounded border border-yellow-100">
              <p className="font-medium">ギバーコミュニティミーティング</p>
              <p className="text-sm text-gray-600 mt-1">5月10日 19:00 - オンライン</p>
            </div>
            </section>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
});

DashboardClient.displayName = 'DashboardClient';

export default DashboardClient; 