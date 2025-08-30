'use client';

import { Suspense, useState } from 'react';
import MaterialsList from './materials/_components/MaterialsList';
import LoadingSpinner from '@/components/common/atoms/LoadingSpinner';
import MaterialsFilter from '@/components/features/materials/MaterialsFilter';
import MaterialsSearch from '@/components/features/materials/MaterialsSearch';
import { FaFilter, FaChevronDown, FaChevronUp } from 'react-icons/fa';

export default function HomePage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          {/* スマホ用タイトル */}
          <h1 className="text-xl font-bold text-gray-900 lg:hidden mb-4">
            中学英文法教材一覧
          </h1>
          
          {/* デスクトップ用タイトル */}
          <div className="hidden lg:flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">中学英文法教材一覧</h1>
            <MaterialsSearch />
          </div>
          
          {/* スマホ用検索バー */}
          <div className="lg:hidden">
            <MaterialsSearch />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* モバイル用フィルタートグルボタン */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="w-full flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <span className="flex items-center text-gray-700 font-medium">
              <FaFilter className="mr-2 text-blue-600" />
              フィルター
            </span>
            {isFilterOpen ? (
              <FaChevronUp className="text-gray-500" />
            ) : (
              <FaChevronDown className="text-gray-500" />
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
          {/* フィルターサイドバー */}
          <aside className={`lg:col-span-1 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
            <MaterialsFilter />
          </aside>

          {/* 教材リスト */}
          <main className="lg:col-span-5">
            <Suspense fallback={<LoadingSpinner />}>
              <MaterialsList />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
} 