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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">中学英文法教材一覧</h1>
        <MaterialsSearch />
      </div>

      {/* モバイル用フィルタートグルボタン */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="w-full flex items-center justify-between bg-white p-3 rounded-lg shadow border"
        >
          <span className="flex items-center">
            <FaFilter className="mr-2" />
            フィルター
          </span>
          {isFilterOpen ? <FaChevronUp /> : <FaChevronDown />}
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
  );
} 