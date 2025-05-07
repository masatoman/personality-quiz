'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PersonalityType } from '@/types/quiz';

// 質問データ
const questions = [
  {
    text: '英語の勉強会で、あなたはどのように参加しますか？',
    options: [
      { text: '他の参加者の学習をサポートしながら自分も学ぶ', type: 'giver' as PersonalityType },
      { text: '自分の学習に集中して、効率よく進める', type: 'taker' as PersonalityType },
      { text: 'お互いに教え合いながら進める', type: 'matcher' as PersonalityType },
    ],
  },
  {
    text: 'オンライン英会話で、どのようなアプローチを取りますか？',
    options: [
      { text: '講師の話を注意深く聞き、効率的に学習する', type: 'taker' as PersonalityType },
      { text: '講師と友好的な関係を築きながら学ぶ', type: 'matcher' as PersonalityType },
      { text: '講師の指導方法に合わせて柔軟に対応する', type: 'giver' as PersonalityType },
    ],
  },
  {
    text: 'グループプロジェクトでの役割として、どれが最も自然ですか？',
    options: [
      { text: 'チームのまとめ役として、全員の意見を調整する', type: 'giver' as PersonalityType },
      { text: 'プロジェクトのリーダーとして、目標達成に向けて指揮を取る', type: 'matcher' as PersonalityType },
      { text: 'チームメンバーと協力しながら、相互に学び合う', type: 'taker' as PersonalityType },
    ],
  },
  {
    text: '英語の教材を選ぶ際、何を重視しますか？',
    options: [
      { text: '効率的に学習できる、体系的な教材', type: 'matcher' as PersonalityType },
      { text: '他の学習者と共有できる、インタラクティブな教材', type: 'taker' as PersonalityType },
      { text: '様々なレベルの学習者に対応できる、柔軟な教材', type: 'giver' as PersonalityType },
    ],
  },
  {
    text: '英語学習の目標設定について、どのように考えますか？',
    options: [
      { text: '明確な目標を立て、計画的に達成を目指す', type: 'matcher' as PersonalityType },
      { text: '周囲の成長に合わせて、柔軟に目標を調整する', type: 'taker' as PersonalityType },
      { text: '他者の目標達成もサポートしながら、共に成長する', type: 'giver' as PersonalityType },
    ],
  },
  {
    text: '英語でのコミュニケーションで最も重視することは？',
    options: [
      { text: '正確さと流暢さのバランスを取りながら効果的に伝える', type: 'matcher' as PersonalityType },
      { text: '相手の理解度に合わせて、分かりやすく伝える', type: 'giver' as PersonalityType },
      { text: '相互理解を深めながら、自然な会話を楽しむ', type: 'taker' as PersonalityType },
    ],
  },
  {
    text: '英語学習でつまずいた時、どのように対処しますか？',
    options: [
      { text: '他の学習者と情報を共有し、一緒に解決策を見つける', type: 'taker' as PersonalityType },
      { text: '自分で問題を分析し、効率的な解決方法を見つける', type: 'matcher' as PersonalityType },
      { text: '経験を共有して、同じ悩みを持つ人をサポートする', type: 'giver' as PersonalityType },
    ],
  },
  {
    text: '英語学習のモチベーションを保つために、何を重視しますか？',
    options: [
      { text: '目標達成に向けての進捗を確認する', type: 'matcher' as PersonalityType },
      { text: '他の学習者との交流や励まし合い', type: 'taker' as PersonalityType },
      { text: '他者の成長をサポートすることでの達成感', type: 'giver' as PersonalityType },
    ],
  },
  {
    text: '英語学習コミュニティでの理想的な役割は？',
    options: [
      { text: 'メンバーのサポートと学習環境の改善', type: 'giver' as PersonalityType },
      { text: '積極的な参加と建設的な意見の提供', type: 'matcher' as PersonalityType },
      { text: 'メンバー間の交流促進と相互学習', type: 'taker' as PersonalityType },
    ],
  },
  {
    text: '新しい英語学習法を試す際の姿勢は？',
    options: [
      { text: '効果を検証しながら、自分に最適な方法を見つける', type: 'matcher' as PersonalityType },
      { text: '他の学習者と共有し、フィードバックを交換する', type: 'taker' as PersonalityType },
      { text: '様々な学習者のニーズに対応できる方法を探る', type: 'giver' as PersonalityType },
    ],
  },
];

// 診断結果を計算するロジック
function calculatePersonalityType(answers: number[]): { type: PersonalityType, totals: { [key in PersonalityType]: { count: number, percentage: number } } } {
  const counts: Record<PersonalityType, number> = {
    giver: 0,
    taker: 0,
    matcher: 0
  };

  // 各回答を処理
  answers.forEach((answerIndex, questionIndex) => {
    if (questionIndex < questions.length && answerIndex >= 0 && answerIndex < questions[questionIndex].options.length) {
      const type = questions[questionIndex].options[answerIndex].type;
      counts[type] += 1;
    }
  });

  // 回答割合の計算
  const totalAnswers = answers.filter(a => a !== -1).length;
  const totals: { [key in PersonalityType]: { count: number, percentage: number } } = {
    giver: {
      count: counts.giver,
      percentage: Math.round((counts.giver / totalAnswers) * 100)
    },
    taker: {
      count: counts.taker,
      percentage: Math.round((counts.taker / totalAnswers) * 100)
    },
    matcher: {
      count: counts.matcher,
      percentage: Math.round((counts.matcher / totalAnswers) * 100)
    }
  };

  // 最も多い回答のタイプを特定
  let maxType: PersonalityType = 'matcher'; // デフォルト値
  let maxCount = counts.matcher;

  (Object.entries(counts) as [PersonalityType, number][]).forEach(([type, count]) => {
    if (count > maxCount) {
      maxType = type;
      maxCount = count;
    }
  });

  return { type: maxType, totals };
}

// エラーメッセージコンポーネント
const ErrorMessage = ({ message, onRetry }: { message: string, onRetry: () => void }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
      <h2 className="text-2xl font-bold text-red-600 mb-4">エラー</h2>
      <p className="text-gray-700 mb-6">{message}</p>
      <button 
        onClick={onRetry}
        className="bg-giver text-white font-bold py-2 px-6 rounded-lg shadow hover:bg-giver-dark transition-colors"
      >
        再試行する
      </button>
    </div>
  </div>
);

export default function QuizClient() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number>(-1);
  const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(-1));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  // 診断を開始
  const startQuiz = () => {
    setShowQuiz(true);
    setAnswers(Array(questions.length).fill(-1));
    setCurrentQuestionIndex(0);
  };

  // オプション選択時の処理
  const handleOptionSelect = (optionIndex: number) => {
    setSelectedOptionIndex(optionIndex);
    
    // 一時的な回答配列を作成して更新
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  // 次の質問へ進む
  const handleNextQuestion = () => {
    try {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedOptionIndex(answers[currentQuestionIndex + 1]);
      } else {
        // 結果を計算して結果ページへ遷移
        calculatePersonalityType(answers);
        setIsLoading(true);
      }
    } catch (err) {
      setError('予期せぬエラーが発生しました。もう一度お試しください。');
      console.error(err);
    }
  };

  // 前の質問に戻る
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedOptionIndex(answers[currentQuestionIndex - 1]);
    }
  };

  // エラー処理のリセット
  const handleRetry = () => {
    setError(null);
    setIsLoading(false);
  };

  // アニメーションバリアント
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  // 現在の質問を取得
  const currentQuestion = questions[currentQuestionIndex];
  
  // 進行状況を計算（パーセント）
  const progress = Math.round(((currentQuestionIndex + 1) / questions.length) * 100);

  return (
    <main className="min-h-screen pt-24 pb-12 px-4 bg-gradient-to-b from-giver-light/5 to-surface-light flex flex-col items-center justify-center">
      <div 
        ref={mainRef}
        className="w-full max-w-3xl mx-auto flex flex-col items-center"
      >
        {error && <ErrorMessage message={error} onRetry={handleRetry} />}

        {!showQuiz ? (
          // 診断開始画面
          <motion.div 
            className="w-full max-w-2xl bg-white rounded-3xl shadow-lg p-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-display mb-6 text-gray-900 font-rounded">英語学習タイプ診断</h1>
            <p className="text-body-large mb-8 text-gray-700">
              10個の質問に答えるだけで、あなたの英語学習タイプと最適な学習法がわかります。
              所要時間は約5分です。
            </p>
            <div className="space-y-6 mb-8">
              <div className="flex items-center text-left p-4 bg-surface-light rounded-lg">
                <span className="flex-shrink-0 w-10 h-10 bg-giver text-white rounded-full flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </span>
                <div>
                  <h3 className="font-medium text-gray-900">個人最適な学習法</h3>
                  <p className="text-sm text-gray-600">あなたの性格と学習スタイルに合わせた効果的な方法がわかります</p>
                </div>
              </div>
              <div className="flex items-center text-left p-4 bg-surface-light rounded-lg">
                <span className="flex-shrink-0 w-10 h-10 bg-matcher text-white rounded-full flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </span>
                <div>
                  <h3 className="font-medium text-gray-900">強みと弱み</h3>
                  <p className="text-sm text-gray-600">自分の英語学習における長所と短所を理解できます</p>
                </div>
              </div>
              <div className="flex items-center text-left p-4 bg-surface-light rounded-lg">
                <span className="flex-shrink-0 w-10 h-10 bg-taker text-white rounded-full flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                <div>
                  <h3 className="font-medium text-gray-900">実践的なアドバイス</h3>
                  <p className="text-sm text-gray-600">すぐに実践できる具体的な学習方法とツールを提案します</p>
                </div>
              </div>
            </div>
            <button
              onClick={startQuiz}
              disabled={isLoading}
              className="btn-primary btn-round font-medium text-lg px-10 py-4 shadow-lg w-full max-w-md mx-auto"
            >
              診断をスタート
            </button>
          </motion.div>
        ) : (
          // 質問画面
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentQuestionIndex}
              className="question-card w-full"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="progress-container">
                <div className="progress-info">
                  <span className="progress-text">質問 {currentQuestionIndex + 1} / {questions.length}</span>
                  <span className="progress-text">{progress}% 完了</span>
                </div>
                <div className="progress-bar" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                  <div className="progress-bar-fill giver" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
              
              <div className="question-container">
                <h2 className="question-text">{currentQuestion.text}</h2>
                
                <div className="options-container">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      className={`option-button ${selectedOptionIndex === index ? 'selected' : ''}`}
                      onClick={() => handleOptionSelect(index)}
                    >
                      <div className="radio-circle"></div>
                      <div>
                        <p className="option-title">{option.text}</p>
                      </div>
                    </button>
                  ))}
                </div>
                
                <div className="navigation mt-8 flex justify-between">
                  <button 
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className={`back-btn ${currentQuestionIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    戻る
                  </button>
                  
                  <button
                    onClick={handleNextQuestion}
                    disabled={selectedOptionIndex === -1 || isLoading}
                    className={`next-btn ${selectedOptionIndex === -1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {currentQuestionIndex === questions.length - 1 ? '結果を見る' : '次へ'}
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
      
      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} 英語学習タイプ診断</p>
        <p className="mt-1">科学的根拠に基づいた診断で、あなたに最適な学習法を見つけましょう。</p>
      </footer>
    </main>
  );
} 