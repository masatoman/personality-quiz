import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// Dynamic Server Usage エラーを解決するため動的レンダリングを強制
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// モック月間ランキングデータを生成
const generateMockMonthlyRankings = () => {
  const mockUsers = [
    { id: '1', username: 'ギバー太郎', score: 2850 },
    { id: '2', username: 'マッチャー花子', score: 2640 },
    { id: '3', username: 'テイカー次郎', score: 2160 },
    { id: '4', username: '学習者A', score: 1950 },
    { id: '5', username: '学習者B', score: 1770 },
    { id: '6', username: '学習者C', score: 1650 },
    { id: '7', username: '学習者D', score: 1420 },
    { id: '8', username: '学習者E', score: 1280 }
  ];

  return mockUsers.map((user, index) => ({
    id: user.id,
    username: user.username,
    score: user.score,
    rank: index + 1,
    activityCount: Math.floor(Math.random() * 50) + 20,
    lastActive: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
  }));
};

export async function GET() {
  try {
    const supabase = createClient();

    // データベース接続テスト
    const { error: testError } = await supabase
      .from('materials')
      .select('id')
      .limit(1);

    if (testError) {
      console.log('データベース接続エラー、モックデータを使用します:', testError);
      return NextResponse.json({
        data: generateMockMonthlyRankings(),
        timestamp: new Date().toISOString(),
        status: 'mock_data',
        message: 'モックデータを使用しています'
      });
    }

    // 実際のデータ取得を試みる
    try {
      const { data: quizResults, error: quizError } = await supabase
        .from('quiz_results')
        .select('user_id, giver_score, taker_score, matcher_score, created_at')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(200);

      if (!quizError && quizResults && quizResults.length > 0) {
        // スコア集計
        const userScores = new Map();
        quizResults.forEach((result: any) => {
          const userId = result.user_id;
          const totalScore = (result.giver_score || 0) + (result.taker_score || 0) + (result.matcher_score || 0);
          
          if (!userScores.has(userId)) {
            userScores.set(userId, {
              user_id: userId,
              username: `ユーザー${userId.substring(0, 8)}`,
              total_score: 0,
              activity_count: 0,
              last_activity: result.created_at
            });
          }
          
          const userScore = userScores.get(userId);
          userScore.total_score += totalScore;
          userScore.activity_count += 1;
          if (result.created_at > userScore.last_activity) {
            userScore.last_activity = result.created_at;
          }
        });

        const sortedRankings = Array.from(userScores.values())
          .sort((a, b) => b.total_score - a.total_score)
          .slice(0, 15)
          .map((user, index) => ({
            id: user.user_id,
            username: user.username,
            score: user.total_score,
            rank: index + 1,
            activityCount: user.activity_count,
            lastActive: user.last_activity
          }));

        return NextResponse.json({
          data: sortedRankings,
          timestamp: new Date().toISOString(),
          status: 'success',
          totalUsers: sortedRankings.length
        });
      }
    } catch (queryError) {
      console.log('クエリエラー、モックデータを使用します:', queryError);
    }

    // フォールバック: モックデータを返す
    return NextResponse.json({
      data: generateMockMonthlyRankings(),
      timestamp: new Date().toISOString(),
      status: 'mock_data',
      message: 'モックデータを使用しています'
    });

  } catch (error) {
    console.error('月間ランキング取得エラー:', error);
    
    return NextResponse.json({
      data: generateMockMonthlyRankings(),
      timestamp: new Date().toISOString(),
      status: 'error_fallback',
      message: 'エラーが発生したため、モックデータを使用しています'
    }, { status: 200 });
  }
} 