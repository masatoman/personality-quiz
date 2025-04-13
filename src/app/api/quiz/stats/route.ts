import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface TypeStats {
  type: string;
  count: number;
}

interface StatsData {
  [key: string]: {
    count: number;
    percentage: number;
  };
}

export async function GET() {
  try {
    const supabase = createClient();

    // 全体の回答数を取得
    const { count } = await supabase
      .from('results')
      .select('*', { count: 'exact' });

    const total = count || 0;

    // タイプごとの回答数を取得
    const { data: rawStats, error } = await supabase
      .rpc('get_type_counts');

    if (error) {
      throw error;
    }

    // タイプごとのパーセンテージを計算
    const stats: StatsData = {};
    (rawStats as TypeStats[] || []).forEach(type => {
      stats[type.type] = {
        count: type.count,
        percentage: total > 0 ? Math.round((type.count / total) * 100 * 10) / 10 : 0
      };
    });

    // 存在しないタイプのデータを0で初期化
    const allTypes = ['giver', 'taker', 'matcher'];
    allTypes.forEach(type => {
      if (!stats[type]) {
        stats[type] = {
          count: 0,
          percentage: 0
        };
      }
    });

    return NextResponse.json({
      total,
      stats
    });
  } catch (error) {
    console.error('統計取得エラー:', error);
    return NextResponse.json(
      { error: '統計取得エラー' },
      { status: 500 }
    );
  }
} 