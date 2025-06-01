'use client';

import React from 'react';
import { TabType } from '@/types/quiz';

// タブコンテンツのプロパティ型定義
interface ResultsTabContentProps {
  selectedTab: TabType;
  personalityType: any; // 後でより詳細な型定義にする
}

// 結果タブコンテンツコンポーネント
const ResultsTabContent: React.FC<ResultsTabContentProps> = ({ selectedTab, personalityType }) => {
  return (
    <div className="tab-content py-6">
      {selectedTab === 'strengths' && (
        <ul className="space-y-2">
          {personalityType.strengths.map((strength: string, index: number) => (
            <li key={index} className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>{strength}</span>
            </li>
          ))}
        </ul>
      )}
      
      {selectedTab === 'weaknesses' && (
        <ul className="space-y-2">
          {personalityType.weaknesses.map((weakness: string, index: number) => (
            <li key={index} className="flex items-start">
              <span className="text-amber-500 mr-2">!</span>
              <span>{weakness}</span>
            </li>
          ))}
        </ul>
      )}
      
      {selectedTab === 'tips' && (
        <ul className="space-y-2">
          {personalityType.learning_advice.tips.map((tip: string, index: number) => (
            <li key={index} className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ResultsTabContent; 