'use client';

import { Suspense, useState } from 'react';
import MaterialsList from './materials/_components/MaterialsList';
import LoadingSpinner from '@/components/common/atoms/LoadingSpinner';
import MaterialsFilter from '@/components/features/materials/MaterialsFilter';
import MaterialsSearch from '@/components/features/materials/MaterialsSearch';
import { FaFilter, FaChevronDown, FaChevronUp, FaBookOpen, FaUsers, FaRocket } from 'react-icons/fa';

export default function HomePage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヒーローセクション */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          {/* ページタイトルと説明 */}
          <div className="text-center lg:text-left mb-6">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FaBookOpen className="text-blue-600 text-xl" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                中学英文法教材一覧
              </h1>
            </div>
            <p className="text-gray-600 text-sm lg:text-base max-w-2xl mx-auto lg:mx-0">
              学習中の発見やコツを共有して、みんなで成長しましょう
            </p>
          </div>
          
          {/* 検索バー */}
          <div className="max-w-2xl mx-auto lg:mx-0">
            <MaterialsSearch />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* モバイル用フィルタートグルボタン */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="w-full flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
          >
            <span className="flex items-center text-gray-700 font-medium">
              <FaFilter className="mr-3 text-blue-600" />
              フィルター
            </span>
            {isFilterOpen ? (
              <FaChevronUp className="text-gray-500" />
            ) : (
              <FaChevronDown className="text-gray-500" />
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
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