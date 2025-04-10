import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PlusIcon, PencilIcon, EyeIcon, TrashIcon } from '@heroicons/react/24/outline';

// 仮のデータ
const materials = [
  {
    id: '1',
    title: '英語初心者のための基礎文法',
    description: '英語の基本文法を初心者にもわかりやすく解説した教材です。',
    coverImage: '/images/placeholder.jpg',
    status: 'published',
    viewCount: 245,
    rating: 4.5,
    createdAt: '2023-12-15T12:00:00Z',
    updatedAt: '2023-12-16T10:30:00Z',
  },
  {
    id: '2',
    title: '実践ビジネス英語：メール作成テクニック',
    description: 'ビジネスシーンで使える英語メールの書き方を例文付きで解説します。',
    coverImage: '/images/placeholder2.jpg',
    status: 'published',
    viewCount: 123,
    rating: 4.2,
    createdAt: '2023-12-10T09:15:00Z',
    updatedAt: '2023-12-12T14:20:00Z',
  },
  {
    id: '3',
    title: 'TOEICリスニング対策クイズ',
    description: 'TOEIC頻出のリスニング問題を集めたクイズ形式の教材です。',
    coverImage: null,
    status: 'draft',
    viewCount: 0,
    rating: 0,
    createdAt: '2023-12-18T16:45:00Z',
    updatedAt: '2023-12-18T16:45:00Z',
  },
];

export default function MyMaterialsPage() {
  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">マイ教材</h1>
        <Link
          href="/create"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-600 transition duration-200"
        >
          <PlusIcon className="w-5 h-5 mr-1" />
          <span>新規作成</span>
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex border-b">
          <button className="px-6 py-3 font-medium text-blue-600 border-b-2 border-blue-500">
            すべて ({materials.length})
          </button>
          <button className="px-6 py-3 font-medium text-gray-600 hover:text-gray-900">
            公開済み ({materials.filter(m => m.status === 'published').length})
          </button>
          <button className="px-6 py-3 font-medium text-gray-600 hover:text-gray-900">
            下書き ({materials.filter(m => m.status === 'draft').length})
          </button>
        </div>
        
        <div className="p-4">
          <div className="flex justify-between mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="教材を検索..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg
                className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            
            <div className="flex space-x-2">
              <select className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="newest">新しい順</option>
                <option value="oldest">古い順</option>
                <option value="popular">人気順</option>
                <option value="rating">評価順</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  教材
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  閲覧数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  評価
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  最終更新日
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  アクション
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {materials.map((material) => (
                <tr key={material.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-12 w-16 flex-shrink-0 bg-gray-200 rounded overflow-hidden mr-4">
                        {material.coverImage ? (
                          <div className="relative h-full w-full">
                            <Image
                              src={material.coverImage}
                              alt={material.title}
                              fill
                              style={{ objectFit: 'cover' }}
                            />
                          </div>
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-400">
                            なし
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 truncate max-w-xs">
                          {material.title}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {material.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        material.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {material.status === 'published' ? '公開中' : '下書き'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {material.viewCount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {material.rating > 0 ? (
                      <div className="flex items-center">
                        <span className="text-yellow-500 mr-1">★</span>
                        <span>{material.rating.toFixed(1)}</span>
                      </div>
                    ) : (
                      '未評価'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(material.updatedAt).toLocaleDateString('ja-JP')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Link
                      href={`/materials/${material.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <EyeIcon className="w-5 h-5 inline" />
                    </Link>
                    <Link
                      href={`/edit/${material.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <PencilIcon className="w-5 h-5 inline" />
                    </Link>
                    <button className="text-red-600 hover:text-red-900">
                      <TrashIcon className="w-5 h-5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {materials.length === 0 && (
          <div className="p-10 text-center">
            <p className="text-gray-500 mb-4">教材がまだありません</p>
            <Link
              href="/create"
              className="text-blue-500 hover:text-blue-700 font-medium"
            >
              教材を作成する
            </Link>
          </div>
        )}
      </div>
      
      <div className="bg-blue-50 p-6 rounded-lg">
        <h2 className="font-bold text-lg mb-2">教材作成のメリット</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="font-medium mb-2">ギバースコア向上</div>
            <p className="text-sm text-gray-600">
              質の高い教材を作成することでギバースコアが上昇します。
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="font-medium mb-2">学習効果の向上</div>
            <p className="text-sm text-gray-600">
              教えることで自分自身の学習効果も高まります。
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="font-medium mb-2">コミュニティ貢献</div>
            <p className="text-sm text-gray-600">
              あなたの知識を共有し、他の学習者の成長を支援します。
            </p>
          </div>
        </div>
        <Link href="/help/creator-benefits" className="text-blue-600 hover:text-blue-800 font-medium">
          教材作成のメリットをもっと見る →
        </Link>
      </div>
    </div>
  );
} 