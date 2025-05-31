import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// リソース一覧取得 (GET /api/learning/resources)
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    
    // パラメータ解析
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const contentType = searchParams.get('content_type');
    const featured = searchParams.get('featured');
    const authorId = searchParams.get('author_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const sort = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') || 'desc';
    const search = searchParams.get('search');

    // クエリ構築
    let query = supabase
      .from('learning_resources')
      .select(`
        *,
        resource_categories(id, name, icon_name),
        difficulty_levels(id, level_code, display_name, color_code)
      `)
      .eq('is_published', true)
      .eq('moderation_status', 'approved');

    // フィルタリング
    if (category) {
      query = query.eq('category_id', category);
    }
    if (difficulty) {
      query = query.eq('difficulty_level_id', difficulty);
    }
    if (contentType) {
      query = query.eq('content_type', contentType);
    }
    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }
    if (authorId) {
      query = query.eq('author_id', authorId);
    }

    // 検索
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // ソート
    const validSortFields = ['created_at', 'updated_at', 'view_count', 'average_rating', 'completion_count'];
    const sortField = validSortFields.includes(sort) ? sort : 'created_at';
    const sortOrder = order === 'asc' ? { ascending: true } : { ascending: false };
    
    query = query.order(sortField, sortOrder);

    // ページネーション
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: resources, error, count } = await query;

    if (error) throw error;

    // 総数取得（countを含むクエリ）
    const { count: totalCount } = await supabase
      .from('learning_resources')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true)
      .eq('moderation_status', 'approved');

    return NextResponse.json({
      resources: resources || [],
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        total_pages: Math.ceil((totalCount || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Resources fetch error:', error);
    return NextResponse.json(
      { error: 'リソースの取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// リソース作成 (POST /api/learning/resources)
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      content_type,
      content_url,
      content_data,
      category_id,
      difficulty_level_id,
      estimated_duration,
      tags,
      language = 'ja',
      target_language = 'en',
      is_published = false
    } = body;

    // バリデーション
    if (!title || !content_type) {
      return NextResponse.json(
        { error: 'タイトルとコンテンツタイプは必須です' },
        { status: 400 }
      );
    }

    const validContentTypes = ['text', 'video', 'audio', 'interactive', 'quiz', 'pdf'];
    if (!validContentTypes.includes(content_type)) {
      return NextResponse.json(
        { error: '無効なコンテンツタイプです' },
        { status: 400 }
      );
    }

    // カテゴリと難易度の存在確認
    if (category_id) {
      const { data: category } = await supabase
        .from('resource_categories')
        .select('id')
        .eq('id', category_id)
        .eq('is_active', true)
        .single();

      if (!category) {
        return NextResponse.json(
          { error: '無効なカテゴリIDです' },
          { status: 400 }
        );
      }
    }

    if (difficulty_level_id) {
      const { data: difficulty } = await supabase
        .from('difficulty_levels')
        .select('id')
        .eq('id', difficulty_level_id)
        .single();

      if (!difficulty) {
        return NextResponse.json(
          { error: '無効な難易度IDです' },
          { status: 400 }
        );
      }
    }

    const now = new Date().toISOString();
    const resourceData = {
      title,
      description,
      content_type,
      content_url,
      content_data,
      category_id,
      difficulty_level_id,
      author_id: user.id,
      estimated_duration,
      tags: tags || [],
      language,
      target_language,
      is_published,
      published_at: is_published ? now : null,
      moderation_status: 'pending',
      created_at: now,
      updated_at: now
    };

    const { data: resource, error } = await supabase
      .from('learning_resources')
      .insert(resourceData)
      .select(`
        *,
        resource_categories(id, name, icon_name),
        difficulty_levels(id, level_code, display_name, color_code)
      `)
      .single();

    if (error) throw error;

    // ギバーポイント付与（リソース作成）
    if (resource) {
      await awardCreationPoints(user.id, resource.id);
    }

    return NextResponse.json({
      success: true,
      resource
    });

  } catch (error) {
    console.error('Resource creation error:', error);
    return NextResponse.json(
      { error: 'リソースの作成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// ヘルパー関数：作成ポイント付与
async function awardCreationPoints(userId: string, resourceId: string) {
  try {
    await fetch('/api/points/giver-rewards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        activityType: 'material_created',
        referenceId: resourceId,
        referenceType: 'learning_resource',
        description: '学習リソース作成'
      })
    });
  } catch (error) {
    console.error('Award creation points error:', error);
    // ポイント付与失敗してもメイン処理は継続
  }
} 