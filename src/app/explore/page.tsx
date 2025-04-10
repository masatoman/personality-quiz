import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { StarIcon, AdjustmentsHorizontalIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

// APIからの教材データ取得（サーバーコンポーネント）
async function getMaterials() {
  // 実際のアプリではAPIエンドポイントを呼び出す
  // 例: const res = await fetch(`${process.env.API_URL}/api/materials`);
  
  // 仮のデータを返す
  return [
    {
      id: '1',
      title: '英語初心者のための基礎文法',
      description: '英語の基本文法を初心者にもわかりやすく解説した教材です。',
      coverImage: '/images/placeholder.jpg',
      status: 'published',
      viewCount: 245,
      rating: 4.5,
      reviewCount: 12,
      authorName: 'Tanaka Yuki',
      difficulty: 'beginner',
      estimatedTime: 30,
      tags: ['初級', '文法', 'TOEIC'],
      createdAt: '2023-12-15T12:00:00Z',
    },
    {
      id: '2',
      title: '実践ビジネス英語：メール作成テクニック',
      description: 'ビジネスシーンで使える英語メールの書き方を例文付きで解説します。',
      coverImage: '/images/placeholder2.jpg',
      status: 'published',
      viewCount: 123,
      rating: 4.2,
      reviewCount: 8,
      authorName: 'Suzuki Takeshi',
      difficulty: 'intermediate',
      estimatedTime: 45,
      tags: ['ビジネス', 'メール', '中級'],
      createdAt: '2023-12-10T09:15:00Z',
    },
    {
      id: '3',
      title: 'TOEICリスニング対策クイズ',
      description: 'TOEIC頻出のリスニング問題を集めたクイズ形式の教材です。',
      coverImage: '/images/placeholder3.jpg',
      status: 'published',
      viewCount: 310,
      rating: 4.7,
      reviewCount: 15,
      authorName: 'Satou Akiko',
      difficulty: 'intermediate',
      estimatedTime: 60,
      tags: ['TOEIC', 'リスニング', 'テスト対策'],
      createdAt: '2023-11-28T14:30:00Z',
    },
    {
      id: '4',
      title: '日常英会話フレーズ集',
      description: '旅行や日常生活で使える実用的な英会話フレーズを学びましょう。',
      coverImage: '/images/placeholder4.jpg',
      status: 'published',
      viewCount: 198,
      rating: 4.0,
      reviewCount: 9,
      authorName: 'Yamada Kenji',
      difficulty: 'beginner',
      estimatedTime: 25,
      tags: ['会話', '旅行', '初級'],
      createdAt: '2023-12-05T08:45:00Z',
    },
    {
      id: '5',
      title: '英語プレゼンテーションの極意',
      description: '説得力のある英語プレゼンテーションのテクニックを身につける教材です。',
      coverImage: '/images/placeholder5.jpg',
      status: 'published',
      viewCount: 87,
      rating: 4.8,
      reviewCount: 6,
      authorName: 'Nakamura Hana',
      difficulty: 'advanced',
      estimatedTime: 90,
      tags: ['ビジネス', 'プレゼン', '上級'],
      createdAt: '2023-12-12T16:20:00Z',
    },
    {
      id: '6',
      title: '英語の冠詞マスター講座',
      description: '英語の冠詞（a, an, the）の使い方をマスターするための詳細な解説と練習問題。',
      coverImage: '/images/placeholder6.jpg',
      status: 'published',
      viewCount: 152,
      rating: 4.4,
      reviewCount: 11,
      authorName: 'Kobayashi Ryo',
      difficulty: 'intermediate',
      estimatedTime: 40,
      tags: ['文法', '中級', '冠詞'],
      createdAt: '2023-11-30T11:10:00Z',
    },
  ];
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

export default async function ExplorePage() {
  const materials = await getMaterials();
  
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
                <option value="time-asc">学習時間の短い順</option>
                <option value="time-desc">学習時間の長い順</option>
              </select>
            </div>
          </div>
          
          {/* 教材カード */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((material) => (
              <Link
                key={material.id}
                href={`/materials/${material.id}`}
                className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition duration-200"
              >
                <div className="relative w-full h-40 bg-gray-200">
                  {material.coverImage && (
                    <Image
                      src={material.coverImage}
                      alt={material.title}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      material.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                      material.difficulty === 'intermediate' ? 'bg-blue-100 text-blue-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {getDifficultyInJapanese(material.difficulty)}
                    </span>
                    <span className="text-xs text-gray-500">{material.estimatedTime}分</span>
                  </div>
                  
                  <h3 className="font-bold mb-2 line-clamp-2">{material.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{material.description}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {material.tags.map((tag, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <StarIcon className="w-4 h-4 text-yellow-400" />
                      <span className="ml-1 text-sm">{material.rating.toFixed(1)}</span>
                      <span className="ml-1 text-xs text-gray-500">({material.reviewCount})</span>
                    </div>
                    <span className="text-xs text-gray-500">閲覧数: {material.viewCount}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {/* ページネーション */}
          <div className="mt-10 flex justify-center">
            <nav className="inline-flex rounded-md shadow-sm">
              <a
                href="#"
                className="px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-l-md"
              >
                前へ
              </a>
              {[1, 2, 3, 4, 5].map((page) => (
                <a
                  key={page}
                  href="#"
                  className={`px-4 py-2 border-t border-b border-r border-gray-300 text-sm font-medium ${
                    page === 1
                      ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </a>
              ))}
              <a
                href="#"
                className="px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-r-md"
              >
                次へ
              </a>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
} 