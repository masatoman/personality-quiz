'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';
import { 
  LearningType, QuizResults, TabType 
} from '@/types/quiz';

// 分割したコンポーネントをインポート
import ResultsTabs from './results/ResultsTabs';
import ResultsTabContent from './results/ResultsTabContent';
import ResultsChart from './results/ResultsChart';
import NextSteps from './results/NextSteps';
import ResultsHeader from './results/ResultsHeader';
import SaveNotification from './results/SaveNotification';
import LoginPrompt from './results/LoginPrompt';
import ResultsFooter from './results/ResultsFooter';

// 詳細な診断データ
import { resultsData } from '@/data/resultsData';

// ユーティリティ関数
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

const ResultsClient: React.FC = () => {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<QuizResults | null>(null);
  const [selectedTab, setSelectedTab] = useState<TabType>('strengths');
  const [savingResults, setSavingResults] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // 認証状態を取得
  const { user, signIn, loading: authLoading } = useAuth();

  useEffect(() => {
    // URLパラメータから結果を取得
    const typeParam = searchParams?.get('type') as LearningType | null;
    
    if (typeParam && ['giver', 'taker', 'matcher'].includes(typeParam)) {
      // ローカルストレージから結果を取得
      try {
        const storedResults = localStorage.getItem('quizResults');
        if (storedResults) {
          const parsedResults = JSON.parse(storedResults) as QuizResults;
          setResults(parsedResults);
          
          // ログイン済みの場合、結果を自動保存
          if (user) {
            saveResultsToDatabase(parsedResults, user.id);
          }
        } else {
          // 仮のデータ（実際のアプリではAPIから取得など）
          const mockResults: QuizResults = {
            giver: typeParam === 'giver' ? 70 : 30,
            taker: typeParam === 'taker' ? 70 : 30,
            matcher: typeParam === 'matcher' ? 70 : 40,
            dominantType: typeParam,
            percentage: {
              giver: typeParam === 'giver' ? 50 : 25,
              taker: typeParam === 'taker' ? 50 : 25,
              matcher: typeParam === 'matcher' ? 50 : 25
            }
          };
          setResults(mockResults);
        }
      } catch (error) {
        console.error('結果の解析中にエラーが発生しました:', error);
      }
    }
    
    setLoading(false);
  }, [searchParams, user]);

  // 結果をデータベースに保存する関数
  const saveResultsToDatabase = async (results: QuizResults, userId: string) => {
    try {
      setSavingResults(true);
      setSaveError(null);
      
      const response = await fetch('/api/quiz/save-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...results,
          userId
        }),
      });
      
      if (!response.ok) {
        throw new Error(`結果の保存に失敗しました: ${response.status}`);
      }
      
      setSaveSuccess(true);
    } catch (error) {
      console.error('結果の保存に失敗しました:', error);
      setSaveError('結果の保存中にエラーが発生しました。');
    } finally {
      setSavingResults(false);
    }
  };

  // ログインプロンプトの処理
  const handleLoginPrompt = () => {
    if (signIn) signIn();
  };

  // ローディング中
  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 結果がない場合
  if (!results) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold mb-4">診断結果が見つかりません</h1>
        <p className="mb-4">診断が完了していないか、結果が正しく保存されていません。</p>
        <Link href="/quiz" className="text-blue-600 hover:underline flex items-center justify-center">
          <FaArrowLeft className="mr-2" /> 診断に戻る
        </Link>
      </div>
    );
  }

  const { dominantType } = results;
  const personalityType = resultsData.personality_types[dominantType];
  const secondaryType = getSecondaryType(results.giver, results.taker, results.matcher, dominantType);
  const combinationType = getCombinationType(dominantType, secondaryType);

  return (
    <div className="results-page bg-gray-50 min-h-screen pb-12">
      <ResultsHeader user={user} onLogin={handleLoginPrompt} />
      
      <main className="container mx-auto px-4 mt-8">
        {/* 未ログイン時の結果保存プロンプト */}
        {!user && results && (
          <LoginPrompt onLogin={handleLoginPrompt} />
        )}

        {/* 保存状態通知 */}
        <SaveNotification 
          success={saveSuccess} 
          error={saveError} 
        />
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="text-center mb-6">
            {personalityType.icon}
            <h2 className="text-2xl md:text-3xl font-bold mb-2">{personalityType.title}</h2>
            <p className="text-lg text-gray-600">{personalityType.description}</p>
          </div>
          
          {/* タブコンポーネント */}
          <ResultsTabs selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
          
          {/* タブコンテンツコンポーネント */}
          <ResultsTabContent selectedTab={selectedTab} personalityType={personalityType} />
        </div>
        
        {/* チャートコンポーネント */}
        <ResultsChart results={results} />
        
        {/* 次のステップコンポーネント */}
        <NextSteps />
      </main>
      
      <ResultsFooter />
    </div>
  );
};

export default ResultsClient; 