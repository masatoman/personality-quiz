import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, setRateLimitHeaders, RateLimitPresets } from '@/lib/rate-limit';

// Dynamic Server Usage エラーを解決するため動的レンダリングを強制
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    // Rate Limiting チェック
    const rateLimitResult = checkRateLimit(request, RateLimitPresets.CREATE);
    
    if (rateLimitResult.isBlocked) {
      const response = NextResponse.json(
        { 
          error: 'Too many requests. Please try again later.',
          message: 'Rate limit exceeded for material creation'
        },
        { status: 429 }
      );
      setRateLimitHeaders(response.headers, rateLimitResult, RateLimitPresets.CREATE);
      return response;
    }

    const supabase = createClient();
    
    // 認証確認
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      const response = NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
      setRateLimitHeaders(response.headers, rateLimitResult, RateLimitPresets.CREATE);
      return response;
    }

    const data = await request.json();
    
    // バリデーション
    if (!data.title || !data.content || !data.category || !data.difficulty_level) {
      const response = NextResponse.json(
        { error: '必須フィールドが不足しています' },
        { status: 400 }
      );
      setRateLimitHeaders(response.headers, rateLimitResult, RateLimitPresets.CREATE);
      return response;
    }

    // 教材作成
    const { data: material, error } = await supabase
      .from('materials')
      .insert({
        title: data.title,
        content: data.content,
        category: data.category,
        difficulty_level: data.difficulty_level,
        description: data.description || '',
        author_id: user.id,
        is_public: data.is_public || false,
        tags: data.tags || [],
        thumbnail_url: data.thumbnail_url || null,
        estimated_duration: data.estimated_duration || null
      })
      .select()
      .single();

    if (error) {
      console.error('教材作成エラー:', error);
      const response = NextResponse.json(
        { error: '教材の作成に失敗しました' },
        { status: 500 }
      );
      setRateLimitHeaders(response.headers, rateLimitResult, RateLimitPresets.CREATE);
      return response;
    }

    const response = NextResponse.json({
      success: true,
      material
    }, { status: 201 });
    
    // Rate Limit情報をヘッダーに追加
    setRateLimitHeaders(response.headers, rateLimitResult, RateLimitPresets.CREATE);
    
    return response;

  } catch (error) {
    console.error('教材作成API例外:', error);
    const response = NextResponse.json(
      { error: '教材作成中にエラーが発生しました' },
      { status: 500 }
    );
    return response;
  }
}

// 教材一覧を取得
export async function GET(request: NextRequest) {
  try {
    // 読み取り操作には緩い制限を適用
    const rateLimitResult = checkRateLimit(request, RateLimitPresets.LENIENT);
    
    if (rateLimitResult.isBlocked) {
      const response = NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
      setRateLimitHeaders(response.headers, rateLimitResult, RateLimitPresets.LENIENT);
      return response;
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');
    
    const supabase = createClient();
    
    // クエリ構築
    let query = supabase
      .from('materials')
      .select(`
        *,
        profiles!author_id(
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    // フィルタリング
    if (category) {
      query = query.eq('category', category);
    }
    
    if (difficulty) {
      query = query.eq('difficulty_level', difficulty);
    }
    
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    // ページネーション
    const offset = (page - 1) * limit;
    const { data: materials, error, count } = await query
      .range(offset, offset + limit - 1)
      .limit(limit);

    if (error) {
      console.error('教材取得エラー:', error);
      const response = NextResponse.json(
        { error: '教材の取得に失敗しました' },
        { status: 500 }
      );
      setRateLimitHeaders(response.headers, rateLimitResult, RateLimitPresets.LENIENT);
      return response;
    }

    const response = NextResponse.json({
      materials: materials || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        hasMore: (materials?.length || 0) === limit
      }
    });
    
    // Rate Limit情報をヘッダーに追加
    setRateLimitHeaders(response.headers, rateLimitResult, RateLimitPresets.LENIENT);
    
    return response;

  } catch (error) {
    console.error('教材取得API例外:', error);
    return NextResponse.json(
      { error: '教材取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 