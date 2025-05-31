import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// 進捗取得 (GET /api/learning/progress?resource_id=xxx)
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const resourceId = searchParams.get('resource_id');
    const userId = searchParams.get('user_id') || user.id; // 管理者は他ユーザーも確認可能

    if (!resourceId) {
      return NextResponse.json({ error: 'resource_idが必要です' }, { status: 400 });
    }

    // 自分以外のユーザーの進捗を確認する場合の権限チェック
    if (userId !== user.id) {
      // 管理者権限チェック（簡易版）
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!userProfile || userProfile.role !== 'admin') {
        return NextResponse.json({ error: '権限がありません' }, { status: 403 });
      }
    }

    // 進捗情報を取得
    const { data: progress, error: progressError } = await supabase
      .from('learning_progress')
      .select(`
        *,
        learning_resources!inner(
          id,
          title,
          content_type,
          estimated_duration,
          resource_categories(name),
          difficulty_levels(display_name, color_code)
        )
      `)
      .eq('user_id', userId)
      .eq('resource_id', resourceId)
      .single();

    if (progressError && progressError.code !== 'PGRST116') {
      throw progressError;
    }

    if (!progress) {
      // 進捗が存在しない場合は初期値を返す
      const { data: resource } = await supabase
        .from('learning_resources')
        .select(`
          id,
          title,
          content_type,
          estimated_duration,
          resource_categories(name),
          difficulty_levels(display_name, color_code)
        `)
        .eq('id', resourceId)
        .eq('is_published', true)
        .single();

      if (!resource) {
        return NextResponse.json({ error: 'リソースが見つかりません' }, { status: 404 });
      }

      return NextResponse.json({
        user_id: userId,
        resource_id: resourceId,
        progress_percentage: 0,
        is_completed: false,
        total_time_spent: 0,
        section_progress: {},
        user_notes: '',
        bookmarked_sections: [],
        last_accessed_at: null,
        created_at: null,
        updated_at: null,
        learning_resources: resource
      });
    }

    return NextResponse.json(progress);

  } catch (error) {
    console.error('Progress fetch error:', error);
    return NextResponse.json(
      { error: '進捗の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// 進捗更新 (POST /api/learning/progress)
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
      progress_percentage,
      section_progress,
      time_spent_delta, // 今回のセッションで費やした時間（分）
      user_notes,
      bookmarked_sections,
      is_completing = false // 完了として記録するか
    } = body;

    // バリデーション
    if (!resource_id) {
      return NextResponse.json({ error: 'resource_idが必要です' }, { status: 400 });
    }

    if (progress_percentage !== undefined && (progress_percentage < 0 || progress_percentage > 100)) {
      return NextResponse.json({ error: '進捗率は0-100の範囲で入力してください' }, { status: 400 });
    }

    // リソースの存在確認
    const { data: resource } = await supabase
      .from('learning_resources')
      .select('id, estimated_duration')
      .eq('id', resource_id)
      .eq('is_published', true)
      .single();

    if (!resource) {
      return NextResponse.json({ error: 'リソースが見つかりません' }, { status: 404 });
    }

    // 既存の進捗を取得
    const { data: existingProgress } = await supabase
      .from('learning_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('resource_id', resource_id)
      .single();

    const now = new Date().toISOString();
    const isCompleted = is_completing || progress_percentage === 100;
    
    const progressData = {
      user_id: user.id,
      resource_id,
      progress_percentage: progress_percentage ?? existingProgress?.progress_percentage ?? 0,
      is_completed: isCompleted,
      completion_date: isCompleted ? now : null,
      total_time_spent: (existingProgress?.total_time_spent || 0) + (time_spent_delta || 0),
      last_accessed_at: now,
      section_progress: section_progress ?? existingProgress?.section_progress ?? {},
      user_notes: user_notes ?? existingProgress?.user_notes ?? '',
      bookmarked_sections: bookmarked_sections ?? existingProgress?.bookmarked_sections ?? [],
      updated_at: now
    };

    let result;
    if (existingProgress) {
      // 更新
      const { data, error } = await supabase
        .from('learning_progress')
        .update(progressData)
        .eq('user_id', user.id)
        .eq('resource_id', resource_id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // 新規作成
      const insertData = {
        ...progressData,
        created_at: now
      };
      const { data, error } = await supabase
        .from('learning_progress')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    // 学習リソースの統計を更新
    if (time_spent_delta || isCompleted) {
      await updateResourceStatistics(supabase, resource_id);
    }

    // ポイント付与（完了時）
    if (isCompleted && !existingProgress?.is_completed) {
      await awardCompletionPoints(supabase, user.id, resource_id);
    }

    return NextResponse.json({
      success: true,
      progress: result
    });

  } catch (error) {
    console.error('Progress update error:', error);
    return NextResponse.json(
      { error: '進捗の更新中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// ヘルパー関数：リソース統計更新
async function updateResourceStatistics(supabase: any, resourceId: string) {
  const { data: progressData } = await supabase
    .from('learning_progress')
    .select('is_completed')
    .eq('resource_id', resourceId);

  if (progressData) {
    const completionCount = progressData.filter((p: any) => p.is_completed).length;
    const viewCount = progressData.length;

    await supabase
      .from('learning_resources')
      .update({
        completion_count: completionCount,
        view_count: viewCount
      })
      .eq('id', resourceId);
  }
}

// ヘルパー関数：完了ポイント付与
async function awardCompletionPoints(supabase: any, userId: string, resourceId: string) {
  try {
    // リソース情報を取得
    const { data: resource } = await supabase
      .from('learning_resources')
      .select(`
        estimated_duration,
        difficulty_levels(level_code)
      `)
      .eq('id', resourceId)
      .single();

    if (!resource) return;

    // 難易度とコンテンツ時間に基づいてポイント計算
    const basePoints = 10;
    const durationMultiplier = Math.min(resource.estimated_duration / 30, 3); // 最大3倍
    
    const difficultyMultiplier: Record<string, number> = {
      'beginner': 1.0,
      'intermediate': 1.5,
      'advanced': 2.0,
      'expert': 2.5
    };

    const points = Math.round(basePoints * durationMultiplier * (difficultyMultiplier[resource.difficulty_levels?.level_code] || 1.0));

    // ポイント付与APIを呼び出し
    await fetch('/api/points/earn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        activityType: 'learning_completed',
        points,
        referenceId: resourceId,
        referenceType: 'learning_resource',
        description: `学習リソース完了: ${points}ポイント獲得`
      })
    });

  } catch (error) {
    console.error('Award points error:', error);
    // ポイント付与失敗してもメイン処理は継続
  }
} 