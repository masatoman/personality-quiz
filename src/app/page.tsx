'use client';

import { useState, useEffect } from 'react';
import { questions } from '@/data/questions';
import { results } from '@/data/results';
import { PersonalityType } from '@/types/quiz';
import { motion } from 'framer-motion';

export default function Home() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [personalityType, setPersonalityType] = useState<PersonalityType | null>(null);
  const [savedResults, setSavedResults] = useState<Array<{ type: PersonalityType; date: string }>>([]);

  useEffect(() => {
    const saved = localStorage.getItem('quizResults');
    if (saved) {
      setSavedResults(JSON.parse(saved));
    }
  }, []);

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResult(newAnswers);
    }
  };

  const calculateResult = (answers: number[]) => {
    const scores = { giver: 0, taker: 0, matcher: 0 };

    answers.forEach((answerIndex, questionIndex) => {
      const question = questions[questionIndex];
      const option = question.options[answerIndex];
      scores.giver += option.score.giver;
      scores.taker += option.score.taker;
      scores.matcher += option.score.matcher;
    });

    const maxScore = Math.max(scores.giver, scores.taker, scores.matcher);
    let type: PersonalityType = 'matcher';

    if (maxScore === scores.giver) type = 'giver';
    if (maxScore === scores.taker) type = 'taker';

    setPersonalityType(type);
    setShowResult(true);

    const newResult = { type, date: new Date().toISOString() };
    const updatedResults = [...savedResults, newResult];
    setSavedResults(updatedResults);
    localStorage.setItem('quizResults', JSON.stringify(updatedResults));
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
    const text = `私は「${result.type === 'giver' ? 'ギバー' : result.type === 'taker' ? 'テイカー' : 'マッチャー'}型学習者」です！\n${result.description}\n\nあなたも診断してみませんか？`;
    
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

  if (showResult && personalityType) {
    const result = results[personalityType];
    const typeColors = {
      giver: 'bg-green-500',
      taker: 'bg-blue-500',
      matcher: 'bg-purple-500'
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-6 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <div className={`w-16 h-16 mx-auto mb-6 rounded-full ${typeColors[personalityType]} flex items-center justify-center text-white text-2xl font-bold`}>
              {personalityType === 'giver' ? 'G' : personalityType === 'taker' ? 'T' : 'M'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-900">あなたの結果</h1>
            <p className="text-lg text-gray-800 text-center mb-8">{result.description}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">長所</h2>
                <ul className="space-y-3">
                  {result.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-gray-800">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">短所</h2>
                <ul className="space-y-3">
                  {result.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-500 mr-2">×</span>
                      <span className="text-gray-800">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={shareResult}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-3 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300"></div>
                <div className="relative flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                  </svg>
                  <span className="ml-2">結果をシェア</span>
                </div>
              </button>
              <button
                onClick={resetQuiz}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-3 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300"></div>
                <div className="relative flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-2">もう一度テストを受ける</span>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">学習アドバイス</h2>
            <div className="space-y-8">
              {result.learningAdvice.map((advice, index) => (
                <div key={index} className="border-b border-gray-100 pb-8 last:border-0">
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">{advice.title}</h3>
                  <p className="text-gray-800 mb-4">{advice.description}</p>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-medium mb-3 text-gray-900">具体的なアドバイス：</h4>
                    <ul className="space-y-2">
                      {advice.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          <span className="text-gray-800">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">詳細な分析</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {savedResults.filter(r => r.type === 'giver').length}
                  </div>
                  <div className="text-sm text-gray-600">ギバー型</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {savedResults.filter(r => r.type === 'taker').length}
                  </div>
                  <div className="text-sm text-gray-600">テイカー型</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    {savedResults.filter(r => r.type === 'matcher').length}
                  </div>
                  <div className="text-sm text-gray-600">マッチャー型</div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900">最近の診断履歴</h3>
                <div className="space-y-2">
                  {savedResults.slice(-5).reverse().map((saved, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <span className="text-gray-800 font-medium">
                        {saved.type === 'giver' ? 'ギバー型' : saved.type === 'taker' ? 'テイカー型' : 'マッチャー型'}
                      </span>
                      <span className="text-sm text-gray-600">
                        {new Date(saved.date).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-6 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-600">
                質問 {currentQuestion + 1} / {questions.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                role="progressbar"
                className="bg-blue-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              ></motion.div>
            </div>
          </div>

          <motion.h2
            key={currentQuestion}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="text-xl sm:text-2xl font-bold mb-8 text-gray-900"
          >
            {questions[currentQuestion].text}
          </motion.h2>
          <div className="space-y-4">
            {questions[currentQuestion].options.map((option, index) => (
              <motion.button
                key={index}
                onClick={() => handleAnswer(index)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full text-left p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 text-gray-800 font-medium shadow-sm hover:shadow-md group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-blue-500/5 transition-all duration-300"></div>
                <div className="relative flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-4 group-hover:bg-blue-100 transition-colors duration-300">
                    <span className="text-gray-600 group-hover:text-blue-600 font-medium">{String.fromCharCode(65 + index)}</span>
                  </div>
                  <span className="text-gray-800 group-hover:text-blue-900 transition-colors duration-300">{option.text}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
