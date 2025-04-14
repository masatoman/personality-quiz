'use client';

import React from 'react';
import { LearningType } from '@/types/quiz';
import { ResultsData } from '@/types/results';

interface ResultsHeaderProps {
  data: ResultsData;
  learningType: {
    primary: LearningType;
    secondary: LearningType;
    scores: {
      giver: number;
      taker: number;
      matcher: number;
    };
  };
  isMobile: boolean;
}

const ResultsHeader: React.FC<ResultsHeaderProps> = ({ 
  data, 
  learningType,
  isMobile 
}) => {
  const { primary, secondary, scores } = learningType;
  const primaryInfo = data.personalityInfo[primary];
  const secondaryInfo = data.personalityInfo[secondary];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className={`text-center ${isMobile ? 'px-2' : 'px-4'}`}>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
          あなたの学習タイプ診断結果
        </h1>
        <p className="text-lg sm:text-xl text-gray-700">
          主要タイプ: <span className="font-semibold">{primaryInfo.title}</span>
        </p>
      </div>

      <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-2 gap-6'}`}>
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">
            {primaryInfo.title}型 ({scores[primary]}%)
          </h2>
          <p className={`text-gray-700 ${isMobile ? 'text-sm' : 'text-base'} mb-4`}>
            {primaryInfo.description}
          </p>
          <div className="space-y-2">
            {primaryInfo.strengths.slice(0, isMobile ? 2 : 3).map((strength, index) => (
              <div key={index} className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-base'}`}>{strength}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">
            {secondaryInfo.title}型 ({scores[secondary]}%)
          </h2>
          <p className={`text-gray-700 ${isMobile ? 'text-sm' : 'text-base'} mb-4`}>
            {secondaryInfo.description}
          </p>
          <div className="space-y-2">
            {secondaryInfo.strengths.slice(0, isMobile ? 2 : 3).map((strength, index) => (
              <div key={index} className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-base'}`}>{strength}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`mt-4 ${isMobile ? 'text-sm' : 'text-base'} text-gray-600 text-center`}>
        <p>
          スクロールして詳細な分析結果を確認できます
        </p>
      </div>
    </div>
  );
};

export default React.memo(ResultsHeader); 