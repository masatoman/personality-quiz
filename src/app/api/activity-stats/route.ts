import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/session';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  const supabase = getSupabase();
  const userId = session.user.id;

  // 過去30日間のアクティビティを取得
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // 現在の統計を取得
  const { data: currentStats } = await supabase
    .from('user_activities')
    .select('activity_type, points')
    .eq('user_id', userId);

  // 30日前の統計を取得
  const { data: previousStats } = await supabase
    .from('user_activities')
    .select('activity_type, points')
    .eq('user_id', userId)
    .lt('created_at', thirtyDaysAgo.toISOString());

  // 統計を計算
  const calculateStats = (data: any[] = []) => {
    return {
      contributions: data.length,
      points: data.reduce((sum, item) => sum + (item.points || 0), 0),
      streak: 0, // TODO: ストリークの計算を実装
    };
  };

  const current = calculateStats(currentStats);
  const previous = calculateStats(previousStats);

  return NextResponse.json({
    stats: {
      contributions: {
        total: current.contributions,
        change: current.contributions - previous.contributions,
      },
      points: {
        total: current.points,
        change: current.points - previous.points,
      },
      streak: {
        total: current.streak,
        change: current.streak - previous.streak,
      },
    },
  });
} 