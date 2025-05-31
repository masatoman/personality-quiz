import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// レビュー一覧取得 (GET /api/learning/reviews?resource_id=xxx)
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    
    const resourceId = searchParams.get('resource_id');
    const userId = searchParams.get('user_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const sort = searchParams.get('sort') || 'created_at'; // 'created_at', 'rating', 'helpful_count'
    const order = searchParams.get('order') || 'desc';

    if (!resourceId) {
      return NextResponse.json({ error: 'resource_idが必要です' }, { status: 400 });
    }

    // ソート設定
    const validSortFields = ['created_at', 'rating', 'helpful_count'];
    const sortField = validSortFields.includes(sort) ? sort : 'created_at';
    const sortOrder = order === 'asc' ? { ascending: true } : { ascending: false };

    // レビュー取得クエリ
    let query = supabase
      .from('resource_reviews')
      .select(`
        *,
        profiles!user_id(
          id,
          username,
          display_name,
          avatar_url
        ),
        learning_progress!inner(
          is_completed,
          completion_date
        )
      `)
      .eq('resource_id', resourceId)
      .eq('is_approved', true)
      .order(sortField, sortOrder);

    // ユーザー指定がある場合はフィルタ
    if (userId) {
      query = query.eq('user_id', userId);
    }

    // ページネーション
    const offset = (page - 1) * limit;
    const { data: reviews, error } = await query.range(offset, offset + limit - 1);

    if (error) throw error;

    // 統計情報を取得
    const { data: stats } = await supabase
      .from('resource_reviews')
      .select('rating', { count: 'exact' })
      .eq('resource_id', resourceId)
      .eq('is_approved', true);

    const totalReviews = stats?.length || 0;
    const averageRating = totalReviews > 0
      ? stats.reduce((sum: number, r: any) => sum + r.rating, 0) / totalReviews
      : 0;

    // 評価分布を計算
    const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: stats?.filter((r: any) => r.rating === rating).length || 0,
      percentage: totalReviews > 0 
        ? Math.round((stats?.filter((r: any) => r.rating === rating).length || 0) / totalReviews * 100)
        : 0
    }));

    return NextResponse.json({
      reviews: reviews || [],
      statistics: {
        total_reviews: totalReviews,
        average_rating: Math.round(averageRating * 10) / 10,
        rating_distribution: ratingDistribution
      },
      pagination: {
        page,
        limit,
        has_more: (reviews?.length || 0) === limit
      }
    });

  } catch (error) {
    console.error('Reviews fetch error:', error);
    return NextResponse.json(
      { error: 'レビューの取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// レビュー作成・更新 (POST /api/learning/reviews)
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = await request.json();
    const {
      resource_id,
      rating,
      review_text
    } = body;

    // バリデーション
    if (!resource_id || !rating) {
      return NextResponse.json(
        { error: 'resource_idとratingは必須です' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: '評価は1-5の範囲で入力してください' },
        { status: 400 }
      );
    }

    // リソースの存在確認
    const { data: resource } = await supabase
      .from('learning_resources')
      .select('id')
      .eq('id', resource_id)
      .eq('is_published', true)
      .single();

    if (!resource) {
      return NextResponse.json({ error: 'リソースが見つかりません' }, { status: 404 });
    }

    // 学習進捗の確認（完了済みかチェック）
    const { data: progress } = await supabase
      .from('learning_progress')
      .select('is_completed, completion_date')
      .eq('user_id', user.id)
      .eq('resource_id', resource_id)
      .single();

    const isVerifiedCompletion = progress?.is_completed || false;

    // 既存レビューのチェック
    const { data: existingReview } = await supabase
      .from('resource_reviews')
      .select('id')
      .eq('user_id', user.id)
      .eq('resource_id', resource_id)
      .single();

    const now = new Date().toISOString();
    const reviewData = {
      user_id: user.id,
      resource_id,
      rating,
      review_text: review_text || '',
      is_verified_completion: isVerifiedCompletion,
      is_approved: true, // 自動承認（後でモデレーション機能追加可能）
      updated_at: now
    };

    let result;
    if (existingReview) {
      // 更新
      const { data, error } = await supabase
        .from('resource_reviews')
        .update(reviewData)
        .eq('user_id', user.id)
        .eq('resource_id', resource_id)
        .select(`
          *,
          profiles!user_id(username, display_name, avatar_url)
        `)
        .single();

      if (error) throw error;
      result = data;
    } else {
      // 新規作成
      const insertData = {
        ...reviewData,
        created_at: now
      };
      const { data, error } = await supabase
        .from('resource_reviews')
        .insert(insertData)
        .select(`
          *,
          profiles!user_id(username, display_name, avatar_url)
        `)
        .single();

      if (error) throw error;
      result = data;
    }

    // リソースの平均評価を更新
    await updateResourceRating(supabase, resource_id);

    // ギバーポイント付与（レビュー作成）
    if (!existingReview) {
      await awardReviewPoints(user.id, resource_id);
    }

    return NextResponse.json({
      success: true,
      review: result
    });

  } catch (error) {
    console.error('Review creation error:', error);
    return NextResponse.json(
      { error: 'レビューの作成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// ヘルパー関数：リソースの平均評価更新
async function updateResourceRating(supabase: any, resourceId: string) {
  try {
    const { data: reviews } = await supabase
      .from('resource_reviews')
      .select('rating')
      .eq('resource_id', resourceId)
      .eq('is_approved', true);

    if (reviews && reviews.length > 0) {
      const averageRating = reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length;
      const reviewCount = reviews.length;

      await supabase
        .from('learning_resources')
        .update({
          average_rating: Math.round(averageRating * 100) / 100,
          review_count: reviewCount
        })
        .eq('id', resourceId);
    }
  } catch (error) {
    console.error('Update resource rating error:', error);
  }
}

// ヘルパー関数：レビューポイント付与
async function awardReviewPoints(userId: string, resourceId: string) {
  try {
    await fetch('/api/points/giver-rewards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        activityType: 'comment_helpful',
        referenceId: resourceId,
        referenceType: 'learning_resource',
        description: '学習リソースレビュー投稿'
      })
    });
  } catch (error) {
    console.error('Award review points error:', error);
    // ポイント付与失敗してもメイン処理は継続
  }
} 