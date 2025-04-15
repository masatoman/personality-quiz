import React from 'react';
import { FaSearch } from 'react-icons/fa';

export default function MaterialsSearch() {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder="教材を検索..."
        className="w-64 pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
    </div>
  );
} 