import { NextResponse } from 'next/server';
import { pool, initPool } from '@/lib/db';
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

// データベース接続の初期化とテスト
async function initializeAndTestConnection() {
  try {
    // 接続タイムアウトを30秒に設定
    await Promise.race([
      initPool(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('データベース接続がタイムアウトしました')), 30000)
      )
    ]);

    // テーブル存在確認とインデックス最適化
    await Promise.all([
      verifyTableExists(),
      optimizeIndexes()
    ]);

    return true;
  } catch (error) {
    console.error('データベース初期化エラー:', error);
    throw error;
  }
}

// テーブル存在確認
async function verifyTableExists() {
  const tableCheck = await pool.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'quiz_results'
    )
  `);
  
  if (!tableCheck.rows[0].exists) {
    throw new Error('quiz_resultsテーブルが存在しません');
  }
}

// インデックス最適化
async function optimizeIndexes() {
  const requiredIndexes = [
    {
      name: 'idx_quiz_results_created_at',
      definition: 'CREATE INDEX idx_quiz_results_created_at ON quiz_results (created_at)'
    },
    {
      name: 'idx_quiz_results_user_score',
      definition: 'CREATE INDEX idx_quiz_results_user_score ON quiz_results (user_id, score)'
    }
  ];

  for (const index of requiredIndexes) {
    const indexExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM pg_indexes
        WHERE schemaname = 'public'
        AND tablename = 'quiz_results'
        AND indexname = $1
      )
    `, [index.name]);

    if (!indexExists.rows[0].exists) {
      console.log(`${index.name}のインデックスを作成します`);
      await pool.query(index.definition);
    }
  }
}

// ランキングデータ取得関数をキャッシュ化
const getWeeklyRankings = unstable_cache(
  async () => {
    const startTime = Date.now();
    try {
      await initializeAndTestConnection();

      const result = await pool.query(`
        WITH RankedScores AS (
          SELECT 
            u.id as user_id,
            u.username,
            COALESCE(SUM(qr.score), 0) as total_score,
            COUNT(qr.id) as activity_count,
            MAX(qr.created_at) as last_activity,
            ROW_NUMBER() OVER (
              ORDER BY COALESCE(SUM(qr.score), 0) DESC,
                       COUNT(qr.id) DESC,
                       MAX(qr.created_at) DESC
            ) as rank
          FROM users u
          LEFT JOIN LATERAL (
            SELECT id, score, created_at, user_id
            FROM quiz_results
            WHERE created_at >= NOW() - INTERVAL '7 days'
            AND user_id = u.id
          ) qr ON true
          GROUP BY u.id, u.username
          HAVING COUNT(qr.id) > 0 OR EXISTS (
            SELECT 1 FROM quiz_results qr2 
            WHERE qr2.user_id = u.id 
            AND qr2.created_at >= NOW() - INTERVAL '30 days'
          )
        )
        SELECT 
          user_id,
          username,
          total_score,
          activity_count,
          last_activity,
          rank
        FROM RankedScores
        WHERE rank <= 100
        ORDER BY total_score DESC, activity_count DESC, last_activity DESC
      `);

      // パフォーマンスメトリクスの記録
      const executionTime = Date.now() - startTime;
      console.log('ランキングクエリパフォーマンス:', {
        rowCount: result.rowCount,
        executionTimeMs: executionTime,
        timestamp: new Date().toISOString()
      });

      return result.rows.map((row: RankingRow) => ({
        id: row.user_id,
        username: row.username,
        score: row.total_score,
        rank: row.rank,
        activityCount: row.activity_count,
        lastActive: row.last_activity
      }));

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