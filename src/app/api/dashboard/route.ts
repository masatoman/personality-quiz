import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'ユーザーIDが必要です' },
        { status: 400 }
      );
    }

    // Supabaseクライアントの初期化
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // 並行してデータを取得
    const [
      summaryResult,
      scoresResult,
      distributionResult
    ] = await Promise.all([
      // 活動サマリーの取得
      supabase
        .from('user_activities')
        .select('created_materials_count, earned_points, viewed_materials_count')
        .eq('user_id', userId)
        .single(),

      // ギバースコア履歴の取得
      supabase
        .from('giver_scores')
        .select('date, score')
        .eq('user_id', userId)
        .order('date', { ascending: true })
        .limit(7),

      // 活動分布の取得
      supabase
        .from('activity_distribution')
        .select('type, percentage')
        .eq('user_id', userId)
    ]);

    // エラーチェック
    if (summaryResult.error) {
      console.error('活動サマリー取得エラー:', summaryResult.error);
      throw new Error('活動サマリーの取得に失敗しました');
    }
    if (scoresResult.error) {
      console.error('ギバースコア履歴取得エラー:', scoresResult.error);
      throw new Error('ギバースコア履歴の取得に失敗しました');
    }
    if (distributionResult.error) {
      console.error('活動分布取得エラー:', distributionResult.error);
      throw new Error('活動分布の取得に失敗しました');
    }

    // レスポンスデータの整形
    const dashboardData = {
      summary: {
        createdMaterials: summaryResult.data.created_materials_count || 0,
        earnedPoints: summaryResult.data.earned_points || 0,
        viewedMaterials: summaryResult.data.viewed_materials_count || 0,
      },
      giverScores: scoresResult.data.map(score => ({
        date: score.date,
        score: score.score,
      })),
      activityDistribution: distributionResult.data.map(activity => ({
        type: activity.type,
        percentage: activity.percentage,
      })),
    };

    // キャッシュヘッダーの設定（5分間）
    const headers = new Headers();
    headers.set('Cache-Control', 's-maxage=300, stale-while-revalidate');

    return NextResponse.json(
      { data: dashboardData },
      { 
        headers,
        status: 200 
      }
    );
  } catch (error) {
    console.error('ダッシュボードデータの取得に失敗:', error);
    return NextResponse.json(
      { error: 'ダッシュボードデータの取得に失敗しました' },
      { status: 500 }
    );
  }
} 