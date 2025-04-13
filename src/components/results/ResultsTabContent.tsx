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
      
      {selectedTab === 'advice' && (
        <ul className="space-y-2">
          {personalityType.learning_advice.tips.map((tip: string, index: number) => (
            <li key={index} className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      )}
      
      {selectedTab === 'tools' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {personalityType.learning_advice.tools.map((tool: any, index: number) => (
            <div key={index} className="border rounded-lg p-4">
              <h3 className="font-bold mb-1">{tool.name}</h3>
              <p className="text-sm text-gray-600">{tool.description}</p>
            </div>
          ))}
        </div>
      )}
      
      {selectedTab === 'scenarios' && (
        <div className="space-y-6">
          {personalityType.scenarios.map((scenario: any, index: number) => (
            <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
              <h3 className="font-bold text-blue-800 mb-2">{scenario.scenario}</h3>
              <p className="mb-2">{scenario.approach}</p>
              <div className="flex items-center mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${scenario.effectiveness_rate}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 ml-2">{scenario.effectiveness_rate}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResultsTabContent; 