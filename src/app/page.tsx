'use client';

import { useState, useEffect } from 'react';
import { PersonalityType } from '@/types/quiz';
import { motion } from 'framer-motion';
import { results } from '@/data/results';

const questions = [
  {
    text: '英語の勉強会で、あなたはどのように参加しますか？',
    options: [
      { text: '他の参加者の学習をサポートしながら自分も学ぶ', type: 'giver' as PersonalityType },
      { text: '自分の学習に集中して、効率よく進める', type: 'matcher' as PersonalityType },
      { text: 'お互いに教え合いながら進める', type: 'taker' as PersonalityType },
    ],
  },
  {
    text: 'オンライン英会話で、どのようなアプローチを取りますか？',
    options: [
      { text: '講師の話を注意深く聞き、効率的に学習する', type: 'matcher' as PersonalityType },
      { text: '講師と友好的な関係を築きながら学ぶ', type: 'taker' as PersonalityType },
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

type SavedResult = {
  type: PersonalityType;
  date: string;
};

export default function Home() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [personalityType, setPersonalityType] = useState<PersonalityType | null>(null);
  const [savedResults, setSavedResults] = useState<SavedResult[]>([]);
  const [typeTotals, setTypeTotals] = useState<Record<PersonalityType, number>>({
    giver: 0,
    taker: 0,
    matcher: 0,
  });

  useEffect(() => {
    const savedData = localStorage.getItem('quizResults');
    if (savedData) {
      const results = JSON.parse(savedData) as SavedResult[];
      setSavedResults(results);
      
      const totals = results.reduce((acc, result) => {
        acc[result.type] = (acc[result.type] || 0) + 1;
        return acc;
      }, { giver: 0, taker: 0, matcher: 0 } as Record<PersonalityType, number>);
      
      setTypeTotals(totals);
    }
  }, []);

  const calculateResult = (answers: number[]) => {
    const scores = {
      giver: 0,
      taker: 0,
      matcher: 0,
    };

    answers.forEach((answerIndex, questionIndex) => {
      const selectedOption = questions[questionIndex].options[answerIndex];
      scores[selectedOption.type] += 1;
    });

    let type: PersonalityType = 'matcher';
    const maxScore = Math.max(...Object.values(scores));
    if (maxScore === scores.giver) type = 'giver';
    if (maxScore === scores.taker) type = 'taker';

    setPersonalityType(type);
    setShowResult(true);

    const newResult = { type, date: new Date().toISOString() };
    const updatedResults = [...savedResults, newResult];
    setSavedResults(updatedResults);
    
    setTypeTotals(prev => ({
      ...prev,
      [type]: (prev[type] || 0) + 1
    }));
    
    localStorage.setItem('quizResults', JSON.stringify(updatedResults));
  };

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResult(newAnswers);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResult(false);
    setPersonalityType(null);
  };

  const shareResult = async () => {
    if (!personalityType) return;
    
    const result = results[personalityType];
    const text = `私は「${personalityType === 'giver' ? 'サポーター型' : personalityType === 'taker' ? '協調学習型' : 'バランス型'}」の英語学習者です！\n${result.description}\n\nあなたも診断してみませんか？`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: '英語学習タイプ診断',
          text,
          url: window.location.href
        });
      } catch (error) {
        console.error('シェアに失敗しました:', error);
      }
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        {!showResult ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">
                質問 {currentQuestion + 1} / {questions.length}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${progress}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                  data-testid="progress-bar"
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>
            <h2 className="text-xl font-bold mb-4">{questions[currentQuestion].text}</h2>
            <div className="space-y-3">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className="w-full p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {option.text}
                </button>
              ))}
            </div>
          </div>
        ) : personalityType && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">診断結果</h2>
              <div className="mb-6">
                <p className="text-lg mb-4">
                  あなたの英語学習タイプは「
                  {personalityType === 'giver' && 'サポーター型'}
                  {personalityType === 'taker' && '協調学習型'}
                  {personalityType === 'matcher' && 'バランス型'}
                  」です
                </p>
                <p className="text-gray-600">{results[personalityType].description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-4">長所</h3>
                  <ul className="space-y-2">
                    {results[personalityType].strengths.map((strength, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-4">短所</h3>
                  <ul className="space-y-2">
                    {results[personalityType].weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-500 mr-2">×</span>
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold mb-4">学習アドバイス</h3>
                <div className="space-y-6">
                  {results[personalityType].learningAdvice.map((advice, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-6">
                      <h4 className="text-lg font-semibold mb-2">{advice.title}</h4>
                      <p className="text-gray-600 mb-4">{advice.description}</p>
                      <ul className="space-y-2">
                        {advice.tips.map((tip, tipIndex) => (
                          <li key={tipIndex} className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold mb-4">全体の統計</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      {typeTotals.giver}
                    </div>
                    <div className="text-sm text-gray-600">サポーター型</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {typeTotals.taker}
                    </div>
                    <div className="text-sm text-gray-600">協調学習型</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-2">
                      {typeTotals.matcher}
                    </div>
                    <div className="text-sm text-gray-600">バランス型</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={shareResult}
                  className="flex-1 bg-green-600 text-white rounded-lg px-6 py-3 hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                  </svg>
                  結果をシェア
                </button>
                <button
                  onClick={resetQuiz}
                  className="flex-1 bg-blue-600 text-white rounded-lg px-6 py-3 hover:bg-blue-700 transition-colors"
                >
                  もう一度診断する
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">最近の診断履歴</h3>
              <div className="space-y-2">
                {savedResults.slice(-5).reverse().map((saved, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">
                      {saved.type === 'giver' && 'サポーター型'}
                      {saved.type === 'taker' && '協調学習型'}
                      {saved.type === 'matcher' && 'バランス型'}
                    </span>
                    <span className="text-sm text-gray-600">
                      {new Date(saved.date).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
