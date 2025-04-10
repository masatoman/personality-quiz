import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { Stats, TypeStats } from '@/types/quiz';

// APIのモックデータ
const mockStats: Stats = {
  giver: { count: 10, percentage: 34 },
  matcher: { count: 7, percentage: 25 },
  taker: { count: 12, percentage: 41 },
  total: 29
};

export async function GET() {
  try {
    // データベースクエリを試みる
    try {
      // 全ユーザーの結果を取得
      const result = await query(
        `SELECT personality_type, COUNT(*) as count 
         FROM results 
         GROUP BY personality_type`
      );
      
      // 統計計算
      const stats: Stats = {
        giver: { count: 0, percentage: 0 },
        matcher: { count: 0, percentage: 0 },
        taker: { count: 0, percentage: 0 },
        total: 0
      };
      
      // 結果を処理
      let total = 0;
      result.rows.forEach((row: { personality_type: string, count: string }) => {
        const type = row.personality_type.toLowerCase();
        const count = parseInt(row.count);
        if (type === 'giver' || type === 'matcher' || type === 'taker') {
          stats[type].count = count;
          total += count;
        }
      });
      
      // パーセンテージを計算
      if (total > 0) {
        stats.total = total;
        Object.keys(stats).forEach(key => {
          if (key !== 'total') {
            const typedKey = key as 'giver' | 'matcher' | 'taker';
            stats[typedKey].percentage = Math.round((stats[typedKey].count / total) * 100);
          }
        });
      }
      
      return NextResponse.json(stats);
    } catch (dbError) {
      console.error('データベースエラー:', dbError);
      console.log('モックデータを使用します');
      
      // データベースエラーの場合はモックデータを返す
      return NextResponse.json(mockStats);
    }
  } catch (error) {
    console.error('統計の取得に失敗しました:', error);
    return NextResponse.json(
      { error: '統計の取得に失敗しました' },
      { status: 500 }
    );
  }
} 