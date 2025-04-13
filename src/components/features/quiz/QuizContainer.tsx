'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { questions } from '@/data/questions';
import { QuizForm } from './QuizForm';
import { QuizResults } from './QuizResults';
import { Answer, QuizQuestion, QuizResults as QuizResultsType, QuizState, PersonalityType } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSpinner } from 'react-icons/fa';

export const QuizContainer: React.FC = () => {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizState, setQuizState] = useState<QuizState>('intro');
  const [results, setResults] = useState<QuizResultsType | null>(null);
  const [direction, setDirection] = useState(0);

  // 質問データをチェック
  const questionsData = Array.isArray(questions) ? (questions as unknown as QuizQuestion[]) : [];
  const currentQuestion = questionsData[currentQuestionIndex];
  const progress = questionsData.length > 0
    ? ((currentQuestionIndex + 1) / questionsData.length) * 100
    : 0;

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

    // 次の質問へ進むか、最後なら結果計算
    if (currentQuestionIndex < questionsData.length - 1) {
      setDirection(1);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      calculateResults(newAnswers);
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

    const results: QuizResultsType = {
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
    setQuizState('loading');
    saveResults(results);
  };

  // 結果の保存
  const saveResults = async (results: QuizResultsType) => {
    try {
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

      setQuizState('completed');
      localStorage.setItem('quizResults', JSON.stringify(results));
    } catch (error) {
      console.error('結果の保存中にエラーが発生しました:', error);
      setQuizState('completed');
      localStorage.setItem('quizResults', JSON.stringify(results));
    }
  };

  // クイズをやり直す
  const handleRetake = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSelectedOption(null);
    setResults(null);
    setQuizState('intro');
  };

  if (quizState === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  if (quizState === 'completed' && results) {
    return <QuizResults results={results} onRetake={handleRetake} />;
  }

  if (quizState === 'intro') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl mx-auto p-6 text-center"
      >
        <h1 className="text-3xl font-bold mb-6">ギバー診断</h1>
        <p className="text-gray-600 mb-8">
          あなたの学習スタイルと他者への貢献傾向を分析し、最適な学習方法を提案します。
        </p>
        <button
          onClick={() => setQuizState('questioning')}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          診断を開始する
        </button>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {currentQuestion && (
        <QuizForm
          question={currentQuestion}
          selectedOption={selectedOption}
          onOptionSelect={handleOptionSelect}
          onPrevious={handlePrevious}
          onNext={handleNext}
          progress={progress}
          canGoBack={currentQuestionIndex > 0}
        />
      )}
    </AnimatePresence>
  );
}; 