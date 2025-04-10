'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { questions } from '@/data/questions';
import { Question, PersonalityType, QuizResults } from '@/types/quiz';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaChevronLeft, 
  FaChevronRight, 
  FaRegLightbulb, 
  FaRegQuestionCircle,
  FaRegCheckCircle,
  FaArrowLeft,
  FaArrowRight,
  FaSpinner
} from 'react-icons/fa';
import Link from 'next/link';

// カスタム型定義
type Answer = {
  questionId: number;
  selectedOption: number;
};

// データファイルの型とコンポーネントの型を調整するためのインターフェース
interface QuizOption {
  text: string;
  score: {
    giver: number;
    taker: number;
    matcher: number;
  };
  description?: string; // 説明文（オプショナル）
}

interface QuizQuestion {
  id: number;
  category: string;
  text: string;
  description?: string; // 質問の詳細説明（オプショナル）
  options: QuizOption[];
}

const QuizClient: React.FC = () => {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [results, setResults] = useState<QuizResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [direction, setDirection] = useState(0); // アニメーション方向: 1=前進, -1=後退
  const [quizState, setQuizState] = useState<'intro' | 'questioning' | 'loading'>('intro');
  
  // 質問データをチェック
  const questionsData = Array.isArray(questions) ? (questions as unknown as QuizQuestion[]) : [];
  const currentQuestion = questionsData[currentQuestionIndex];
  const progress = questionsData.length > 0 
    ? ((currentQuestionIndex + 1) / questionsData.length) * 100 
    : 0;
  
  // コンポーネントマウント時にデータをチェック
  useEffect(() => {
    if (questionsData.length > 0) {
      setIsLoading(false);
    }
  }, [questionsData]);
  
  // 前の回答があれば選択状態を復元
  useEffect(() => {
    if (!currentQuestion) return;
    const existingAnswer = answers.find(a => a.questionId === currentQuestion.id);
    if (existingAnswer) {
      setSelectedOption(existingAnswer.selectedOption);
    } else {
      setSelectedOption(null);
    }
  }, [currentQuestionIndex, answers, currentQuestion]);
  
  // オプション選択時の処理
  const handleOptionSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex);
  };
  
  // 前の質問に戻る
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setDirection(-1);
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  // 次の質問へ進む
  const handleNext = () => {
    if (selectedOption === null || !currentQuestion) return;
    
    // 現在の回答を保存/更新
    const newAnswers = [...answers];
    const existingAnswerIndex = newAnswers.findIndex(a => a.questionId === currentQuestion.id);
    
    if (existingAnswerIndex >= 0) {
      newAnswers[existingAnswerIndex].selectedOption = selectedOption;
    } else {
      newAnswers.push({
        questionId: currentQuestion.id,
        selectedOption: selectedOption
      });
    }
    
    setAnswers(newAnswers);
    
    // 次の質問へ進むか、最後ならクイズ完了
    if (currentQuestionIndex < questionsData.length - 1) {
      setDirection(1);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      calculateResults(newAnswers);
      setQuizCompleted(true);
    }
  };
  
  // 結果計算
  const calculateResults = (finalAnswers: Answer[]) => {
    let giverScore = 0;
    let takerScore = 0;
    let matcherScore = 0;
    
    finalAnswers.forEach(answer => {
      const question = questionsData.find(q => q.id === answer.questionId);
      if (question && question.options && question.options[answer.selectedOption]) {
        const option = question.options[answer.selectedOption];
        giverScore += option.score.giver;
        takerScore += option.score.taker;
        matcherScore += option.score.matcher;
      }
    });
    
    const total = giverScore + takerScore + matcherScore;
    
    let dominantType: PersonalityType = 'matcher';
    if (giverScore >= takerScore && giverScore >= matcherScore) {
      dominantType = 'giver';
    } else if (takerScore >= giverScore && takerScore >= matcherScore) {
      dominantType = 'taker';
    }
    
    const results: QuizResults = {
      giver: giverScore,
      taker: takerScore,
      matcher: matcherScore,
      dominantType,
      percentage: {
        giver: Math.round((giverScore / total) * 100),
        taker: Math.round((takerScore / total) * 100),
        matcher: Math.round((matcherScore / total) * 100)
      }
    };
    
    setResults(results);
    
    // 結果をローカルストレージに保存
    localStorage.setItem('quizResults', JSON.stringify(results));
    
    // 結果をサーバーに送信
    saveResults(results);
    setQuizCompleted(true);
  };
  
  // 結果の保存（サーバー側へのAPI呼び出し）
  const saveResults = async (results: QuizResults) => {
    try {
      setQuizState('loading');
      const response = await fetch('/api/quiz/save-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(results),
      });
      
      if (!response.ok) {
        throw new Error(`結果の保存に失敗しました: ${response.status}`);
      }
      
      // 保存成功後、結果ページに遷移
      router.push(`/quiz/results?type=${results.dominantType}`);
    } catch (error) {
      console.error('結果の保存中にエラーが発生しました:', error);
      // エラーが発生してもローカルストレージには保存されているので結果ページへ遷移
      router.push(`/quiz/results?type=${results.dominantType}`);
    } finally {
      setQuizState('questioning');
    }
  };
  
  // 結果ページへリダイレクト
  useEffect(() => {
    if (quizCompleted && results) {
      // 結果をURLパラメータとして渡す
      const typeParam = results.dominantType;
      setTimeout(() => {
        router.push(`/quiz/results?type=${typeParam}`);
      }, 500); // リダイレクト前に短い遅延を追加
    }
  }, [quizCompleted, results, router]);

  // アニメーションバリアント
  const pageVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -1000 : 1000,
      opacity: 0
    })
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5
  };

  const startQuiz = () => {
    setQuizState('questioning');
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setDirection(-1);
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNextQuestion = () => {
    if (selectedOption === null || !currentQuestion) return;
    
    // 現在の回答を保存/更新
    const newAnswers = [...answers];
    const existingAnswerIndex = newAnswers.findIndex(a => a.questionId === currentQuestion.id);
    
    if (existingAnswerIndex >= 0) {
      newAnswers[existingAnswerIndex].selectedOption = selectedOption;
    } else {
      newAnswers.push({
        questionId: currentQuestion.id,
        selectedOption: selectedOption
      });
    }
    
    setAnswers(newAnswers);
    
    // 次の質問へ進むか、最後ならクイズ完了
    if (currentQuestionIndex < questionsData.length - 1) {
      setDirection(1);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      calculateResults(newAnswers);
      setQuizCompleted(true);
    }
  };

  if (isLoading || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-600 to-violet-600 flex items-center justify-center p-4">
        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
            <h2 className="text-2xl font-bold text-gray-800">質問データの読み込み中...</h2>
            <p className="text-gray-600 text-center">少々お待ちください。診断の準備をしています。</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 py-6 md:py-12 px-4">
      <motion.div 
        className="container max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* ヘッダー */}
        <motion.div 
          className="text-center text-white mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.h1 
            className="text-3xl md:text-4xl font-bold mb-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            英語学習タイプ診断
          </motion.h1>
          <motion.p 
            className="text-lg text-blue-100 max-w-xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            あなたに最適な英語学習法を見つけましょう
          </motion.p>
        </motion.div>

        {/* クイズカード */}
        <motion.div 
          className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {quizState === 'intro' && (
            <div className="p-8">
              <motion.h2 
                className="text-2xl font-bold text-gray-800 mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                英語学習スタイル診断へようこそ！
              </motion.h2>
              <motion.p 
                className="text-gray-600 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                この診断では、10個の質問に答えることで、あなたに最適な英語学習スタイルを特定します。
                自分の学習傾向を知って、より効果的な学習方法を見つけましょう。
              </motion.p>
              <motion.div 
                className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-start">
                  <FaRegLightbulb className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                  <p className="text-blue-800">
                    <span className="font-semibold">ヒント:</span> 直感的に答えるのがベストです。あまり考えすぎずに、自分の第一印象で回答してください。
                  </p>
                </div>
              </motion.div>
              <motion.button
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center"
                onClick={startQuiz}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-label="診断を始める"
              >
                診断を始める <FaArrowRight className="ml-2" />
              </motion.button>
            </div>
          )}

          {quizState === 'questioning' && (
            <div className="p-6 md:p-8">
              {/* プログレスバー */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>質問 {currentQuestionIndex + 1} / {questionsData.length}</span>
                  <span>完了まで残り {questionsData.length - currentQuestionIndex - 1} 問</span>
                </div>
                <div 
                  className="h-2 w-full bg-gray-200 rounded-full overflow-hidden"
                  role="progressbar" 
                  aria-valuenow={((currentQuestionIndex + 1) / questionsData.length) * 100}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${Math.round(((currentQuestionIndex + 1) / questionsData.length) * 100)}%完了`}
                >
                  <motion.div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                    initial={{ width: `${(currentQuestionIndex / questionsData.length) * 100}%` }}
                    animate={{ width: `${((currentQuestionIndex + 1) / questionsData.length) * 100}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* 質問 */}
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="mb-8"
              >
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                  {currentQuestion.text}
                </h2>
                {currentQuestion.description && (
                  <p className="text-gray-600 mb-4">{currentQuestion.description}</p>
                )}
              </motion.div>

              {/* 回答オプション */}
              <div className="space-y-3">
                <AnimatePresence mode="wait">
                  {currentQuestion.options.map((option, index) => (
                    <motion.button
                      key={index}
                      className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                        selectedOption === index 
                          ? 'border-blue-600 bg-blue-50' 
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                      }`}
                      onClick={() => handleOptionSelect(index)}
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      aria-label={`選択肢: ${option.text}`}
                      role="radio"
                      aria-checked={selectedOption === index}
                    >
                      <div className="flex items-start">
                        <div 
                          className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mr-3 mt-0.5 ${
                            selectedOption === index 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {String.fromCharCode(65 + index)}
                        </div>
                        <div>
                          <h3 className={`font-medium ${
                            selectedOption === index ? 'text-blue-800' : 'text-gray-800'
                          }`}>
                            {option.text}
                          </h3>
                          {option.description && (
                            <p className={`text-sm mt-1 ${
                              selectedOption === index ? 'text-blue-700' : 'text-gray-600'
                            }`}>
                              {option.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>

              {/* ナビゲーションボタン */}
              <div className="flex justify-between mt-8">
                <motion.button
                  className="px-5 py-2.5 flex items-center justify-center border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex === 0}
                  whileHover={{ x: -2 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="前の質問へ戻る"
                >
                  <FaArrowLeft className="mr-2" />
                  戻る
                </motion.button>
                <motion.button
                  className={`px-5 py-2.5 flex items-center justify-center rounded-lg transition-colors ${
                    selectedOption !== null 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-blue-300 text-white cursor-not-allowed'
                  }`}
                  onClick={handleNextQuestion}
                  disabled={selectedOption === null}
                  whileHover={selectedOption !== null ? { x: 2 } : {}}
                  whileTap={selectedOption !== null ? { scale: 0.95 } : {}}
                  aria-label="次の質問へ進む"
                  aria-disabled={selectedOption === null}
                >
                  {currentQuestionIndex === questionsData.length - 1 ? '結果を見る' : '次へ'}
                  {currentQuestionIndex === questionsData.length - 1 ? null : <FaArrowRight className="ml-2" />}
                </motion.button>
              </div>
            </div>
          )}

          {quizState === 'loading' && (
            <div className="p-8 flex flex-col items-center justify-center h-64">
              <div className="relative">
                <FaSpinner className="text-blue-600 text-4xl animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                </div>
              </div>
              <p className="text-gray-600 mt-4">結果を計算中...</p>
            </div>
          )}
        </motion.div>

        {/* フッター情報 */}
        <motion.div 
          className="text-center text-white text-sm py-4 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ delay: 0.5 }}
        >
          <p>© {new Date().getFullYear()} 英語学習タイプ診断 | 科学的根拠に基づいた効果的な学習法をご提案します</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default QuizClient; 