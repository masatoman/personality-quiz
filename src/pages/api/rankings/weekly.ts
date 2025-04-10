import { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '@/lib/db';

type RankingUser = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  score: number;
  rank: number;
  is_current_user: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '許可されていないメソッドです' });
  }

  try {
    const { userId } = req.query;
    
    // 現在の週の開始日を取得
    const currentWeekStart = new Date();
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
    currentWeekStart.setHours(0, 0, 0, 0);
    
    // 先週の開始日を取得
    const lastWeekStart = new Date(currentWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    
    const { rows } = await pool.query(`
      SELECT 
        u.id,
        u.display_name,
        u.avatar_url,
        wgs.score,
        wgs.rank,
        CASE WHEN u.id = $1 THEN TRUE ELSE FALSE END as is_current_user
      FROM weekly_giver_scores wgs
      JOIN users u ON wgs.user_id = u.id
      WHERE wgs.week_start = $2
      ORDER BY wgs.rank ASC
      LIMIT 100
    `, [userId || '', lastWeekStart.toISOString().split('T')[0]]);
    
    // ログインユーザーのランキングがトップ100に入っていない場合は追加で取得
    if (userId && !rows.some(row => row.id === userId)) {
      const { rows: userRows } = await pool.query(`
        SELECT 
          u.id,
          u.display_name,
          u.avatar_url,
          wgs.score,
          wgs.rank,
          TRUE as is_current_user
        FROM weekly_giver_scores wgs
        JOIN users u ON wgs.user_id = u.id
        WHERE wgs.week_start = $1 AND u.id = $2
      `, [lastWeekStart.toISOString().split('T')[0], userId]);
      
      if (userRows.length > 0) {
        rows.push(userRows[0]);
      }
    }
    
    // ランキングデータに追加情報を付与
    const ranking = rows.map((row: RankingUser) => ({
      ...row,
      is_current_user: row.is_current_user
    }));
    
    // 次回の更新日時（次の月曜日）を計算
    const nextUpdateDate = new Date(currentWeekStart);
    nextUpdateDate.setDate(nextUpdateDate.getDate() + 7);
    
    return res.status(200).json({
      ranking,
      meta: {
        period_start: lastWeekStart.toISOString().split('T')[0],
        period_end: currentWeekStart.toISOString().split('T')[0],
        next_update: nextUpdateDate.toISOString().split('T')[0]
      }
    });
  } catch (error) {
    console.error('ランキング取得エラー:', error);
    return res.status(500).json({ message: 'ランキングの取得に失敗しました' });
  }
} 