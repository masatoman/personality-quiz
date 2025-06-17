'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { StarIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabase/client';

// 教材データの型定義
interface Material {
  id: string;
  title: string;
  description: string;
  content: any; // JSONBコンテンツフィールド
  category: string;
  difficulty_level: number;
  estimated_time: number;
  tags: string[];
  is_published: boolean;
  created_at: string;
  user_id: string;
}

interface DisplayMaterial {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  status: string;
  viewCount: number;
  rating: number;
  reviewCount: number;
  authorName: string;
  difficulty: string;
  estimatedTime: number;
  tags: string[];
  createdAt: string;
}

// 難易度を日本語で表示する関数
function getDifficultyInJapanese(difficulty: string) {
  switch (difficulty) {
    case 'beginner': return '初級';
    case 'intermediate': return '中級';
    case 'advanced': return '上級';
    default: return '初級';
  }
}

// モバイル用フィルターコンポーネント
function MobileFilterContent() {
  const categories = [
    { id: 'all', name: 'すべて' },
    { id: 'grammar', name: '文法' },
    { id: 'listening', name: 'リスニング' },
    { id: 'speaking', name: 'スピーキング' },
    { id: 'reading', name: 'リーディング' },
    { id: 'writing', name: 'ライティング' },
    { id: 'vocabulary', name: '語彙' },
    { id: 'business', name: 'ビジネス英語' },
    { id: 'test', name: '試験対策' },
  ];

  return (
    <>
      {/* 検索 */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="キーワードで検索"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>
      </div>
      
      {/* カテゴリー */}
      <div className="mb-6">
        <h3 className="font-medium mb-2">カテゴリー</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center">
              <input
                type="checkbox"
                id={`mobile-category-${category.id}`}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                defaultChecked={category.id === 'all'}
              />
              <label htmlFor={`mobile-category-${category.id}`} className="text-sm text-gray-700">
                {category.name}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      {/* 難易度 */}
      <div className="mb-6">
        <h3 className="font-medium mb-2">難易度</h3>
        <div className="space-y-2">
          {['beginner', 'intermediate', 'advanced'].map((level) => (
            <div key={level} className="flex items-center">
              <input
                type="checkbox"
                id={`mobile-level-${level}`}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor={`mobile-level-${level}`} className="text-sm text-gray-700">
                {getDifficultyInJapanese(level)}
              </label>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ヘルパー関数を追加
function formatContentForDisplay(content: any): string {
  try {
    // contentがstringの場合、JSONパースを試行
    if (typeof content === 'string') {
      try {
        content = JSON.parse(content);
      } catch {
        // JSONでない場合はそのまま返す
        return content.substring(0, 120) + (content.length > 120 ? '...' : '');
      }
    }

    // クイズ形式の場合
    if (content.type === 'quiz' && content.questions) {
      const firstQuestion = content.questions[0];
      if (firstQuestion) {
        return `クイズ: ${firstQuestion.question}`;
      }
      return 'クイズ形式の教材です';
    }

    // セクション形式の場合
    if (content.sections && Array.isArray(content.sections)) {
      const firstSection = content.sections[0];
      if (firstSection && firstSection.content) {
        return firstSection.content.substring(0, 120) + (firstSection.content.length > 120 ? '...' : '');
      }
    }

    // 直接コンテンツがある場合
    if (content.content) {
      return content.content.substring(0, 120) + (content.content.length > 120 ? '...' : '');
    }

    // introductionフィールドがある場合
    if (content.introduction) {
      return content.introduction.substring(0, 120) + (content.introduction.length > 120 ? '...' : '');
    }

    // その他の場合
    return 'このコンテンツの詳細は教材ページでご確認ください';
  } catch (error) {
    console.error('コンテンツフォーマットエラー:', error);
    return '教材の詳細情報を読み込み中...';
  }
}

export default function ExploreClient() {
  const [materials, setMaterials] = useState<DisplayMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  useEffect(() => {
    async function fetchMaterials() {
      try {
        console.log('クライアント: 教材データ取得開始');
        const { data, error } = await supabase
          .from('materials')
          .select('*')
          .eq('is_published', true)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        console.log('サーバー: 取得した教材数:', data?.length || 0);
        console.log('サーバー: 教材サンプル:', data?.[0]);

        const displayMaterials = data?.map(material => ({
          id: material.id,
          title: material.title,
          description: formatContentForDisplay(material.content), // contentフィールドを適切にフォーマット
          coverImage: material.thumbnail_url || '/images/placeholder.jpg',
          status: material.is_published ? 'published' : 'draft',
          viewCount: material.view_count || 0,
          rating: material.rating || 0,
          reviewCount: 5,
          authorName: '匿名ユーザー',
          difficulty: material.difficulty_level <= 2 ? 'beginner' : 
                     material.difficulty_level <= 4 ? 'intermediate' : 'advanced',
          estimatedTime: material.estimated_time || 30,
          tags: material.tags || [],
          createdAt: material.created_at,
        })) || [];
        
        console.log('クライアント: 変換後の教材数:', displayMaterials.length);
        setMaterials(displayMaterials);
      } catch (err) {
        console.error('クライアント: 教材取得エラー:', err);
        setError(err instanceof Error ? err.message : '教材の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    }

    fetchMaterials();
  }, []);

  // カテゴリー一覧
  const categories = [
    { id: 'all', name: 'すべて' },
    { id: 'grammar', name: '文法' },
    { id: 'listening', name: 'リスニング' },
    { id: 'speaking', name: 'スピーキング' },
    { id: 'reading', name: 'リーディング' },
    { id: 'writing', name: 'ライティング' },
    { id: 'vocabulary', name: '語彙' },
    { id: 'business', name: 'ビジネス英語' },
    { id: 'test', name: '試験対策' },
  ];

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8">教材を探す</h1>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">教材を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8">教材を探す</h1>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">エラーが発生しました: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* モバイル用ヘッダー */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">教材を探す</h1>
        
        {/* モバイル用フィルタートグル */}
        <button 
          className="lg:hidden bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          onClick={() => setShowMobileFilter(!showMobileFilter)}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707v6.585a1 1 0 01-1.553.894l-4-2.5A1 1 0 019 17.414V12.586a1 1 0 00-.293-.707L2.293 5.293A1 1 0 012 4.586V4z" />
          </svg>
          フィルター
        </button>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* モバイル用フィルターオーバーレイ */}
        {showMobileFilter && (
          <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowMobileFilter(false)}>
            <div className="bg-white w-80 h-full p-4 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">フィルター</h2>
                <button 
                  onClick={() => setShowMobileFilter(false)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              {/* フィルター内容はデスクトップと同じ */}
              <MobileFilterContent />
            </div>
          </div>
        )}
        
        {/* デスクトップ用サイドバー（フィルター） */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">フィルター</h2>
              <button className="text-blue-500 text-sm hover:underline">リセット</button>
            </div>
            
            {/* 検索 */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="キーワードで検索"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
            </div>
            
            {/* カテゴリー */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">カテゴリー</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`category-${category.id}`}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      defaultChecked={category.id === 'all'}
                    />
                    <label htmlFor={`category-${category.id}`} className="text-sm text-gray-700">
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* 難易度 */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">難易度</h3>
              <div className="space-y-2">
                {['beginner', 'intermediate', 'advanced'].map((level) => (
                  <div key={level} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`level-${level}`}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`level-${level}`} className="text-sm text-gray-700">
                      {getDifficultyInJapanese(level)}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* 学習時間 */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">学習時間</h3>
              <div className="space-y-2">
                {['30分以内', '30-60分', '1-2時間', '2時間以上'].map((time) => (
                  <div key={time} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`time-${time}`}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`time-${time}`} className="text-sm text-gray-700">
                      {time}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* 評価 */}
            <div>
              <h3 className="font-medium mb-2">評価</h3>
              <div className="space-y-2">
                {[4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`rating-${rating}`}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`rating-${rating}`} className="text-sm text-gray-700 flex items-center">
                      <span>{rating}</span>
                      <StarIcon className="w-4 h-4 text-yellow-400 ml-1" />
                      <span className="text-gray-500">以上</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* メインコンテンツ（教材リスト） */}
        <div className="flex-1 min-w-0">
          {/* 並べ替えオプション - モバイル最適化 */}
          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
              <div className="text-sm text-gray-500">
                <span className="font-medium text-gray-900">{materials.length}</span> 件の教材が見つかりました
              </div>
              <div className="flex items-center w-full sm:w-auto">
                <label htmlFor="sort-order" className="text-sm text-gray-700 mr-2 whitespace-nowrap">
                  並べ替え:
                </label>
                <select
                  id="sort-order"
                  className="flex-1 sm:flex-none border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="popular">人気順</option>
                  <option value="newest">新着順</option>
                  <option value="rating">評価順</option>
                  <option value="time-short">学習時間の短い順</option>
                  <option value="time-long">学習時間の長い順</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* 教材グリッド - モバイル最適化 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {materials.map((material) => (
              <Link
                key={material.id}
                href={`/materials/${material.id}`}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
              >
                <div className="relative">
                  <Image
                    src={material.coverImage}
                    alt={material.title}
                    width={400}
                    height={200}
                    className="w-full h-40 sm:h-48 object-cover"
                  />
                  <div className="absolute top-2 left-2 flex flex-col sm:flex-row gap-1 sm:gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      material.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                      material.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {getDifficultyInJapanese(material.difficulty)}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {material.estimatedTime}分
                    </span>
                  </div>
                </div>
                
                <div className="p-3 sm:p-4">
                  <h3 className="font-bold text-base sm:text-lg mb-2 line-clamp-2">{material.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{material.description}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {material.tags.slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {material.tags.length > 2 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded-full">
                        +{material.tags.length - 2}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="font-medium text-gray-900">{material.rating}</span>
                      <span className="ml-1">({material.reviewCount})</span>
                    </div>
                    <span className="text-xs sm:text-sm">閲覧数: {material.viewCount}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {materials.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">教材が見つかりませんでした</p>
              <p className="text-gray-400 text-sm mt-2">検索条件を変更してお試しください</p>
            </div>
          )}
          
          {/* ページネーション */}
          <nav className="flex justify-center mt-8" aria-label="ページネーション">
            <div className="flex space-x-1">
              <a href="#" className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">前へ</a>
              <a href="#" className="px-3 py-2 text-sm bg-blue-600 text-white rounded">1</a>
              <a href="#" className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">2</a>
              <a href="#" className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">3</a>
              <a href="#" className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">4</a>
              <a href="#" className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">5</a>
              <a href="#" className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">次へ</a>
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
} 