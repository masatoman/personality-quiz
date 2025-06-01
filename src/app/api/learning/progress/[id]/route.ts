import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// 特定IDの学習進捗取得 (GET /api/learning/progress/{id})
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const resourceId = params.id;

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
      .eq('user_id', user.id)
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
        user_id: user.id,
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
    console.error('Learning progress fetch error:', error);
    return NextResponse.json(
      { error: '学習進捗の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 