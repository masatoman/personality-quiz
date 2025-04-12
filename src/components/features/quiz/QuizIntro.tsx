'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FaRegLightbulb, FaRegQuestionCircle } from 'react-icons/fa';

interface QuizIntroProps {
  onStartQuiz: () => void;
}

const QuizIntro: React.FC<QuizIntroProps> = ({ onStartQuiz }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
    >
      <h1 className="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-white">
        英語学習スタイル診断
      </h1>
      
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
        <p className="text-gray-700 dark:text-gray-200 mb-4">
          この診断では、あなたの英語学習に対するアプローチや好みを分析し、
          最適な学習方法を見つけるお手伝いをします。
        </p>
        <p className="text-gray-700 dark:text-gray-200 mb-4">
          質問はすべてで15問あり、完了まで約5分かかります。
          それぞれの質問に対して、あなたの考えや行動に最も近いものを選んでください。
        </p>
        
        <div className="flex items-center mb-2 text-yellow-600 dark:text-yellow-400">
          <FaRegLightbulb className="mr-2" />
          <p>正解や不正解はありません。素直な気持ちで回答してください。</p>
        </div>
        
        <div className="flex items-center text-blue-600 dark:text-blue-400">
          <FaRegQuestionCircle className="mr-2" />
          <p>回答内容はあなたの学習プランの作成にのみ使用されます。</p>
        </div>
      </div>
      
      <div className="text-center">
        <button
          onClick={onStartQuiz}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition duration-200"
        >
          診断を始める
        </button>
      </div>
    </motion.div>
  );
};

export default QuizIntro; 