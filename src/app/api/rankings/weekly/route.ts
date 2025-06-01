import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { unstable_cache } from 'next/cache';

type RankingRow = {
  user_id: string;
  username: string;
  total_score: number;
  activity_count: number;
  last_activity: string;
  rank: number;
};

// キャッシュ設定の最適化
const CACHE_CONFIG = {
  REVALIDATE_SECONDS: 300, // 5分
  STALE_SECONDS: 60, // 1分間は古いデータを許容
  ERROR_RETRY_SECONDS: 30, // エラー時の再試行間隔
  TAGS: {
    RANKINGS: 'rankings',
    WEEKLY: 'weekly-rankings',
    USER_SCORES: 'user-scores'
  }
};

// Supabaseクライアントの初期化とテスト
async function initializeAndTestConnection() {
  try {
    const supabase = createClient();
    
    // テーブル存在確認
    const { data, error } = await supabase
      .from('quiz_results')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('データベース接続テストエラー:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('データベース初期化エラー:', error);
    throw error;
  }
}

// ランキングデータ取得関数をキャッシュ化
const getWeeklyRankings = unstable_cache(
  async () => {
    const startTime = Date.now();
    try {
      await initializeAndTestConnection();
      const supabase = createClient();

      // 週次ランキングデータを取得
      const { data: rankings, error } = await supabase
        .rpc('get_weekly_rankings', { limit_count: 100 });

      if (error) {
        console.error('ランキングデータ取得エラー:', error);
        // フォールバック: 基本的なクエリを実行
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('quiz_results')
          .select(`
            user_id,
            score,
            created_at,
            users!inner(username)
          `)
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('score', { ascending: false })
          .limit(100);

        if (fallbackError) {
          throw fallbackError;
        }

        // フォールバックデータを処理
        const userScores = new Map();
        fallbackData?.forEach((result: any) => {
          const userId = result.user_id;
          if (!userScores.has(userId)) {
            userScores.set(userId, {
              user_id: userId,
              username: result.users.username,
              total_score: 0,
              activity_count: 0,
              last_activity: result.created_at
            });
          }
          const userScore = userScores.get(userId);
          userScore.total_score += result.score;
          userScore.activity_count += 1;
          if (result.created_at > userScore.last_activity) {
            userScore.last_activity = result.created_at;
          }
        });

        const sortedRankings = Array.from(userScores.values())
          .sort((a, b) => b.total_score - a.total_score)
          .map((user, index) => ({ ...user, rank: index + 1 }));

        return sortedRankings.map((row: any) => ({
          id: row.user_id,
          username: row.username,
          score: row.total_score,
          rank: row.rank,
          activityCount: row.activity_count,
          lastActive: row.last_activity
        }));
      }

      // パフォーマンスメトリクスの記録
      const executionTime = Date.now() - startTime;
      console.log('ランキングクエリパフォーマンス:', {
        rowCount: rankings?.length || 0,
        executionTimeMs: executionTime,
        timestamp: new Date().toISOString()
      });

      return rankings?.map((row: any) => ({
        id: row.user_id,
        username: row.username,
        score: row.total_score,
        rank: row.rank,
        activityCount: row.activity_count,
        lastActive: row.last_activity
      })) || [];

    } catch (error) {
      console.error('ランキングデータ取得エラー:', error);
      throw error;
    }
  },
  [CACHE_CONFIG.TAGS.WEEKLY],
  {
    revalidate: CACHE_CONFIG.REVALIDATE_SECONDS,
    tags: Object.values(CACHE_CONFIG.TAGS)
  }
);

export async function GET() {
  const startTime = Date.now();
  try {
    const rankings = await getWeeklyRankings();
    const responseTime = Date.now() - startTime;
    
    // 空のデータの場合の処理
    if (!rankings || rankings.length === 0) {
      console.log('ランキングデータが空です');
      return NextResponse.json(
        { 
          data: [],
          message: 'ランキングデータが存在しません',
          timestamp: new Date().toISOString(),
          status: 'empty'
        },
        { 
          status: 204,
          headers: {
            'Cache-Control': `public, s-maxage=${CACHE_CONFIG.REVALIDATE_SECONDS}, stale-while-revalidate=${CACHE_CONFIG.STALE_SECONDS}`,
            'CDN-Cache-Control': `public, s-maxage=${CACHE_CONFIG.REVALIDATE_SECONDS}`,
            'Vercel-CDN-Cache-Control': `public, s-maxage=${CACHE_CONFIG.REVALIDATE_SECONDS}`,
            'Surrogate-Control': `public, s-maxage=${CACHE_CONFIG.REVALIDATE_SECONDS}`,
            'Vary': 'Accept-Encoding',
            'X-Response-Time': `${responseTime}ms`
          }
        }
      );
    }

    // 正常なレスポンス
    return NextResponse.json({
      data: rankings,
      timestamp: new Date().toISOString(),
      status: 'success',
      totalUsers: rankings.length,
      metrics: {
        responseTime: responseTime
      }
    }, {
      headers: {
        'Cache-Control': `public, s-maxage=${CACHE_CONFIG.REVALIDATE_SECONDS}, stale-while-revalidate=${CACHE_CONFIG.STALE_SECONDS}`,
        'CDN-Cache-Control': `public, s-maxage=${CACHE_CONFIG.REVALIDATE_SECONDS}`,
        'Vercel-CDN-Cache-Control': `public, s-maxage=${CACHE_CONFIG.REVALIDATE_SECONDS}`,
        'Surrogate-Control': `public, s-maxage=${CACHE_CONFIG.REVALIDATE_SECONDS}`,
        'Vary': 'Accept-Encoding',
        'X-Response-Time': `${responseTime}ms`
      }
    });
  } catch (error) {
    console.error('ランキング取得エラー:', error);
    const errorResponse = {
      error: 'ランキングの取得に失敗しました',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      status: 'error'
    };

    // エラー時は短いキャッシュ時間を設定
    return NextResponse.json(errorResponse, { 
      status: 500,
      headers: {
        'Cache-Control': `public, max-age=0, s-maxage=${CACHE_CONFIG.ERROR_RETRY_SECONDS}`,
        'CDN-Cache-Control': `public, max-age=${CACHE_CONFIG.ERROR_RETRY_SECONDS}`,
        'Vercel-CDN-Cache-Control': `public, max-age=${CACHE_CONFIG.ERROR_RETRY_SECONDS}`,
        'Surrogate-Control': `public, max-age=${CACHE_CONFIG.ERROR_RETRY_SECONDS}`,
        'X-Error-Time': new Date().toISOString()
      }
    });
  }
} 