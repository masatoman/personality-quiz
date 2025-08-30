/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */

import React from 'react';

// フィルターオプションの型定義
interface FilterOptions {
  category: string;
  level: string;
  sortBy: string;
}

export default function MaterialsFilter() {
  // 中学英文法の文法項目別カテゴリ
  const categories = [
    { id: 'all', name: '全て' },
    { id: 'be_verbs', name: 'be動詞・一般動詞' },
    { id: 'present_progressive', name: '現在進行形・過去形' },
    { id: 'future_modal', name: '未来形・助動詞' },
    { id: 'present_perfect', name: '現在完了' },
    { id: 'passive_voice', name: '受動態' },
    { id: 'infinitive_gerund', name: '不定詞・動名詞' },
    { id: 'relative_pronouns', name: '関係代名詞' },
    { id: 'others', name: 'その他' }
  ];

  // 学年別レベルフィルター
  const levels = [
    { id: 'all', name: '全て' },
    { id: 'grade1', name: '中1レベル' },
    { id: 'grade2', name: '中2レベル' },
    { id: 'grade3', name: '中3レベル' }
  ];

  const sortOptions = [
    { id: 'newest', name: '新着順' },
    { id: 'popular', name: '人気順' },
    { id: 'rating', name: '評価順' }
  ];

  return (
    <div className="bg-white p-4 sm:p-3 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-lg sm:text-base font-bold mb-4 sm:mb-3 text-gray-900">フィルター</h2>
      
      {/* 文法項目 */}
      <div className="mb-6 sm:mb-4">
        <h3 className="font-medium mb-3 sm:mb-2 text-sm text-gray-800">文法項目</h3>
        <div className="space-y-2 sm:space-y-1">
          {categories.map(category => (
            <label key={category.id} className="flex items-center text-sm sm:text-xs cursor-pointer hover:bg-gray-50 p-1 rounded">
              <input
                type="radio"
                name="category"
                value={category.id}
                className="mr-3 sm:mr-2 text-blue-600"
              />
              <span className="text-gray-700">{category.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 学年レベル */}
      <div className="mb-6 sm:mb-4">
        <h3 className="font-medium mb-3 sm:mb-2 text-sm text-gray-800">学年レベル</h3>
        <div className="space-y-2 sm:space-y-1">
          {levels.map(level => (
            <label key={level.id} className="flex items-center text-sm sm:text-xs cursor-pointer hover:bg-gray-50 p-1 rounded">
              <input
                type="radio"
                name="level"
                value={level.id}
                className="mr-3 sm:mr-2 text-blue-600"
              />
              <span className="text-gray-700">{level.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 並び替え */}
      <div className="mb-6 sm:mb-4">
        <h3 className="font-medium mb-3 sm:mb-2 text-sm text-gray-800">並び替え</h3>
        <select className="w-full p-2 sm:p-1 border border-gray-300 rounded-md text-sm sm:text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          {sortOptions.map(option => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </div>

      {/* フィルターをリセット */}
      <button className="w-full bg-gray-100 text-gray-700 py-2 sm:py-1 px-3 sm:px-2 rounded-md hover:bg-gray-200 text-sm sm:text-xs font-medium transition-colors">
        フィルターをリセット
      </button>
    </div>
  );
} 