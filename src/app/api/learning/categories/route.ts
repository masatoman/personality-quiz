import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// カテゴリ一覧取得 (GET /api/learning/categories)
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    
    const includeStats = searchParams.get('include_stats') === 'true';
    const activeOnly = searchParams.get('active_only') !== 'false'; // デフォルトtrue

    // 基本クエリ
    let query = supabase
      .from('resource_categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data: categories, error } = await query;

    if (error) throw error;

    if (!includeStats) {
      return NextResponse.json({
        categories: categories || []
      });
    }

    // 統計情報付きで返す
    const categoriesWithStats = await Promise.all(
      (categories || []).map(async (category: any) => {
        const { data: stats } = await supabase
          .from('learning_resources')
          .select('id, average_rating, view_count', { count: 'exact' })
          .eq('category_id', category.id)
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
          ...category,
          statistics: {
            resource_count: resourceCount,
            average_rating: Math.round(avgRating * 10) / 10,
            total_views: totalViews
          }
        };
      })
    );

    return NextResponse.json({
      categories: categoriesWithStats
    });

  } catch (error) {
    console.error('Categories fetch error:', error);
    return NextResponse.json(
      { error: 'カテゴリの取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 