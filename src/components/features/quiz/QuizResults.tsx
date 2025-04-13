'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FaRegLightbulb, FaRegCheckCircle } from 'react-icons/fa';
import { QuizResults as QuizResultsType } from './types';

interface QuizResultsProps {
  results: QuizResultsType;
  onRetake?: () => void;
}

export const QuizResults: React.FC<QuizResultsProps> = ({ results, onRetake }) => {
  const personalityDescriptions = {
    giver: 'あなたは他者に貢献することに喜びを感じるタイプです。知識や経験を共有することで、コミュニティに価値を提供することができます。',
    taker: 'あなたは効率的に学習を進めることを重視するタイプです。必要な知識を素早く吸収し、実践に活かすことができます。',
    matcher: 'あなたは与えることと得ることのバランスを重視するタイプです。互恵的な関係を築きながら、コミュニティの発展に貢献できます。'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto p-6"
    >
      <div className="text-center mb-8">
        <FaRegCheckCircle className="mx-auto text-green-500 text-5xl mb-4" />
        <h2 className="text-3xl font-bold mb-2">診断完了！</h2>
        <p className="text-gray-600">
          あなたの主要なパーソナリティタイプは「
          <span className="font-semibold text-blue-600">
            {results.dominantType === 'giver' ? 'ギバー' :
             results.dominantType === 'taker' ? 'テイカー' : 'マッチャー'}
          </span>
          」です
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">
          <FaRegLightbulb className="inline-block mr-2 text-yellow-500" />
          あなたの特徴
        </h3>
        <p className="text-gray-700 mb-6">
          {personalityDescriptions[results.dominantType]}
        </p>

        <div className="space-y-4">
          <div className="relative pt-1">
            <div className="flex justify-between mb-2">
              <span className="font-medium">ギバー度</span>
              <span className="text-blue-600">{results.percentage.giver}%</span>
            </div>
            <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
              <div
                style={{ width: `${results.percentage.giver}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
              />
            </div>
          </div>

          <div className="relative pt-1">
            <div className="flex justify-between mb-2">
              <span className="font-medium">テイカー度</span>
              <span className="text-green-600">{results.percentage.taker}%</span>
            </div>
            <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
              <div
                style={{ width: `${results.percentage.taker}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
              />
            </div>
          </div>

          <div className="relative pt-1">
            <div className="flex justify-between mb-2">
              <span className="font-medium">マッチャー度</span>
              <span className="text-purple-600">{results.percentage.matcher}%</span>
            </div>
            <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
              <div
                style={{ width: `${results.percentage.matcher}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"
              />
            </div>
          </div>
        </div>
      </div>

      {onRetake && (
        <div className="text-center">
          <button
            onClick={onRetake}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            診断をやり直す
          </button>
        </div>
      )}
    </motion.div>
  );
}; 