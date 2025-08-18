'use client';

import React, { useEffect, useState, useMemo, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import { 
  LearningType, QuizResults
} from '@/types/common';
import { TabType, ResultsData } from '@/types/results';
import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

// チャンクサイズの定義
const CHUNK_SIZE = 20;

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
const ResultsHeader = dynamic(() => import('./features/results/ResultsHeader'), {
  loading: () => <LoadingDisplay message="ヘッダーを読み込み中..." />,
  ssr: false
}) as unknown as ComponentType<ResultsHeaderProps>;

const ResultsTabs = dynamic(() => import('./features/results/ResultsTabs'), {
  loading: () => <LoadingDisplay message="タブを読み込み中..." />,
  ssr: false
}) as unknown as ComponentType<ResultsTabsProps>;

const ResultsTabContent = dynamic(() => import('./features/results/ResultsTabContent'), {
  loading: () => <LoadingDisplay message="コンテンツを読み込み中..." />,
  ssr: false
}) as unknown as ComponentType<ResultsTabContentProps>;

const SaveNotification = dynamic(() => import('./features/results/SaveNotification'), {
  loading: () => <LoadingDisplay message="通知を読み込み中..." />,
  ssr: false
}) as unknown as ComponentType<SaveNotificationProps>;

// ユーティリティ関数（メモ化）
const getSecondaryType = (
  giverScore: number, 
  takerScore: number, 
  matcherScore: number, 
  dominantType: LearningType
): LearningType => {
  let scores = [
    { type: 'giver' as LearningType, score: giverScore },
    { type: 'taker' as LearningType, score: takerScore },
    { type: 'matcher' as LearningType, score: matcherScore }
  ].filter(s => s.type !== dominantType)
   .sort((a, b) => b.score - a.score);
  
  return scores[0].type;
};

export function ResultsClient() {
  const [selectedTab, setSelectedTab] = useState<TabType>('overview');
  const [isMobile, setIsMobile] = useState(false);
  const [resultsData, setResultsData] = useState<ResultsData | null>(null);
  const [saveNotification] = useState<{
    message: string;
    success: boolean;
    error?: string;
  }>({
    message: '',
    success: false
  });
  // const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  
  // 結果データの取得と解析（メモ化）
  const quizResults = useMemo(() => {
    // サーバーサイドでは null を返す
    if (typeof window === 'undefined') return null;
    
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

  // パーソナリティ分析
  const analyzePersonality = (answers: any[]) => {
    // 簡単な分析ロジック（回答に基づいて判定）
    let giverScore = 0;
    let takerScore = 0;
    
    answers.forEach((answer) => {
      if (answer === 0) { // 第1選択肢（他者助ける系）
        giverScore++;
      } else if (answer === 2) { // 第3選択肢（個人学習系）
        takerScore++;
      }
    });
    
    if (giverScore > takerScore) return 'giver';
    if (takerScore > giverScore) return 'taker';
    return 'matcher';
  };

  // パーソナリティ情報の取得
  const getPersonalityInfo = (personalityType: string) => {
    const personalityData = {
      giver: {
        title: 'Giver（ギバー）',
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
        title: 'Taker（テイカー）',
        description: '効率的に知識を吸収し、自己成長を重視するタイプ',
        strengths: [
          '集中力が高い',
          '効率的な学習方法を見つけるのが得意',
          '目標達成に向けた計画性がある'
        ],
        weaknesses: [
          '孤立しがちになる',
          '他者からのフィードバックを受けにくい',
          '知識の定着に時間がかかることがある'
        ],
        tips: [
          '定期的に他者との交流を持つ',
          '学んだことを誰かに教える機会を作る',
          'アウトプットの練習を積極的に行う'
        ]
      },
      matcher: {
        title: 'Matcher（マッチャー）',
        description: '与えることと受け取ることのバランスを重視するタイプ',
        strengths: [
          'バランス感覚に優れている',
          '状況に応じて柔軟に対応できる',
          '様々な学習方法を使い分けられる'
        ],
        weaknesses: [
          '方向性を決めるのに時間がかかる',
          '一貫性に欠ける場合がある',
          '深い専門性を身につけにくい'
        ],
        tips: [
          '自分の学習スタイルを明確にする',
          '一つの方法を続ける習慣をつける',
          '長期的な目標を設定する'
        ]
      }
    };

    return personalityData[personalityType as keyof typeof personalityData] || personalityData.matcher;
  };

  // 教材推薦の取得
  const fetchMaterialRecommendations = async (personalityType: string) => {
    try {
      const response = await fetch(`/api/learning/recommendations?personality=${personalityType}&limit=3`);
      if (!response.ok) {
        throw new Error('推薦データの取得に失敗しました');
      }
      const data = await response.json();
      return data.materials || [];
    } catch (error) {
      console.error('推薦取得エラー:', error);
      // フォールバック：一般的な推薦を返す
      return [
        {
          id: 'fallback-1',
          title: '英語学習の基礎',
          description: '効果的な英語学習方法を学ぶための入門教材',
          duration: '10分',
          level: '初級',
          category: 'learning'
        },
        {
          id: 'fallback-2', 
          title: 'コミュニケーションスキル向上',
          description: '他の学習者との効果的なコミュニケーション方法',
          duration: '15分',
          level: '中級',
          category: 'communication'
        }
      ];
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('quiz-results');
        if (stored) {
          const data = JSON.parse(stored);
          
          // パーソナリティ分析
          const personalityType = analyzePersonality(data.answers);
          const personalityInfo = getPersonalityInfo(personalityType);
          
          // 教材推薦の取得
          const recommendations = await fetchMaterialRecommendations(personalityType);
          
          setResultsData({
            ...data,
            personalityInfo,
            recommendations
          });
        }
      }
    };
    
    loadData();
  }, []);

  if (!quizResults || !learningType) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-center text-gray-600">
            診断結果が見つかりません。診断を最初からやり直してください。
          </p>
          <div className="mt-4 text-center">
            <Link href="/materials" className="text-blue-600 hover:underline">
              教材を探す
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      <Link 
        href="/materials" 
        className="flex items-center text-gray-600 hover:text-gray-800 mb-4 sm:mb-6"
      >
        <FaArrowLeft className="mr-2" />
        <span>教材一覧に戻る</span>
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