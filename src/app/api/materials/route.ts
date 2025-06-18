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
    
    // 開発環境での認証スキップオプション
    const isDevelopment = process.env.NODE_ENV === 'development';
    const skipAuth = isDevelopment && process.env.SKIP_AUTH === 'true';
    
    let user = null;
    
    if (skipAuth) {
      // 開発環境でのダミーユーザー
      user = {
        id: '11111111-1111-1111-1111-111111111111',
        email: 'dev@example.com'
      };
      console.log('開発環境: 認証をスキップしています');
    } else {
      // 通常の認証確認
      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
      if (userError || !authUser) {
        const response = NextResponse.json(
          { error: '認証が必要です' },
          { status: 401 }
        );
        setRateLimitHeaders(response.headers, rateLimitResult, RateLimitPresets.CREATE);
        return response;
      }
      user = authUser;
    }

    const requestData = await request.json();
    console.log('教材作成API: 受信データ', requestData);
    
    // 新しいデータ構造の処理（フロントエンドからの構造化データ）
    let data;
    if (requestData.basicInfo && requestData.contentSections && requestData.settings) {
      // 構造化データを平坦化
      const { basicInfo, contentSections, settings } = requestData;
      
      data = {
        title: basicInfo.title,
        description: basicInfo.description,
        content: {
          sections: contentSections,
          introduction: '',
          conclusion: ''
        },
        category: settings.category || 'general',
        difficulty: settings.difficulty || 'beginner',
        tags: basicInfo.tags || [],
        status: settings.isPublic ? 'published' : 'draft',
        estimated_time: settings.estimatedTime || 0,
        allow_comments: settings.allowComments !== false,
        target_audience: settings.targetAudience || [],
        prerequisites: settings.prerequisites || '',
        thumbnail_url: null
      };
    } else {
      // 従来のフラットなデータ構造もサポート
      data = {
        title: requestData.title,
        description: requestData.description,
        content: requestData.content,
        category: requestData.category,
        difficulty: requestData.difficulty || 'beginner',
        tags: requestData.tags || [],
        status: requestData.is_public ? 'published' : 'draft',
        estimated_time: requestData.estimated_duration || 0,
        allow_comments: requestData.allow_comments !== false,
        target_audience: requestData.target_audience || [],
        prerequisites: requestData.prerequisites || '',
        thumbnail_url: requestData.thumbnail_url || null
      };
    }
    
    // バリデーション
    if (!data.title || !data.content || !data.category) {
      console.error('バリデーションエラー:', { title: data.title, content: data.content, category: data.category });
      const response = NextResponse.json(
        { error: '必須フィールドが不足しています（タイトル、コンテンツ、カテゴリが必要）' },
        { status: 400 }
      );
      setRateLimitHeaders(response.headers, rateLimitResult, RateLimitPresets.CREATE);
      return response;
    }

    // 教材作成 - materialsテーブルの実際の構造に合わせて調整
    const insertData = {
      title: data.title,
      content: typeof data.content === 'string' ? data.content : JSON.stringify(data.content),
      category: data.category,
      description: data.description || '',
      user_id: user.id, // materialsテーブルのuser_idフィールドに保存
      // author_idフィールドは存在しないため削除
      difficulty_level: data.difficulty === 'beginner' ? 1 : 
                       data.difficulty === 'intermediate' ? 3 : 
                       data.difficulty === 'advanced' ? 5 : 2,
      estimated_time: data.estimated_time || 0,
      is_published: data.status === 'published' || data.is_public || false,
      tags: data.tags || []
    };

    console.log('データベース挿入データ:', insertData);

    const { data: material, error } = await supabase
      .from('materials')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('教材作成エラー:', error);
      const response = NextResponse.json(
        { error: `教材の作成に失敗しました: ${error.message}` },
        { status: 500 }
      );
      setRateLimitHeaders(response.headers, rateLimitResult, RateLimitPresets.CREATE);
      return response;
    }

    console.log('教材作成成功:', material);

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
    
    // クエリ構築 - JOINエラー回避のため、まずはmaterialsのみ取得
    let query = supabase
      .from('materials')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    // フィルタリング
    if (category) {
      query = query.eq('category', category);
    }
    
    if (difficulty) {
      query = query.eq('difficulty', difficulty);
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