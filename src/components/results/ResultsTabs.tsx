'use client';

import React from 'react';
import { TabType } from '@/types/results';
import clsx from 'clsx';

interface ResultsTabsProps {
  selectedTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: { id: TabType; label: string }[] = [
  { id: 'overview', label: '概要' },
  { id: 'strengths', label: '強み' },
  { id: 'weaknesses', label: '課題' },
  { id: 'tips', label: '改善のヒント' }
];

export function ResultsTabs({ selectedTab, onTabChange }: ResultsTabsProps) {
  return (
    <div className="border-b border-gray-200 mt-8">
      <nav className="-mb-px flex space-x-8" aria-label="診断結果タブ">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={clsx(
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
              selectedTab === tab.id
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
            aria-current={selectedTab === tab.id ? 'page' : undefined}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

export default React.memo(ResultsTabs); 