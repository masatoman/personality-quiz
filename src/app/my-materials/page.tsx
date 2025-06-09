'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PlusIcon, PencilIcon, EyeIcon, TrashIcon } from '@heroicons/react/24/outline';
import { getClient } from '@/lib/supabase/client';

// 教材の型定義
interface Material {
  id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  status: 'published' | 'draft';
  view_count: number;
  rating: number;
  created_at: string;
  updated_at: string;
}

export default function MyMaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'draft'>('all');
  
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        const supabase = getClient();
        
        // ユーザー情報を取得
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          setError('ユーザー情報の取得に失敗しました。ログインしてください。');
          setLoading(false);
          return;
        }
        
        // ユーザーIDに基づいて教材を取得 (user_idを使用)
        let query = supabase
          .from('materials')
          .select('*')
          .eq('user_id', user.id);
        
        // タブに応じてフィルタリング
        if (activeTab === 'published') {
          query = query.eq('status', 'published');
        } else if (activeTab === 'draft') {
          query = query.eq('status', 'draft');
        }
        
        const { data, error: materialsError } = await query;
        
        if (materialsError) {
          console.error('教材取得エラー:', materialsError);
          setError('教材の取得に失敗しました。');
        } else {
          setMaterials(data || []);
        }
      } catch (err) {
        console.error('マイ教材取得エラー:', err);
        setError('教材の取得中にエラーが発生しました。');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMaterials();
  }, [activeTab]);
  
  // タブ切り替え
  const handleTabChange = (tab: 'all' | 'published' | 'draft') => {
    setActiveTab(tab);
  };
  
  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">マイ教材</h1>
          <p className="text-gray-600 text-sm">あなたが作成した教材の管理と統計を確認できます</p>
        </div>
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
          <button 
            className={`px-6 py-3 font-medium ${activeTab === 'all' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={() => handleTabChange('all')}
          >
            すべて ({materials.length})
          </button>
          <button 
            className={`px-6 py-3 font-medium ${activeTab === 'published' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={() => handleTabChange('published')}
          >
            公開済み ({materials.filter(m => m.status === 'published').length})
          </button>
          <button 
            className={`px-6 py-3 font-medium ${activeTab === 'draft' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={() => handleTabChange('draft')}
          >
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
        
        {loading ? (
          <div className="p-10 text-center">
            <p className="text-gray-500">読み込み中...</p>
          </div>
        ) : error ? (
          <div className="p-10 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <>
            {materials.length > 0 ? (
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
                              {material.thumbnail_url ? (
                                <div className="relative h-full w-full">
                                  <Image
                                    src={material.thumbnail_url}
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
                          {material.view_count?.toLocaleString() || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {material.rating > 0 ? (
                            <div className="flex items-center">
                              <span className="text-yellow-500 mr-1">★</span>
                              <span>{material.rating?.toFixed(1) || '未評価'}</span>
                            </div>
                          ) : (
                            '未評価'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {material.updated_at ? new Date(material.updated_at).toLocaleDateString('ja-JP') : ''}
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
            ) : (
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
          </>
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