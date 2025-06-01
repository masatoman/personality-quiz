'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Material } from '@/types/material';

export default function MaterialsList() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError(null);

      // 修正: 外部キー参照を使わずに基本データのみ取得
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        setError('教材の取得に失敗しました');
        return;
      }

      if (!data || data.length === 0) {
        setMaterials([]);
        return;
      }

      // 一意の作者IDを取得（author_idとuser_idの両方から）
      const authorIds = [...new Set(data.map(item => item.author_id || item.user_id).filter(Boolean))];
      
      // 作者情報を一括取得
      let authorsMap = new Map();
      if (authorIds.length > 0) {
        const { data: authorsData, error: authorsError } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .in('id', authorIds);
        
        if (!authorsError && authorsData) {
          authorsData.forEach(author => {
            authorsMap.set(author.id, author);
          });
        }
      }

      // データを Material 型に変換
      const transformedMaterials: Material[] = data.map((item: any) => {
        const authorId = item.author_id || item.user_id;
        const authorData = authorsMap.get(authorId);
        
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
            id: authorId || 'unknown',
            name: authorData ? (authorData.display_name || authorData.username) : '匿名ユーザー',
            avatarUrl: authorData?.avatar_url || '/avatars/default.png',
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

      setMaterials(transformedMaterials);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('データの取得中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyLabel = (level: number): 'beginner' | 'intermediate' | 'advanced' => {
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
  };

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {materials.map((material) => (
        <Link
          key={material.id}
          href={`/materials/${material.id}`}
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-500"
        >
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">{material.title}</h3>
            <div className="flex items-center text-yellow-500 text-sm ml-2">
              <span>⭐</span>
              <span className="ml-1">{material.rating}</span>
            </div>
          </div>
          <p className="text-gray-600 mb-4 line-clamp-2">{material.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {material.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                {tag}
              </span>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {material.category}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              material.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
              material.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {getDifficultyText(material.difficulty)}
            </span>
          </div>

          <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
            <div className="flex items-center">
              <span className="mr-1">👁️</span>
              <span>{material.view_count} 閲覧</span>
            </div>
            <div className="flex items-center">
              <span className="mr-1">⏱️</span>
              <span>{material.estimatedTime}分</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
} 