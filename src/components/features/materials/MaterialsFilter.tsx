import React from 'react';

// フィルターオプションの型定義
interface FilterOptions {
  category: string;
  level: string;
  sortBy: string;
}

export default function MaterialsFilter() {
  const categories = [
    { id: 'all', name: '全て' },
    { id: 'grammar', name: '文法' },
    { id: 'vocabulary', name: '語彙' },
    { id: 'reading', name: 'リーディング' },
    { id: 'listening', name: 'リスニング' },
    { id: 'speaking', name: 'スピーキング' },
    { id: 'writing', name: 'ライティング' }
  ];

  const levels = [
    { id: 'all', name: '全て' },
    { id: 'beginner', name: '初級' },
    { id: 'intermediate', name: '中級' },
    { id: 'advanced', name: '上級' }
  ];

  const sortOptions = [
    { id: 'newest', name: '新着順' },
    { id: 'popular', name: '人気順' },
    { id: 'rating', name: '評価順' }
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-bold mb-4">フィルター</h2>
      
      {/* カテゴリー */}
      <div className="mb-6">
        <h3 className="font-medium mb-2">カテゴリー</h3>
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

      {/* レベル */}
      <div className="mb-6">
        <h3 className="font-medium mb-2">レベル</h3>
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