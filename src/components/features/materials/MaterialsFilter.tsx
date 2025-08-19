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
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-bold mb-4">フィルター</h2>
      
      {/* 文法項目 */}
      <div className="mb-6">
        <h3 className="font-medium mb-2">文法項目</h3>
        <div className="space-y-2">
          {categories.map(category => (
            <label key={category.id} className="flex items-center">
              <input
                type="radio"
                name="category"
                value={category.id}
                className="mr-2"
              />
              {category.name}
            </label>
          ))}
        </div>
      </div>

      {/* 学年レベル */}
      <div className="mb-6">
        <h3 className="font-medium mb-2">学年レベル</h3>
        <div className="space-y-2">
          {levels.map(level => (
            <label key={level.id} className="flex items-center">
              <input
                type="radio"
                name="level"
                value={level.id}
                className="mr-2"
              />
              {level.name}
            </label>
          ))}
        </div>
      </div>

      {/* 並び替え */}
      <div className="mb-6">
        <h3 className="font-medium mb-2">並び替え</h3>
        <select className="w-full p-2 border rounded">
          {sortOptions.map(option => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </div>

      {/* フィルターをリセット */}
      <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded hover:bg-gray-200">
        フィルターをリセット
      </button>
    </div>
  );
} 