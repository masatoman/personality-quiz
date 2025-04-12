'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { questions } from '@/data/questions';
import { QuizQuestion, QuizResults, PersonalityType } from '@/types/quiz';
import { motion } from 'framer-motion';
import { FaSpinner } from 'react-icons/fa';

// 分割した新しいコンポーネント
import QuizIntro from './QuizIntro';
import QuizQuestions from './QuizQuestions';
import { saveQuizResults } from './QuizApiService';

// カスタム型定義
type Answer = {
  questionId: number;
  selectedOption: number;
};

const QuizClient: React.FC = () => {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [direction, setDirection] = useState(0); // アニメーション方向: 1=前進, -1=後退
  const [quizState, setQuizState] = useState<'intro' | 'questioning' | 'loading'>('intro');
  
  // 質問データをチェック - useMemoでメモ化
  const questionsData = useMemo(() => {
    return Array.isArray(questions) ? (questions as unknown as QuizQuestion[]) : [];
  }, []);
  
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
    if (questionsData.length === 0 || currentQuestionIndex >= questionsData.length) return;
    
    const currentQuestion = questionsData[currentQuestionIndex];
    const existingAnswer = answers.find(a => a.questionId === currentQuestion.id);
    if (existingAnswer) {
      setSelectedOption(existingAnswer.selectedOption);
    } else {
      setSelectedOption(null);
    }
  }, [currentQuestionIndex, answers, questionsData]);
  
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
    if (selectedOption === null || questionsData.length === 0 || currentQuestionIndex >= questionsData.length) return;
    
    const currentQuestion = questionsData[currentQuestionIndex];
    
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
    
    // 結果をローカルストレージに保存
    localStorage.setItem('quizResults', JSON.stringify(results));
    
    // 結果をサーバーに送信
    handleSaveResults(results);
  };
  
  // 結果の保存（サーバー側へのAPI呼び出し）
  const handleSaveResults = async (results: QuizResults) => {
    try {
      setQuizState('loading');
      await saveQuizResults(results);
      
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
  
  // クイズ開始
  const startQuiz = () => {
    setQuizState('questioning');
  };
  
  // ローディング表示
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-blue-600 text-4xl" />
      </div>
    );
  }
  
  // クイズ画面の表示
  return (
    <div className="container mx-auto px-4 py-8">
      {quizState === 'intro' && (
        <QuizIntro onStartQuiz={startQuiz} />
      )}
      
      {quizState === 'questioning' && (
        <QuizQuestions
          questions={questionsData}
          currentQuestionIndex={currentQuestionIndex}
          selectedOption={selectedOption}
          direction={direction}
          progress={progress}
          onOptionSelect={handleOptionSelect}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />
      )}
      
      {quizState === 'loading' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-12"
        >
          <FaSpinner className="text-4xl text-blue-600 animate-spin mb-4" />
          <p className="text-lg text-gray-600 dark:text-gray-300">結果を処理中...</p>
        </motion.div>
      )}
    </div>
  );
};

export default QuizClient; 