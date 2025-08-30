import React from 'react';
import { FaSearch } from 'react-icons/fa';

export default function MaterialsSearch() {
  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder="教材を検索..."
        className="w-full pl-10 pr-4 py-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base bg-white"
      />
      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
    </div>
  );
} 