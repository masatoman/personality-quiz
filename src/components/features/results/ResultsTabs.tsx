'use client';

import React from 'react';
import { 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaLightbulb, 
  FaTools, 
  FaRegLightbulb 
} from 'react-icons/fa';
import { TabType } from '@/types/quiz';

// タブのプロパティの型定義
interface ResultsTabsProps {
  selectedTab: TabType;
  setSelectedTab: (tab: TabType) => void;
}

// 結果タブコンポーネント
const ResultsTabs: React.FC<ResultsTabsProps> = ({ selectedTab, setSelectedTab }) => {
  return (
    <div className="tabs flex border-b overflow-x-auto">
      <button 
        className={`px-4 py-2 font-medium ${selectedTab === 'strengths' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        onClick={() => setSelectedTab('strengths')}
      >
        <FaCheckCircle className="inline mr-2" />
        強み
      </button>
      <button 
        className={`px-4 py-2 font-medium ${selectedTab === 'weaknesses' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        onClick={() => setSelectedTab('weaknesses')}
      >
        <FaExclamationTriangle className="inline mr-2" />
        弱み
      </button>
      <button 
        className={`px-4 py-2 font-medium ${selectedTab === 'tips' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        onClick={() => setSelectedTab('tips')}
      >
        <FaLightbulb className="inline mr-2" />
        アドバイス
      </button>
    </div>
  );
};

export default ResultsTabs; 