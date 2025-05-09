/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */

import { Material, Difficulty } from '@/types/material';
import { createClient } from '@/lib/supabase/server';

// 教材データを取得する関数
export const getMaterial = async (id: string): Promise<Material | null> => {
  try {
    const supabase = createClient();
    
    // DBから教材を取得
    const { data, error } = await supabase
      .from('materials')
      .select(`
        *,
        author:profiles!materials_author_id_fkey(
          id,
          username,
          display_name,
          avatar_url
        ),
        material_sections(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('教材取得エラー:', error);
      return null;
    }
    
    if (!data) return null;
    
    // DBデータをフロントエンド用の形式に変換
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      difficulty: data.difficulty as Difficulty,
      estimatedTime: data.estimated_time,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      author: {
        id: data.author.id,
        name: data.author.display_name || data.author.username,
        avatarUrl: data.author.avatar_url,
        expertise: data.author.expertise || []
      },
      targetAudience: data.target_audience || [],
      language: data.language || 'ja',
      version: data.version || '1.0.0',
      sections: data.material_sections.map((section: any) => ({
        id: section.id,
        type: section.type,
        title: section.title,
        content: section.content,
        format: section.format || 'markdown'
      })),
      reviews: [],
      relatedMaterials: [],
      tags: data.tags || []
    };
  } catch (err) {
    console.error('教材取得エラー:', err);
    return null;
  }
};

// 教材の一覧を取得する関数
export async function getMaterials(options?: {
  category?: string;
  difficulty?: Difficulty;
  sort?: string;
  page?: number;
  limit?: number;
  userId?: string; // ユーザーIDでフィルタリング
}): Promise<Material[]> {
  try {
    const supabase = createClient();
    let query = supabase
      .from('materials')
      .select(`
        *,
        author:profiles!materials_author_id_fkey(
          id,
          username,
          display_name,
          avatar_url
        )
      `);
    
    // フィルタリング条件を適用
    if (options?.category) {
      query = query.eq('category', options.category);
    }
    
    if (options?.difficulty) {
      query = query.eq('difficulty', options.difficulty);
    }
    
    if (options?.userId) {
      query = query.eq('author_id', options.userId);
    }
    
    // ソート条件を適用
    if (options?.sort) {
      switch (options.sort) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'popular':
          query = query.order('view_count', { ascending: false });
          break;
        case 'rating':
          query = query.order('rating', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }
    } else {
      // デフォルトは最新順
      query = query.order('created_at', { ascending: false });
    }
    
    // ページネーション
    if (options?.page && options?.limit) {
      const start = (options.page - 1) * options.limit;
      query = query.range(start, start + options.limit - 1);
    } else if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('教材一覧取得エラー:', error);
      return [];
    }
    
    // DBデータをフロントエンド用の形式に変換
    return (data || []).map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      difficulty: item.difficulty as Difficulty,
      estimatedTime: item.estimated_time,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      author: {
        id: item.author.id,
        name: item.author.display_name || item.author.username,
        avatarUrl: item.author.avatar_url,
        expertise: item.author.expertise || []
      },
      targetAudience: item.target_audience || [],
      language: item.language || 'ja',
      version: item.version || '1.0.0',
      sections: [],
      reviews: [],
      relatedMaterials: [],
      tags: item.tags || []
    }));
  } catch (err) {
    console.error('教材一覧取得エラー:', err);
    return [];
  }
} 