import React, { useState } from 'react';
import { 
  FaFilter, 
  FaTimes, 
  FaSort, 
  FaGraduationCap, 
  FaBook, 
  FaEdit, 
  FaClock, 
  FaMagic, 
  FaCheck, 
  FaSync, 
  FaLink, 
  FaEllipsisH, 
  FaFire, 
  FaStar 
} from 'react-icons/fa';

interface FilterOptions {
  category: string[];
  level: string[];
  sortBy: string;
}

export default function MaterialsFilter() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');

  // 中学英文法の文法項目別カテゴリ
  const categories = [
    { id: 'be_verbs', name: 'be動詞・一般動詞', icon: <FaEdit /> },
    { id: 'present_progressive', name: '現在進行形・過去形', icon: <FaClock /> },
    { id: 'future_modal', name: '未来形・助動詞', icon: <FaMagic /> },
    { id: 'present_perfect', name: '現在完了', icon: <FaCheck /> },
    { id: 'passive_voice', name: '受動態', icon: <FaSync /> },
    { id: 'infinitive_gerund', name: '不定詞・動名詞', icon: <FaBook /> },
    { id: 'relative_pronouns', name: '関係代名詞', icon: <FaLink /> },
    { id: 'others', name: 'その他', icon: <FaEllipsisH /> }
  ];

  // 学年別レベルフィルター
  const levels = [
    { id: 'grade1', name: '中1レベル', color: 'bg-green-100 text-green-700' },
    { id: 'grade2', name: '中2レベル', color: 'bg-blue-100 text-blue-700' },
    { id: 'grade3', name: '中3レベル', color: 'bg-purple-100 text-purple-700' }
  ];

  const sortOptions = [
    { id: 'newest', name: '新着順', icon: <FaClock /> },
    { id: 'popular', name: '人気順', icon: <FaFire /> },
    { id: 'rating', name: '評価順', icon: <FaStar /> }
  ];

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleLevelToggle = (levelId: string) => {
    setSelectedLevels(prev => 
      prev.includes(levelId) 
        ? prev.filter(id => id !== levelId)
        : [...prev, levelId]
    );
  };

  const handleReset = () => {
    setSelectedCategories([]);
    setSelectedLevels([]);
    setSortBy('newest');
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedLevels.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* ヘッダー */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaFilter className="text-blue-600 text-sm" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">フィルター</h2>
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              リセット
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 文法項目 */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FaBook className="text-gray-500 text-sm" />
            <h3 className="font-medium text-gray-900">文法項目</h3>
          </div>
          <div className="space-y-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => handleCategoryToggle(category.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 text-left ${
                  selectedCategories.includes(category.id)
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                                 <span className="text-gray-600">{category.icon}</span>
                <span className="text-sm font-medium">{category.name}</span>
                {selectedCategories.includes(category.id) && (
                  <FaTimes className="ml-auto text-blue-600 text-xs" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 学年レベル */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FaGraduationCap className="text-gray-500 text-sm" />
            <h3 className="font-medium text-gray-900">学年レベル</h3>
          </div>
          <div className="space-y-2">
            {levels.map(level => (
              <button
                key={level.id}
                onClick={() => handleLevelToggle(level.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 text-left ${
                  selectedLevels.includes(level.id)
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${level.color}`}>
                  {level.name}
                </span>
                {selectedLevels.includes(level.id) && (
                  <FaTimes className="ml-auto text-blue-600 text-xs" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 並び替え */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FaSort className="text-gray-500 text-sm" />
            <h3 className="font-medium text-gray-900">並び替え</h3>
          </div>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          >
            {sortOptions.map(option => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>

        {/* アクティブフィルター表示 */}
        {(selectedCategories.length > 0 || selectedLevels.length > 0) && (
          <div className="pt-4 border-t border-gray-100">
            <div className="text-xs text-gray-500 mb-3">アクティブフィルター</div>
            <div className="flex flex-wrap gap-2">
              {selectedCategories.map(categoryId => {
                const category = categories.find(c => c.id === categoryId);
                return (
                                     <span
                     key={categoryId}
                     className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                   >
                     <span className="text-gray-600">{category?.icon}</span> {category?.name}
                    <button
                      onClick={() => handleCategoryToggle(categoryId)}
                      className="ml-1 hover:text-blue-800"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  </span>
                );
              })}
              {selectedLevels.map(levelId => {
                const level = levels.find(l => l.id === levelId);
                return (
                  <span
                    key={levelId}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs"
                  >
                    {level?.name}
                    <button
                      onClick={() => handleLevelToggle(levelId)}
                      className="ml-1 hover:text-green-800"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 