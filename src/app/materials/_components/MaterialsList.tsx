'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Material } from '@/types/material';
import { FaStar, FaRegStar, FaUser, FaEye, FaClock, FaArrowRight } from 'react-icons/fa';

export default function MaterialsList() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            name: '匿名ユーザー', // API側で作者情報を含めるよう後で修正
            avatarUrl: '/avatars/default.png',
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

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '初級';
      case 'intermediate': return '中級';
      case 'advanced': return '上級';
      default: return difficulty;
    }
  };

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
            
            {/* 説明文 */}
            {material.description && (
              <p className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed">
                {material.description}
              </p>
            )}
            
            {/* カテゴリと難易度 */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                {material.category}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                material.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                material.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {getDifficultyText(material.difficulty)}
              </span>
            </div>

            {/* タグ */}
            {material.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {material.tags.slice(0, 3).map((tag, index) => (
                  <span 
                    key={index} 
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full whitespace-nowrap flex-shrink-0"
                  >
                    #{tag}
                  </span>
                ))}
                {material.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                    +{material.tags.length - 3}
                  </span>
                )}
              </div>
            )}
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