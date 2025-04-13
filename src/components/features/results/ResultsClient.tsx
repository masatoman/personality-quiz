'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaHome, FaSignInAlt, FaUserCircle, FaArrowLeft, 
  FaCheckCircle, FaExclamationTriangle, FaInfoCircle,
  FaTwitter, FaFacebook, FaLine, FaInstagram } from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';
import { 
  LearningType, QuizResults, ResultsData, TabType 
} from '@/types/quiz';

// 分割したコンポーネントをインポート
import ResultsTabs from './results/ResultsTabs';
import ResultsTabContent from './results/ResultsTabContent';
import ResultsChart from './results/ResultsChart';
import NextSteps from './results/NextSteps';

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
      <header className="bg-white shadow-md py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-gray-600 hover:text-gray-900 flex items-center">
              <FaHome className="mr-2" /> ホーム
            </Link>
            <h1 className="text-lg md:text-xl font-bold text-center">英語学習タイプ診断結果</h1>
            {user ? (
              <Link href="/profile" className="text-gray-600 hover:text-gray-900 flex items-center">
                <FaUserCircle className="mr-2" /> プロフィール
              </Link>
            ) : (
              <button 
                onClick={handleLoginPrompt}
                className="text-gray-600 hover:text-gray-900 flex items-center"
              >
                <FaSignInAlt className="mr-2" /> ログイン
              </button>
            )}
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 mt-8">
        {/* 未ログイン時の結果保存プロンプト */}
        {!user && results && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaInfoCircle className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  結果を保存してあなたの進捗を追跡するにはログインしてください。
                </p>
                <div className="mt-2">
                  <button
                    onClick={handleLoginPrompt}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded"
                  >
                    ログインして保存
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 保存成功メッセージ */}
        {saveSuccess && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaCheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  結果が正常に保存されました。プロフィールページで確認できます。
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* 保存エラーメッセージ */}
        {saveError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaExclamationTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {saveError}
                </p>
              </div>
            </div>
          </div>
        )}
        
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
      
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">英語学習タイプ診断</h3>
              <p className="text-gray-300 text-sm">
                あなたの英語学習スタイルを理解し、最適な学習方法を見つけるためのオンライン診断ツールです。
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">共有する</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-white hover:text-blue-400">
                  <FaTwitter size={20} />
                </a>
                <a href="#" className="text-white hover:text-blue-600">
                  <FaFacebook size={20} />
                </a>
                <a href="#" className="text-white hover:text-green-400">
                  <FaLine size={20} />
                </a>
                <a href="#" className="text-white hover:text-pink-500">
                  <FaInstagram size={20} />
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">クイック リンク</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/" className="text-gray-300 hover:text-white">
                    ホーム
                  </Link>
                </li>
                <li>
                  <Link href="/quiz" className="text-gray-300 hover:text-white">
                    診断を受ける
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-300 hover:text-white">
                    このサイトについて
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ResultsClient; 