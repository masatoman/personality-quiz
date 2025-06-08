import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Material } from '@/types/material';
import { supabase } from '@/lib/supabase';

export default function MaterialsList() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('materials')
          .select(`
            *,
            author:profiles(id, display_name, avatar_url, bio),
            reviews:material_reviews(rating),
            tags:material_tags(name)
          `)
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        // データ形式を変換
        const formattedMaterials: Material[] = data?.map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          category: item.category,
          difficulty: item.difficulty,
          estimatedTime: item.estimated_time,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          author: {
            id: item.author?.id || 'unknown',
            name: item.author?.display_name || '匿名ユーザー',
            avatarUrl: item.author?.avatar_url || '/avatars/default.png',
            bio: item.author?.bio || '',
            expertise: []
          },
          targetAudience: item.target_audience || [],
          language: item.language || 'ja',
          version: item.version || '1.0',
          sections: [],
          reviews: item.reviews || [],
          relatedMaterials: [],
          tags: item.tags?.map((tag: any) => tag.name) || [],
          status: item.status,
          view_count: item.view_count || 0,
          rating: item.reviews?.length > 0 
            ? item.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / item.reviews.length 
            : 0
        })) || [];

        setMaterials(formattedMaterials);
      } catch (error) {
        console.error('教材データの取得に失敗しました:', error);
        setError('教材データの取得に失敗しました。しばらく後にもう一度お試しください。');
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">教材を読み込み中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-700 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-gray-600 mb-4">まだ教材が投稿されていません。</p>
          <Link 
            href="/create/standard/1"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            最初の教材を作成する
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {materials.map((material) => (
        <Link
          key={material.id}
          href={`/materials/study/${material.id}`}
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">{material.title}</h2>
          <p className="text-gray-600 mb-4 line-clamp-3">{material.description}</p>
          
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="px-3 py-1 bg-gray-100 rounded-full">{material.category}</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
              {material.difficulty}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>作成者: {material.author.name}</span>
            <div className="flex items-center">
              <span className="mr-2">★ {material.rating.toFixed(1)}</span>
              <span>{material.view_count} views</span>
            </div>
          </div>
          
          {material.tags.length > 0 && (
            <div className="mt-3">
              <div className="flex flex-wrap gap-1">
                {material.tags.slice(0, 3).map((tag, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
                {material.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                    +{material.tags.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}
        </Link>
      ))}
    </div>
  );
} 