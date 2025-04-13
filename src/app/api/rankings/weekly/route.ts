import { NextResponse } from 'next/server';
import { pool, initPool } from '@/lib/db';
import { QueryResult } from 'pg';
import { unstable_cache } from 'next/cache';

type RankingUser = {
  id: string;
  username: string;
  score: number;
  rank: number;
};

type RankingRow = {
  user_id: string;
  username: string;
  total_score: number;
};

// ランキングデータ取得関数をキャッシュ化
const getWeeklyRankings = unstable_cache(
  async () => {
    try {
      await initPool();
      
      // データベース接続テスト
      const testResult = await pool.query('SELECT NOW()');
      console.log('データベース接続テスト結果:', testResult.rows[0]);

      // テーブル存在確認
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

      console.log('quiz_resultsテーブルの存在を確認しました');

      // インデックス確認と作成
      const indexCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM pg_indexes
          WHERE schemaname = 'public'
          AND tablename = 'quiz_results'
          AND indexname = 'idx_quiz_results_created_at'
        )
      `);

      if (!indexCheck.rows[0].exists) {
        console.log('created_atのインデックスを作成します');
        await pool.query(`
          CREATE INDEX idx_quiz_results_created_at
          ON quiz_results (created_at)
        `);
      }

      // 最適化されたクエリ
      const result = await pool.query(`
        WITH WeeklyScores AS (
          SELECT 
            user_id,
            SUM(score) as total_score
          FROM quiz_results
          WHERE created_at >= NOW() - INTERVAL '7 days'
          GROUP BY user_id
        ),
        RankedUsers AS (
          SELECT 
            u.id as user_id,
            u.username,
            COALESCE(ws.total_score, 0) as total_score
          FROM users u
          LEFT JOIN WeeklyScores ws ON u.id = ws.user_id
          WHERE ws.total_score > 0
          ORDER BY ws.total_score DESC
        )
        SELECT *
        FROM RankedUsers
      `);

      console.log('ランキングクエリ実行結果:', {
        rowCount: result.rowCount ?? 0,
        firstRow: result.rows[0],
        lastRow: result.rows[result.rows.length - 1]
      });

      // データ変換
      return result.rows.map((row: RankingRow, index: number) => ({
        id: row.user_id,
        username: row.username,
        score: row.total_score,
        rank: index + 1
      }));
    } catch (error) {
      console.error('ランキングデータ取得中にエラーが発生しました:', error);
      throw error;
    }
  },
  ['weekly-rankings'],
  { 
    revalidate: 300, // 5分
    tags: ['rankings']
  }
);

export async function GET() {
  try {
    const rankings = await getWeeklyRankings();
    
    // 空のデータの場合の処理
    if (!rankings || rankings.length === 0) {
      return Response.json(
        { 
          data: [],
          message: 'ランキングデータが存在しません',
          timestamp: new Date().toISOString()
        },
        { status: 204 }
      );
    }

    // 正常なレスポンス
    return Response.json({
      data: rankings,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('ランキングの取得中にエラーが発生しました:', error);
    if (error instanceof Error) {
      console.error('エラーの詳細:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }

    return Response.json(
      { 
        error: 'ランキングの取得に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 