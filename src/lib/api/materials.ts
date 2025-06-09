/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */

import { Material, Difficulty } from '@/types/material';
import { createClient } from '@/lib/supabase/server';

// difficulty_levelをDifficultyに変換するヘルパー関数
const convertDifficultyLevelToDifficulty = (difficulty_level: number): Difficulty => {
  switch (difficulty_level) {
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

// 教材データを取得する関数
export const getMaterial = async (id: string): Promise<Material | null> => {
  try {
    const supabase = createClient();
    
    // DBから教材を取得（material_sectionsテーブルが存在しない可能性があるため条件分岐）
    let query = supabase
      .from('materials')
      .select('*')
      .eq('id', id)
      .single();
    
    const { data, error } = await query;
    
    if (error) {
      console.error('教材取得エラー:', error);
      return null;
    }
    
    if (!data) return null;
    
    // 作者情報を別途取得（user_idから）
    const authorId = data.user_id;
    let authorData = null;
    
    if (authorId) {
      const { data: authorResponse, error: authorError } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .eq('id', authorId)
        .single();
      
      if (authorError) {
        console.error('作者情報取得エラー:', authorError);
      } else {
        authorData = authorResponse;
      }
    }
    
    // contentフィールドからsectionsを解析（JSONとして保存されている場合）
    let sections = [];
    if (data.content) {
      try {
        const contentObj = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
        if (contentObj.sections && Array.isArray(contentObj.sections)) {
          sections = contentObj.sections.map((section: any, index: number) => ({
            id: `section_${index}`,
            type: 'text' as const,
            title: section.title || `セクション ${index + 1}`,
            content: section.content || '',
            format: 'html' as const
          }));
        }
      } catch (e) {
        console.error('コンテンツ解析エラー:', e);
        // フォールバック: プレーンテキストとして扱う
        sections = [{
          id: 'section_1',
          type: 'text' as const,
          title: '教材内容',
          content: data.content,
          format: 'html' as const
        }];
      }
    }
    
    // DBデータをフロントエンド用の形式に変換
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      difficulty: convertDifficultyLevelToDifficulty(data.difficulty_level),
      estimatedTime: data.estimated_time || 0,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      author: authorData ? {
        id: authorData.id,
        name: authorData.display_name || authorData.username,
        avatarUrl: authorData.avatar_url,
        expertise: []
      } : {
        id: authorId || 'unknown',
        name: '不明',
        avatarUrl: null,
        expertise: []
      },
      targetAudience: data.target_audience || [],
      language: data.language || 'ja',
      version: data.version || '1.0.0',
      sections: sections,
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
      .select('*');
    
    // フィルタリング条件を適用
    if (options?.category) {
      query = query.eq('category', options.category);
    }
    
    // difficultyフィルタリングはdifficulty_levelを使用
    if (options?.difficulty) {
      let levelRange: number[] = [];
      switch (options.difficulty) {
        case 'beginner':
          levelRange = [1, 2];
          break;
        case 'intermediate':
          levelRange = [3];
          break;
        case 'advanced':
          levelRange = [4, 5];
          break;
      }
      if (levelRange.length > 0) {
        query = query.in('difficulty_level', levelRange);
      }
    }
    
    if (options?.userId) {
      // user_idでフィルタリング
      query = query.eq('user_id', options.userId);
    }
    
    // published状態のもののみ取得
    query = query.eq('is_published', true);
    
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
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // 一意の作者IDを取得（user_idから）
    const authorIds = [...new Set(data.map(item => item.user_id).filter(Boolean))];
    
    // 作者情報を一括取得
    let authorsMap = new Map();
    if (authorIds.length > 0) {
      const { data: authorsData, error: authorsError } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .in('id', authorIds);
      
      if (authorsError) {
        console.error('作者情報取得エラー:', authorsError);
      } else if (authorsData) {
        authorsData.forEach(author => {
          authorsMap.set(author.id, author);
        });
      }
    }
    
    // DBデータをフロントエンド用の形式に変換
    return data.map(item => {
      const authorId = item.user_id;
      const authorData = authorsMap.get(authorId);
      
      return {
        id: item.id,
        title: item.title,
        description: item.description,
        difficulty: convertDifficultyLevelToDifficulty(item.difficulty_level),
        estimatedTime: item.estimated_time || 0,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        author: authorData ? {
          id: authorData.id,
          name: authorData.display_name || authorData.username,
          avatarUrl: authorData.avatar_url,
          expertise: []
        } : {
          id: authorId || 'unknown',
          name: '不明',
          avatarUrl: null,
          expertise: []
        },
        targetAudience: item.target_audience || [],
        language: item.language || 'ja',
        version: item.version || '1.0.0',
        sections: [],
        reviews: [],
        relatedMaterials: [],
        tags: item.tags || []
      };
    });
  } catch (err) {
    console.error('教材一覧取得エラー:', err);
    return [];
  }
} 