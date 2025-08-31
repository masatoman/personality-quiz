'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Material } from '@/types/material';
import { FaEye, FaClock, FaArrowRight } from 'react-icons/fa';

export default function MaterialsList() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'text-green-600 bg-green-100';
      case 2: return 'text-blue-600 bg-blue-100';
      case 3: return 'text-yellow-600 bg-yellow-100';
      case 4: return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyLabel = useCallback((level: number): 'beginner' | 'intermediate' | 'advanced' => {
    switch (level) {
      case 1:
      case 2:
        return 'beginner';
      case 3:
        return 'intermediate';
      case 4:
      case 5:
        return 'advanced';
      default:
        return 'beginner';
    }
  }, []);

  const fetchMaterials = useCallback(async () => {
    try {
      console.log('🔍 MaterialsList: fetchMaterials開始');
      setLoading(true);
      setError(null);

      // 修正: バックエンドAPIを使用
      console.log('🔍 MaterialsList: APIリクエスト送信');
      const response = await fetch('/api/materials');
      
      console.log('🔍 MaterialsList: レスポンス受信', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('🔍 MaterialsList: データ解析完了', data);
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.materials || data.materials.length === 0) {
        setMaterials([]);
        return;
      }

      // データを Material 型に変換
      const transformedMaterials: Material[] = data.materials.map((item: any) => {
        return {
          id: item.id,
          title: item.title,
          description: item.description || '説明なし',
          category: item.category,
          difficulty: getDifficultyLabel(item.difficulty_level),
          estimatedTime: item.estimated_time || 30,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          author: {
            id: item.user_id || 'unknown',
            name: item.author?.name || '匿名ユーザー',
            avatarUrl: item.author?.avatar || '/avatars/default.png',
            bio: '',
            expertise: []
          },
          targetAudience: item.target_audience || ['beginner'],
          language: item.language || 'ja',
          version: item.version || '1.0',
          sections: [],
          reviews: [],
          relatedMaterials: [],
          tags: item.tags || [],
          status: 'published',
          view_count: item.view_count || 0,
          rating: item.rating || 0
        };
      });

      console.log('🔍 MaterialsList: データ変換完了', transformedMaterials);
      setMaterials(transformedMaterials);
    } catch (err) {
      console.error('🔍 MaterialsList: Fetch error:', err);
      setError('データの取得中にエラーが発生しました');
    } finally {
      console.log('🔍 MaterialsList: fetchMaterials完了');
      setLoading(false);
    }
  }, [getDifficultyLabel]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="w-8 h-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        <span className="ml-3 text-gray-600">教材を読み込み中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-12">
        <div className="text-red-600 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold mb-2">エラーが発生しました</h3>
          <p className="text-gray-600">{error}</p>
        </div>
        <button 
          onClick={fetchMaterials}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          再試行
        </button>
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div className="text-center p-12">
        <div className="text-gray-500 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h3 className="text-lg font-semibold mb-2">教材がありません</h3>
          <p className="text-gray-600">まだ公開されている教材がありません。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {materials.map((material) => (
        <Link
          key={material.id}
          href={`/materials/${material.id}`}
          className="group block bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden hover:border-blue-200"
        >
          {/* カードヘッダー */}
          <div className="p-6 pb-4">
            {/* タイトルと評価 */}
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-900 line-clamp-2 flex-1 mr-3 group-hover:text-blue-600 transition-colors">
                {material.title}
              </h3>
              {material.rating > 0 && (
                <div className="flex items-center text-yellow-500 text-sm flex-shrink-0">
                  <span className="mr-1">⭐</span>
                  <span className="font-medium">{material.rating}</span>
                </div>
              )}
            </div>
            
            {/* 2. サブ説明 */}
            {material.description && (
              <p className="text-gray-700 mb-4 line-clamp-2 text-sm leading-relaxed">
                {material.description}
              </p>
            )}
            
            {/* 3. タグ - 主要タグのみカラー表示 */}
            <div className="flex flex-wrap gap-2 mb-4">
              {/* 主要タグ（最大2つ）をカラー表示 */}
              {material.tags.slice(0, 2).map((tag, index) => (
                <span 
                  key={index} 
                  className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full whitespace-nowrap flex-shrink-0 font-medium"
                >
                  #{tag}
                </span>
              ))}
              {/* 残りのタグはグレーで+n表示 */}
              {material.tags.length > 2 && (
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                  +{material.tags.length - 2}
                </span>
              )}
            </div>

            {/* 4. 学習人数・時間 - グレー統一 */}
            <div className="flex items-center gap-4 mb-4 text-sm text-gray-700">
              <div className="flex items-center gap-1">
                <FaEye className="text-sm" />
                <span className="font-medium">{material.view_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <FaClock className="text-sm" />
                <span className="font-medium">{material.estimatedTime}分</span>
              </div>
            </div>
          </div>

          {/* カードフッター */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <FaEye className="text-gray-400 text-sm" />
                  <span className="font-medium">{material.view_count}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaClock className="text-gray-400 text-sm" />
                  <span className="font-medium">{material.estimatedTime}分</span>
                </div>
              </div>
              <div className="flex items-center text-blue-600 font-medium text-sm group-hover:text-blue-700 transition-colors">
                詳細を見る
                <FaArrowRight className="ml-1 transform group-hover:translate-x-1 transition-transform text-sm" />
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
} 