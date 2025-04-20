'use client';

import React, { useEffect, useState, useMemo, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';
import { useVirtualizer } from '@tanstack/react-virtual';
import { 
  LearningType, QuizResults
} from '@/types/quiz';
import { TabType, ResultsData } from '@/types/results';
import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

// チャンクサイズの定義
const CHUNK_SIZE = 20;
const INITIAL_LOAD_SIZE = 50;

// ローディング表示用コンポーネント
const LoadingDisplay: React.FC<{ message: string }> = ({ message }) => (
  <div 
    className="flex items-center justify-center p-4"
    role="status"
    aria-live="polite"
  >
    <div 
      className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"
      aria-hidden="true"
    ></div>
    <span className="text-gray-600">{message}</span>
  </div>
);

// 仮想スクロールコンテナコンポーネント
interface VirtualScrollContainerProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  height: number;
  itemHeight: number;
  ariaLabel?: string;
}

function VirtualScrollContainer<T>({ 
  items, 
  renderItem, 
  height, 
  itemHeight,
  ariaLabel = 'スクロール可能なコンテンツ'
}: VirtualScrollContainerProps<T>) {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan: 5, // パフォーマンス最適化のためのオーバースキャン
  });

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!virtualizer.range) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      virtualizer.scrollToIndex(Math.min(virtualizer.range.endIndex + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      virtualizer.scrollToIndex(Math.max(virtualizer.range.startIndex - 1, 0));
    }
  }, [virtualizer, items.length]);

  return (
    <div
      ref={parentRef}
      className="overflow-auto"
      style={{ height }}
      role="list"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            role="listitem"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  );
}

// コンポーネントのProps型定義
interface ResultsHeaderProps {
  data: ResultsData;
  learningType: {
    primary: LearningType;
    secondary: LearningType;
    scores: {
      giver: number;
      taker: number;
      matcher: number;
    };
  };
  isMobile: boolean;
}

interface ResultsTabsProps {
  selectedTab: TabType;
  onTabChange: (tab: TabType) => void;
  isMobile: boolean;
}

interface ResultsTabContentProps {
  tab: TabType;
  data: ResultsData;
  learningType: {
    primary: LearningType;
    secondary: LearningType;
    scores: {
      giver: number;
      taker: number;
      matcher: number;
    };
  };
  isMobile: boolean;
}

interface SaveNotificationProps {
  message: string;
  success: boolean;
  error?: string;
  isMobile: boolean;
}

// 動的インポートの型アサーション
const ResultsHeader = dynamic(() => import('./results/ResultsHeader'), {
  loading: () => <LoadingDisplay message="ヘッダーを読み込み中..." />,
  ssr: false
}) as unknown as ComponentType<ResultsHeaderProps>;

const ResultsTabs = dynamic(() => import('./results/ResultsTabs'), {
  loading: () => <LoadingDisplay message="タブを読み込み中..." />,
  ssr: false
}) as unknown as ComponentType<ResultsTabsProps>;

const ResultsTabContent = dynamic(() => import('./results/ResultsTabContent'), {
  loading: () => <LoadingDisplay message="コンテンツを読み込み中..." />,
  ssr: false
}) as unknown as ComponentType<ResultsTabContentProps>;

const SaveNotification = dynamic(() => import('./results/SaveNotification'), {
  loading: () => null,
  ssr: false
}) as unknown as ComponentType<SaveNotificationProps>;

// 詳細な診断データ
import { resultsData } from '@/data/resultsData';

// ユーティリティ関数（メモ化）
const getSecondaryType = (
  giverScore: number, 
  takerScore: number, 
  matcherScore: number, 
  dominantType: LearningType
): LearningType => {
  const scores = [
    { type: 'giver' as LearningType, score: giverScore },
    { type: 'taker' as LearningType, score: takerScore },
    { type: 'matcher' as LearningType, score: matcherScore }
  ].filter(s => s.type !== dominantType)
   .sort((a, b) => b.score - a.score);
  
  return scores[0].type;
};

const getCombinationType = (
  primaryType: LearningType, 
  secondaryType: LearningType
): string => {
  if ((primaryType === 'giver' && secondaryType === 'taker') || 
      (primaryType === 'taker' && secondaryType === 'giver')) {
    return 'giver_taker';
  } else if ((primaryType === 'giver' && secondaryType === 'matcher') || 
             (primaryType === 'matcher' && secondaryType === 'giver')) {
    return 'giver_matcher';
  } else {
    return 'taker_matcher';
  }
};

export function ResultsClient() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<TabType>('overview');
  const [isMobile, setIsMobile] = useState(false);
  const [resultsData, setResultsData] = useState<ResultsData>({
    answers: [],
    recommendations: [],
    timestamp: new Date().toISOString(),
    personalityInfo: {
      giver: {
        title: 'Giver',
        description: '他者を助け、知識を共有することに喜びを感じるタイプ',
        strengths: [
          '教えることで自身の理解も深まる',
          '人との関係構築が得意',
          '協調性が高い'
        ],
        weaknesses: [
          '自身の学習時間が不足しがち',
          '完璧を求めすぎる傾向がある',
          '時間管理が難しい'
        ],
        tips: [
          '自身の学習時間を確保する',
          'メンタリングの時間を設定する',
          '教えることと学ぶことのバランスを取る'
        ]
      },
      taker: {
        title: 'Taker',
        description: '効率的に知識を吸収し、自己成長を重視するタイプ',
        strengths: [
          '学習効率が高い',
          '目標達成への意識が強い',
          '時間管理が得意'
        ],
        weaknesses: [
          '他者との知識共有が少ない',
          '協調学習が苦手',
          'コミュニケーションが一方向的になりがち'
        ],
        tips: [
          '学んだ内容を他者と共有する機会を作る',
          'グループ学習に参加する',
          '知識のアウトプットを意識する'
        ]
      },
      matcher: {
        title: 'Matcher',
        description: '与えることと得ることのバランスを重視するタイプ',
        strengths: [
          'バランスの取れた学習スタイル',
          '柔軟な対応力',
          '持続可能な学習習慣'
        ],
        weaknesses: [
          '特定分野での専門性が育ちにくい',
          '決断に時間がかかる',
          '中途半端になりがち'
        ],
        tips: [
          '得意分野を見つけて伸ばす',
          '明確な目標を設定する',
          '定期的な振り返りを行う'
        ]
      }
    },
    scores: {
      giver: 0,
      taker: 0,
      matcher: 0
    }
  });
  const [saveNotification, setSaveNotification] = useState<{
    message: string;
    success: boolean;
    error?: string;
  }>({
    message: '',
    success: false
  });
  
  // 結果データの取得と解析（メモ化）
  const quizResults = useMemo(() => {
    const storedResults = localStorage.getItem('quizResults');
    if (!storedResults) return null;
    
    try {
      return JSON.parse(storedResults) as QuizResults;
    } catch (error) {
      console.error('結果データの解析に失敗:', error);
      return null;
    }
  }, []);
  
  // スコアの計算（メモ化）
  const scores = useMemo(() => {
    if (!quizResults?.details) return null;
    
    const totalQuestions = quizResults.details.length;
    const giverAnswers = quizResults.details.filter(d => d.answer === 0).length;
    const takerAnswers = quizResults.details.filter(d => d.answer === 1).length;
    const matcherAnswers = quizResults.details.filter(d => d.answer === 2).length;
    
    return {
      giver: Math.round((giverAnswers / totalQuestions) * 100),
      taker: Math.round((takerAnswers / totalQuestions) * 100),
      matcher: Math.round((matcherAnswers / totalQuestions) * 100)
    };
  }, [quizResults]);
  
  // 学習タイプの判定（メモ化）
  const learningType = useMemo(() => {
    if (!scores) return null;
    
    const { giver, taker, matcher } = scores;
    let dominantType: LearningType = 'matcher';
    let maxScore = matcher;
    
    if (giver > maxScore) {
      dominantType = 'giver';
      maxScore = giver;
    }
    if (taker > maxScore) {
      dominantType = 'taker';
      maxScore = taker;
    }
    
    return {
      primary: dominantType,
      secondary: getSecondaryType(giver, taker, matcher, dominantType),
      scores: { giver, taker, matcher }
    };
  }, [scores]);
  
  // タブ切り替えハンドラ（メモ化）
  const handleTabChange = useCallback((tab: TabType) => {
    setSelectedTab(tab);
  }, []);
  
  // 結果保存ハンドラ（メモ化）
  const handleSave = useCallback(async () => {
    if (!user || !quizResults) return;
    
    try {
      const response = await fetch('/api/quiz/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          results: quizResults
        })
      });
      
      if (response.ok) {
        setSaveNotification({
          message: '結果が正常に保存されました',
          success: true
        });
      } else {
        throw new Error('保存に失敗しました');
      }
    } catch (error) {
      console.error('結果の保存に失敗:', error);
      setSaveNotification({
        message: '結果の保存に失敗しました',
        success: false,
        error: error instanceof Error ? error.message : '保存中にエラーが発生しました'
      });
    }
  }, [user, quizResults]);
  
  // データのチャンク処理用のstate
  const [currentChunk, setCurrentChunk] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // チャンク化されたデータの取得（メモ化）
  const chunkedData = useMemo(() => {
    if (!quizResults?.details) return [];
    
    const startIndex = 0;
    const endIndex = currentChunk * CHUNK_SIZE;
    return quizResults.details.slice(startIndex, endIndex);
  }, [quizResults, currentChunk]);

  // 追加データの読み込み
  const loadMoreData = useCallback(() => {
    if (isLoadingMore || !quizResults?.details) return;
    
    setIsLoadingMore(true);
    setTimeout(() => {
      setCurrentChunk(prev => prev + 1);
      setIsLoadingMore(false);
    }, 300);
  }, [isLoadingMore, quizResults]);

  // スクロール監視
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      if (
        target.scrollHeight - target.scrollTop <= target.clientHeight * 1.5 &&
        !isLoadingMore &&
        quizResults?.details &&
        chunkedData.length < quizResults.details.length
      ) {
        loadMoreData();
      }
    };

    const contentElement = document.querySelector('.results-content');
    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll);
      return () => contentElement.removeEventListener('scroll', handleScroll);
    }
  }, [loadMoreData, isLoadingMore, quizResults, chunkedData.length]);

  // モバイルデバイスの検出
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!quizResults || !learningType) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-center text-gray-600">
            診断結果が見つかりません。診断を最初からやり直してください。
          </p>
          <div className="mt-4 text-center">
            <Link href="/quiz" className="text-blue-600 hover:underline">
              診断に戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      <Link 
        href="/quiz" 
        className="flex items-center text-gray-600 hover:text-gray-800 mb-4 sm:mb-6"
      >
        <FaArrowLeft className="mr-2" />
        <span>クイズに戻る</span>
      </Link>
      
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <Suspense fallback={<LoadingDisplay message="読み込み中..." />}>
          <ResultsHeader 
            data={resultsData}
            learningType={learningType}
            isMobile={isMobile}
          />
        </Suspense>
        
        <Suspense fallback={<LoadingDisplay message="読み込み中..." />}>
          <ResultsTabs 
            selectedTab={selectedTab} 
            onTabChange={handleTabChange}
            isMobile={isMobile}
          />
        </Suspense>
        
        <Suspense fallback={<LoadingDisplay message="読み込み中..." />}>
          <ResultsTabContent 
            tab={selectedTab}
            data={resultsData}
            learningType={learningType}
            isMobile={isMobile}
          />
        </Suspense>
        
        {saveNotification.message && (
          <SaveNotification
            message={saveNotification.message}
            success={saveNotification.success}
            error={saveNotification.error}
            isMobile={isMobile}
          />
        )}
      </div>
    </div>
  );
}

export default React.memo(ResultsClient); 