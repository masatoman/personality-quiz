import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// 難易度レベル取得 (GET /api/learning/difficulties)
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    
    const includeStats = searchParams.get('include_stats') === 'true';

    // 基本クエリ
    const { data: difficulties, error } = await supabase
      .from('difficulty_levels')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;

    if (!includeStats) {
      return NextResponse.json({
        difficulties: difficulties || []
      });
    }

    // 統計情報付きで返す
    const difficultiesWithStats = await Promise.all(
      (difficulties || []).map(async (difficulty: any) => {
        const { data: stats } = await supabase
          .from('learning_resources')
          .select('id, average_rating, view_count', { count: 'exact' })
          .eq('difficulty_level_id', difficulty.id)
          .eq('is_published', true)
          .eq('moderation_status', 'approved');

        const resourceCount = stats?.length || 0;
        const avgRating = stats && stats.length > 0 
          ? stats.reduce((sum: number, r: any) => sum + (r.average_rating || 0), 0) / stats.length
          : 0;
        const totalViews = stats && stats.length > 0
          ? stats.reduce((sum: number, r: any) => sum + (r.view_count || 0), 0) 
          : 0;

        return {
          ...difficulty,
          statistics: {
            resource_count: resourceCount,
            average_rating: Math.round(avgRating * 10) / 10,
            total_views: totalViews
          }
        };
      })
    );

    return NextResponse.json({
      difficulties: difficultiesWithStats
    });

  } catch (error) {
    console.error('Difficulties fetch error:', error);
    return NextResponse.json(
      { error: '難易度レベルの取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 