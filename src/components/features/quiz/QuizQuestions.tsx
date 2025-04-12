'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaChevronRight, FaRegCheckCircle } from 'react-icons/fa';
import { QuizQuestion } from '@/types/quiz';

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
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6"
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
            質問 {currentQuestionIndex + 1}: {currentQuestion.text}
          </h2>
          
          {currentQuestion.description && (
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {currentQuestion.description}
            </p>
          )}
          
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <div 
                key={index}
                onClick={() => onOptionSelect(index)}
                className={`
                  cursor-pointer p-4 rounded-lg border-2 transition duration-200
                  flex justify-between items-center
                  ${selectedOption === index 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'}
                `}
              >
                <div>
                  <p className="text-gray-800 dark:text-gray-200">{option.text}</p>
                  {option.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {option.description}
                    </p>
                  )}
                </div>
                
                {selectedOption === index && (
                  <FaRegCheckCircle className="text-blue-500 text-xl" />
                )}
              </div>
            ))}
          </div>
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