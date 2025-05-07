'use client';

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';
import { 
  LearningType, QuizResults, TabType 
} from '@/types/quiz';
import { useSession } from 'next-auth/react';
import { saveResults } from '@/lib/api/quiz';
import { motion } from 'framer-motion';
import LoadingIndicator from '@/components/ui/LoadingIndicator';

// 分割したコンポーネントをインポート
import ResultsTabs from './ResultsTabs';
import ResultsTabContent from './ResultsTabContent';
import ResultsChart from './ResultsChart';
import NextSteps from './NextSteps';
import ResultsHeader from './ResultsHeader';
import SaveNotification from './SaveNotification';
import LoginPrompt from './LoginPrompt';
import ResultsFooter from './ResultsFooter';
import ResultsExplanation from './ResultsExplanation';
import ResultsShare from './ResultsShare';
import ResultsActions from './ResultsActions';

// 詳細な診断データ
import { resultsData } from '@/data/resultsData';

// 分割したユーティリティとフック
import { getSecondaryType } from './utils/typeUtils';
import { useResultsSave } from './hooks/useResultsSave';

interface ResultsClientProps {
  predefinedType?: LearningType;
  predefinedResults?: QuizResults;
}

const ResultsClient: React.FC<ResultsClientProps> = ({ 
  predefinedType, 
  predefinedResults 
}) => {
  const [results, setResults] = useState<QuizResults | null>(null);
  const [dominantType, setDominantType] = useState<LearningType | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const { data: session } = useSession();
  const user = session?.user;
  const searchParams = useSearchParams();
  const [selectedTab, setSelectedTab] = useState<TabType>('strengths');
  
  const { signIn, loading: authLoading } = useAuth();
  const { 
    savingResults, 
    saveSuccess
  } = useResultsSave();

  // データベースに結果を保存する関数
  const saveResultsToDatabase = async (results: QuizResults, userId: string) => {
    try {
      setSaveStatus('saving');
      await saveResults(results, userId);
      setSaveStatus('success');
    } catch (error) {
      console.error('結果の保存に失敗しました:', error);
      setSaveStatus('error');
      setSaveError('結果の保存中にエラーが発生しました。後でもう一度お試しください。');
    }
  };

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
            matcher: typeParam === 'matcher' ? 70 : 30,
            timestamp: new Date().toISOString()
          };
          setResults(mockResults);
        }
        
        // 支配的なタイプを設定
        setDominantType(typeParam);
        
      } catch (e) {
        console.error('結果の取得中にエラーが発生しました:', e);
      }
    } else if (predefinedType && predefinedResults) {
      // 事前定義された結果がある場合はそれを使用
      setResults(predefinedResults);
      setDominantType(predefinedType);
    }
  }, [searchParams, predefinedType, predefinedResults, user, saveResultsToDatabase]);

  useEffect(() => {
    if (results && !savingResults && user) {
      saveResultsToDatabase(results, user.id);
    }
  }, [results, savingResults, saveResultsToDatabase, user]);

  // ログインプロンプトの処理
  const handleLoginPrompt = () => {
    if (signIn) signIn('google', { callbackUrl: window.location.href });
  };

  // ローディング中
  if (authLoading) {
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

  // dominantTypeプロパティを取得
  const dominantTypeFromResults = results.dominantType;
  const personalityType = resultsData.personality_types[dominantTypeFromResults];
  const secondaryType = getSecondaryType(results.giver, results.taker, results.matcher, dominantTypeFromResults);

  // 優勢タイプに基づくスタイル設定
  const getTypeColor = () => {
    switch (dominantTypeFromResults) {
      case 'giver':
        return 'text-green-600 border-green-600 bg-green-50';
      case 'taker':
        return 'text-blue-600 border-blue-600 bg-blue-50';
      case 'matcher':
        return 'text-purple-600 border-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 border-gray-600 bg-gray-50';
    }
  };

  // ページのアニメーション設定
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  // 優勢タイプに基づくタイトル
  const typeTitle = {
    giver: 'ギバータイプ',
    taker: 'テイカータイプ',
    matcher: 'マッチャータイプ'
  }[dominantTypeFromResults];

  return (
    <motion.div 
      className="container mx-auto px-4 py-8 max-w-4xl"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      <div className="text-center mb-8">
        <p className="text-lg text-gray-600 mb-2">あなたの学習タイプは</p>
        <h1 className={`text-4xl font-bold mb-4 inline-block px-4 py-2 border-b-4 rounded ${getTypeColor()}`}>
          {typeTitle}
        </h1>
        <p className="text-gray-700">
          このタイプの特徴と最適な学習方法を見てみましょう
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <ResultsChart results={results} dominantType={dominantTypeFromResults} />
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <ResultsExplanation type={dominantTypeFromResults} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <ResultsShare results={results} dominantType={dominantTypeFromResults} />
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <ResultsActions 
            dominantType={dominantTypeFromResults} 
            onSave={() => user && saveResultsToDatabase(results, user.id)}
            saveStatus={saveStatus}
            saveError={saveError}
            isLoggedIn={!!user}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default ResultsClient; 