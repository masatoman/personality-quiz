/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */

import { motion } from 'framer-motion';
import { QuizQuestion } from '@/types/quiz';
import { FaRegCheckCircle } from 'react-icons/fa';

interface QuestionCardProps {
  question: QuizQuestion;
  currentQuestion: number;
  totalQuestions: number;
  onAnswer: (index: number) => void;
  selectedOption?: number | null;
}

export const QuestionCard = ({
  question,
  currentQuestion,
  totalQuestions,
  onAnswer,
  selectedOption = null,
}: QuestionCardProps) => {
  return (
    <div className="w-full">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
            質問 {currentQuestion + 1}: {question.text}
          </h2>
          
          {question.description && (
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {question.description}
            </p>
          )}
        </div>

        <div className="space-y-3">
          {question.options.map((option, index) => (
            <div 
              key={index}
              onClick={() => onAnswer(index)}
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
      </div>
    </div>
  );
}; 