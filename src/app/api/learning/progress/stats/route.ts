import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// 学習統計取得 (GET /api/learning/progress/stats?user_id=xxx)
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('user_id') || user.id;

    // 自分以外のユーザーの統計を確認する場合の権限チェック
    if (targetUserId !== user.id) {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!userProfile || userProfile.role !== 'admin') {
        return NextResponse.json({ error: '権限がありません' }, { status: 403 });
      }
    }

    // ユーザー学習統計を取得
    const { data: stats, error } = await supabase
      .from('user_learning_statistics')
      .select('*')
      .eq('user_id', targetUserId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    // 追加統計情報
    const { data: recentProgress } = await supabase
      .from('learning_progress')
      .select(`
        *,
        learning_resources(
          title,
          content_type,
          resource_categories(name)
        )
      `)
      .eq('user_id', targetUserId)
      .order('last_accessed_at', { ascending: false })
      .limit(10);

    const { data: categoryStats } = await supabase
      .from('learning_progress')
      .select(`
        learning_resources!inner(
          resource_categories!inner(name)
        )
      `)
      .eq('user_id', targetUserId)
      .eq('is_completed', true);

    // カテゴリ別完了数を集計
    const categoryCompletion: Record<string, number> = {};
    categoryStats?.forEach((item: any) => {
      const categoryName = item.learning_resources.resource_categories.name;
      categoryCompletion[categoryName] = (categoryCompletion[categoryName] || 0) + 1;
    });

    return NextResponse.json({
      statistics: stats || {
        user_id: targetUserId,
        total_resources_accessed: 0,
        completed_resources: 0,
        completion_rate: 0,
        total_learning_time: 0,
        avg_time_per_resource: 0,
        last_learning_activity: null
      },
      recent_progress: recentProgress || [],
      category_completion: categoryCompletion
    });

  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json(
      { error: '統計の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 