import React, { useState } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';

export default function MaterialsSearch() {
  const [searchTerm, setSearchTerm] = useState('');

  const handleClear = () => {
    setSearchTerm('');
  };

  return (
    <div className="relative w-full group">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="教材を検索..."
          className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white shadow-sm hover:shadow-md transition-all duration-200 placeholder-gray-400"
        />
        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
        
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <FaTimes className="text-sm" />
          </button>
        )}
      </div>
      
      {/* 検索候補 */}
      {searchTerm && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-10">
          <div className="p-4">
            <div className="text-sm text-gray-500 mb-2">検索候補</div>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                <FaSearch className="text-gray-400 text-xs" />
                <span className="text-sm">"{searchTerm}" を含む教材</span>
              </div>
              <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                <FaSearch className="text-gray-400 text-xs" />
                <span className="text-sm">"{searchTerm}" のタグ</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 