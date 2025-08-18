import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = await new Request('').json();
    const { 
      surveyType, 
      responses, 
      userId 
    } = body;

    if (!surveyType || !responses || !userId) {
      return NextResponse.json(
        { error: 'surveyType、responses、userIdが必要です' },
        { status: 400 }
      );
    }

    // 40%ルールの質問と回答を処理
    let fortyPercentRuleScore = 0;
    let totalQuestions = 0;

    if (surveyType === 'forty_percent_rule') {
      const questions = [
        {
          id: 'service_importance',
          question: 'ShiftWithが使えなくなったら困りますか？',
          weight: 1.0
        },
        {
          id: 'learning_improvement',
          question: 'ShiftWithで英語学習が改善されましたか？',
          weight: 0.8
        },
        {
          id: 'community_value',
          question: '教え合いコミュニティに価値を感じますか？',
          weight: 0.9
        },
        {
          id: 'recommendation',
          question: '友人にShiftWithを勧めますか？',
          weight: 0.7
        },
        {
          id: 'daily_usage',
          question: 'ShiftWithを毎日使いたいですか？',
          weight: 0.6
        }
      ];

      questions.forEach(q => {
        const response = responses[q.id];
        if (response !== undefined) {
          totalQuestions++;
          // 5段階評価を0-1のスコアに変換
          const score = (response - 1) / 4; // 1→0, 5→1
          fortyPercentRuleScore += score * q.weight;
        }
      });

      fortyPercentRuleScore = totalQuestions > 0 
        ? (fortyPercentRuleScore / totalQuestions) * 100 
        : 0;
    }

    // フィードバックをデータベースに保存
    const { data: feedbackData, error: feedbackError } = await supabase
      .from('feedback')
      .insert({
        user_id: userId,
        survey_type: surveyType,
        responses: responses,
        forty_percent_rule_score: fortyPercentRuleScore,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (feedbackError) {
      throw feedbackError;
    }

    return NextResponse.json({
      success: true,
      feedback: {
        id: feedbackData.id,
        surveyType,
        fortyPercentRuleScore: Math.round(fortyPercentRuleScore),
        totalQuestions,
        createdAt: feedbackData.created_at
      }
    });

  } catch (error) {
    console.error('Feedback survey error:', error);
    return NextResponse.json(
      { error: 'アンケートの送信中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// 40%ルールの統計を取得
export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // 過去30日間の40%ルールアンケート結果を取得
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: feedbackResults } = await supabase
      .from('feedback')
      .select('forty_percent_rule_score, created_at')
      .eq('survey_type', 'forty_percent_rule')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .not('forty_percent_rule_score', 'is', null);

    if (!feedbackResults || feedbackResults.length === 0) {
      return NextResponse.json({
        success: true,
        fortyPercentRule: {
          averageScore: 0,
          totalResponses: 0,
          targetAchievement: 0,
          recentTrend: 'no_data'
        }
      });
    }

    const scores = feedbackResults.map(f => f.forty_percent_rule_score);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const targetAchievement = (averageScore / 40) * 100; // 40%が目標

    // 最近のトレンドを計算
    const recentScores = feedbackResults
      .filter(f => new Date(f.created_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      .map(f => f.forty_percent_rule_score);
    
    const recentAverage = recentScores.length > 0 
      ? recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length 
      : averageScore;

    let recentTrend = 'stable';
    if (recentAverage > averageScore * 1.1) recentTrend = 'improving';
    else if (recentAverage < averageScore * 0.9) recentTrend = 'declining';

    return NextResponse.json({
      success: true,
      fortyPercentRule: {
        averageScore: Math.round(averageScore),
        totalResponses: scores.length,
        targetAchievement: Math.round(targetAchievement),
        recentTrend,
        targetScore: 40
      }
    });

  } catch (error) {
    console.error('Forty percent rule analysis error:', error);
    return NextResponse.json(
      { error: '40%ルール分析中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
