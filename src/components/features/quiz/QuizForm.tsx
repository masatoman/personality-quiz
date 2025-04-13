'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { QuizQuestion, Answer } from './types';

interface QuizFormProps {
  question: QuizQuestion;
  selectedOption: number | null;
  onOptionSelect: (optionIndex: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  progress: number;
  canGoBack: boolean;
}

export const QuizForm: React.FC<QuizFormProps> = ({
  question,
  selectedOption,
  onOptionSelect,
  onPrevious,
  onNext,
  progress,
  canGoBack
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-2xl mx-auto p-6"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">{question.text}</h2>
        {question.description && (
          <p className="text-gray-600 mb-4">{question.description}</p>
        )}
      </div>

      <div className="space-y-4">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => onOptionSelect(index)}
            className={`w-full p-4 text-left rounded-lg border transition-all ${
              selectedOption === index
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <p className="font-medium">{option.text}</p>
            {option.description && (
              <p className="text-sm text-gray-600 mt-2">{option.description}</p>
            )}
          </button>
        ))}
      </div>

      <div className="mt-8 flex justify-between items-center">
        <button
          onClick={onPrevious}
          disabled={!canGoBack}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            canGoBack
              ? 'text-blue-600 hover:bg-blue-50'
              : 'text-gray-400 cursor-not-allowed'
          }`}
        >
          <FaChevronLeft />
          <span>前の質問</span>
        </button>

        <div className="w-1/3 bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <button
          onClick={onNext}
          disabled={selectedOption === null}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            selectedOption !== null
              ? 'text-blue-600 hover:bg-blue-50'
              : 'text-gray-400 cursor-not-allowed'
          }`}
        >
          <span>次の質問</span>
          <FaChevronRight />
        </button>
      </div>
    </motion.div>
  );
}; 