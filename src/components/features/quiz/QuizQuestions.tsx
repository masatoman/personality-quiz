'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { QuizQuestion } from '@/types/quiz';
import { QuestionCard } from './QuestionCard';

interface QuizQuestionsProps {
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  selectedOption: number | null;
  direction: number;
  progress: number;
  onOptionSelect: (optionIndex: number) => void;
  onPrevious: () => void;
  onNext: () => void;
}

const QuizQuestions: React.FC<QuizQuestionsProps> = ({
  questions,
  currentQuestionIndex,
  selectedOption,
  direction,
  progress,
  onOptionSelect,
  onPrevious,
  onNext
}) => {
  const currentQuestion = questions[currentQuestionIndex];
  
  if (!currentQuestion) {
    return <div>質問が見つかりません</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* 進捗バー */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-6">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      {/* 質問カード */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ x: direction * 200, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction * -200, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <QuestionCard 
            question={currentQuestion}
            currentQuestion={currentQuestionIndex}
            totalQuestions={questions.length}
            onAnswer={onOptionSelect}
            selectedOption={selectedOption}
          />
        </motion.div>
      </AnimatePresence>
      
      {/* ナビゲーションボタン */}
      <div className="flex justify-between">
        <button
          onClick={onPrevious}
          disabled={currentQuestionIndex === 0}
          className={`
            flex items-center py-2 px-4 rounded-lg transition
            ${currentQuestionIndex === 0
              ? 'text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200'}
          `}
        >
          <FaChevronLeft className="mr-2" />
          前の質問
        </button>
        
        <button
          onClick={onNext}
          disabled={selectedOption === null}
          className={`
            flex items-center py-2 px-4 rounded-lg transition
            ${selectedOption === null
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
              : 'bg-blue-600 hover:bg-blue-700 text-white'}
          `}
        >
          {currentQuestionIndex < questions.length - 1 ? (
            <>
              次の質問
              <FaChevronRight className="ml-2" />
            </>
          ) : (
            '結果を見る'
          )}
        </button>
      </div>
    </div>
  );
};

export default QuizQuestions; 