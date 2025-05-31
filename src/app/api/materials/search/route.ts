import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 検索パラメータの取得
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
    const author = searchParams.get('author');
    const sortBy = searchParams.get('sort') || 'relevance';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    
    const supabase = createClient();
    
    // ベースクエリ構築
    let queryBuilder = supabase
      .from('materials')
      .select(`
        *,
        author:profiles!materials_author_id_fkey(
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('is_public', true); // 公開教材のみ
    
    // テキスト検索（タイトル・説明・内容）
    if (query) {
      queryBuilder = queryBuilder.or(`
        title.ilike.%${query}%,
        description.ilike.%${query}%,
        content.ilike.%${query}%
      `);
    }
    
    // カテゴリフィルター
    if (category) {
      queryBuilder = queryBuilder.eq('category', category);
    }
    
    // 難易度フィルター
    if (difficulty) {
      queryBuilder = queryBuilder.eq('difficulty', difficulty);
    }
    
    // タグフィルター
    if (tags.length > 0) {
      queryBuilder = queryBuilder.overlaps('tags', tags);
    }
    
    // 作者フィルター
    if (author) {
      queryBuilder = queryBuilder.eq('author_id', author);
    }
    
    // ソート条件
    switch (sortBy) {
      case 'newest':
        queryBuilder = queryBuilder.order('created_at', { ascending: false });
        break;
      case 'oldest':
        queryBuilder = queryBuilder.order('created_at', { ascending: true });
        break;
      case 'popular':
        queryBuilder = queryBuilder.order('view_count', { ascending: false });
        break;
      case 'rating':
        queryBuilder = queryBuilder.order('rating', { ascending: false });
        break;
      case 'title':
        queryBuilder = queryBuilder.order('title', { ascending: true });
        break;
      default: // relevance
        if (query) {
          // 関連度順（タイトルマッチ優先）
          queryBuilder = queryBuilder.order('created_at', { ascending: false });
        } else {
          queryBuilder = queryBuilder.order('created_at', { ascending: false });
        }
    }
    
    // ページネーション
    const start = (page - 1) * limit;
    queryBuilder = queryBuilder.range(start, start + limit - 1);
    
    const { data: materials, error } = await queryBuilder;
    
    if (error) {
      console.error('教材検索エラー:', error);
      return NextResponse.json(
        { error: '教材の検索中にエラーが発生しました' },
        { status: 500 }
      );
    }
    
    // 総件数取得（ページネーション用）
    let countQuery = supabase
      .from('materials')
      .select('id', { count: 'exact', head: true })
      .eq('is_public', true);
    
    if (query) {
      countQuery = countQuery.or(`
        title.ilike.%${query}%,
        description.ilike.%${query}%,
        content.ilike.%${query}%
      `);
    }
    
    if (category) countQuery = countQuery.eq('category', category);
    if (difficulty) countQuery = countQuery.eq('difficulty', difficulty);
    if (tags.length > 0) countQuery = countQuery.overlaps('tags', tags);
    if (author) countQuery = countQuery.eq('author_id', author);
    
    const { count } = await countQuery;
    
    // レスポンス構築
    const response = {
      materials: materials || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
      search: {
        query,
        category,
        difficulty,
        tags,
        author,
        sortBy,
      },
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('教材検索エラー:', error);
    return NextResponse.json(
      { error: '教材の検索中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 