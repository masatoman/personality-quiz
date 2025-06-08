'use client';

import React, { useEffect, useState, useMemo, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import { 
  LearningType, QuizResults
} from '@/types/quiz';
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
  const [saveNotification] = useState<{
    message: string;
    success: boolean;
    error?: string;
  }>({
    message: '',
    success: false
  });
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  
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

  // おすすめ教材の取得
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!quizResults) return;
      
      setIsLoadingRecommendations(true);
      try {
        // テスト環境では代替データを使用
        const isTestEnvironment = process.env.NODE_ENV === 'test' || 
                                 typeof window !== 'undefined' && window.location.hostname === 'localhost';
        
        if (isTestEnvironment) {
          // テスト用のサンプル教材データ
          const sampleRecommendations = [
            {
              title: "英語基礎文法マスター",
              description: "英語の基礎文法を体系的に学習できる教材です。初心者から中級者まで対応。",
              link: "/materials/1"
            },
            {
              title: "日常英会話フレーズ集",
              description: "実際の会話で使える英語フレーズを場面別に学習できます。",
              link: "/materials/2"
            },
            {
              title: "TOEIC対策問題集",
              description: "TOEIC試験対策に特化した問題集です。スコアアップを目指しましょう。",
              link: "/materials/3"
            },
            {
              title: "ビジネス英語エッセンシャル",
              description: "ビジネスシーンで必要な英語表現を学習できる実践的な教材です。",
              link: "/materials/4"
            },
            {
              title: "英語プレゼンテーション入門",
              description: "英語でのプレゼンテーションスキルを向上させる教材です。",
              link: "/materials/5"
            }
          ];
          
          setResultsData(prev => ({
            ...prev,
            recommendations: sampleRecommendations
          }));
        } else {
          // 実際のAPIから教材を取得
          const response = await fetch('/api/learning/recommendations?limit=5&strategy=mixed');
          if (response.ok) {
            const data = await response.json();
            const recommendations = data.recommendations.map((item: any) => ({
              title: item.title || '教材名不明',
              description: item.description || '説明なし',
              link: `/materials/${item.id}`
            }));
            
            setResultsData(prev => ({
              ...prev,
              recommendations
            }));
          } else {
            console.warn('教材推薦の取得に失敗しました');
            // フォールバックとしてサンプルデータを使用
            setResultsData(prev => ({
              ...prev,
              recommendations: [
                {
                  title: "おすすめ英語教材（サンプル）",
                  description: "現在教材を読み込み中です。しばらくお待ちください。",
                  link: "/explore"
                }
              ]
            }));
          }
        }
      } catch (error) {
        console.error('教材推薦の取得エラー:', error);
        // エラー時のフォールバックデータ
        setResultsData(prev => ({
          ...prev,
          recommendations: [
            {
              title: "教材を探索する",
              description: "現在おすすめ教材を読み込めません。教材一覧から探索してください。",
              link: "/explore"
            }
          ]
        }));
      } finally {
        setIsLoadingRecommendations(false);
      }
    };

    fetchRecommendations();
  }, [quizResults]);

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