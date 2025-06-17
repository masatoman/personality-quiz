'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { StarIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

// 教材データの型定義
interface Material {
  id: string;
  title: string;
  description: string;
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

export default function ExploreClient() {
  const [materials, setMaterials] = useState<DisplayMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMaterials() {
      try {
        console.log('クライアント: 教材データ取得開始');
        const response = await fetch('/api/materials');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('クライアント: APIレスポンス:', data);
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        // データを表示用の形式に変換
        const displayMaterials: DisplayMaterial[] = data.materials?.map((material: Material) => ({
          id: material.id,
          title: material.title,
          description: material.description || '説明がありません',
          coverImage: '/images/placeholder.jpg',
          status: material.is_published ? 'published' : 'draft',
          viewCount: Math.floor(Math.random() * 500) + 50,
          rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
          reviewCount: Math.floor(Math.random() * 20) + 1,
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
      <h1 className="text-3xl font-bold mb-8">教材を探す</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* サイドバー（フィルター） */}
        <div className="w-full md:w-64 flex-shrink-0">
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
        <div className="flex-1">
          {/* 並べ替えオプション */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              <span className="font-medium text-gray-900">{materials.length}</span> 件の教材が見つかりました
            </div>
            <div className="flex items-center">
              <label htmlFor="sort-order" className="text-sm text-gray-700 mr-2">
                並べ替え:
              </label>
              <select
                id="sort-order"
                className="border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="popular">人気順</option>
                <option value="newest">新着順</option>
                <option value="rating">評価順</option>
                <option value="time-short">学習時間の短い順</option>
                <option value="time-long">学習時間の長い順</option>
              </select>
            </div>
          </div>
          
          {/* 教材グリッド */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 left-2 flex gap-2">
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
                
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">{material.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{material.description}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {material.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="font-medium text-gray-900">{material.rating}</span>
                      <span className="ml-1">({material.reviewCount})</span>
                    </div>
                    <span>閲覧数: {material.viewCount}</span>
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