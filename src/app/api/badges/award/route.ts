import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { auth, getUserAuth } from '@/lib/auth';
import { BadgeType, BadgeRequirement } from '@/types/badges';
import { BADGE_DEFINITIONS } from '@/data/badges';
import { PostgrestError } from '@supabase/supabase-js';
import { ActivitySummary } from '@/types/activitySummary';

// バッジ獲得状況をチェックするAPIルート
export async function POST(request: NextRequest) {
  try {
    // リクエストボディを取得
    const requestData = await request.json();
    const { userId, activityType, resourceId } = requestData;

    // 必須パラメータの検証
    if (!userId || !activityType) {
      return NextResponse.json(
        { error: 'ユーザーIDとアクティビティタイプが必要です' },
        { status: 400 }
      );
    }

    // 管理者のみがバッジを手動で付与できる
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'このアクションを実行する権限がありません' },
        { status: 403 }
      );
    }

    // Supabaseクライアントを作成
    const supabase = createClient();

    // ユーザーアクティビティを記録
    const { error: activityError } = await supabase
      .from('user_activities')
      .insert({
        user_id: userId,
        activity_type: activityType,
        resource_id: resourceId || null,
        created_at: new Date().toISOString()
      });

    if (activityError) {
      console.error('アクティビティ記録エラー:', activityError);
      return NextResponse.json(
        { error: 'アクティビティの記録中にエラーが発生しました' },
        { status: 500 }
      );
    }

    // ユーザーの現在のアクティビティの集計を取得
    const { data: activitySummary, error: summaryError } = await supabase
      .from('user_activities_summary')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (summaryError && summaryError.code !== 'PGRST116') { // PGRST116: 結果が見つからない
      console.error('アクティビティ集計取得エラー:', summaryError);
      return NextResponse.json(
        { error: 'ユーザーのアクティビティ情報の取得中にエラーが発生しました' },
        { status: 500 }
      );
    }

    // 現在のバッジ獲得状況を取得
    const { data: currentBadges, error: badgesError } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', userId);

    if (badgesError) {
      console.error('バッジ情報取得エラー:', badgesError);
      return NextResponse.json(
        { error: 'バッジ情報の取得中にエラーが発生しました' },
        { status: 500 }
      );
    }

    // 獲得済みバッジのIDリスト
    const acquiredBadgeIds = (currentBadges || []).map(badge => badge.badge_id);

    // 新しく獲得したバッジを保存する配列
    const newlyAcquiredBadges = [];

    // 各バッジの要件をチェックし、獲得条件を満たしているか確認
    for (const badgeKey in BADGE_DEFINITIONS) {
      const badge = BADGE_DEFINITIONS[badgeKey as BadgeType];
      
      // すでに獲得しているバッジはスキップ
      if (acquiredBadgeIds.includes(badge.id)) {
        continue;
      }

      // すべての要件を満たしているかどうかをチェック
      const allRequirementsMet = badge.requirements.every(req => {
        return checkRequirement(req, activitySummary, activityType);
      });

      // すべての要件を満たしていれば、バッジを獲得
      if (allRequirementsMet) {
        const { error: insertError } = await supabase
          .from('user_badges')
          .insert({
            user_id: userId,
            badge_id: badge.id,
            acquired_at: new Date().toISOString(),
            progress: 100
          }) as { error: PostgrestError | null };

        if (insertError) {
          console.error(`バッジ ${badge.id} の追加エラー:`, insertError?.message || '不明なエラー');
        } else {
          newlyAcquiredBadges.push(badge);
          
          // 通知を作成
          await supabase
            .from('notifications')
            .insert({
              user_id: userId,
              type: 'badge_earned',
              title: 'バッジを獲得しました！',
              content: `「${badge.name}」バッジを獲得しました。おめでとうございます！`,
              is_read: false,
              created_at: new Date().toISOString(),
              metadata: JSON.stringify({ badgeId: badge.id })
            });
        }
      }
    }

    // レスポンスを返す
    return NextResponse.json({
      success: true,
      newBadges: newlyAcquiredBadges,
      totalAcquired: acquiredBadgeIds.length + newlyAcquiredBadges.length
    });

  } catch (error) {
    console.error('Error awarding badge:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// バッジ要件を満たしているかチェックする関数
function checkRequirement(
  requirement: BadgeRequirement,
  activitySummary: ActivitySummary | null,
  currentActivityType: string
): boolean {
  if (!activitySummary) return false;

  const activityCount = activitySummary[`${requirement.activityType}_count`] || 0;
  
  // アクティビティタイプに応じた特別なチェック
  if (requirement.activityType === 'daily_login' && requirement.condition === 'consecutive') {
    // 連続学習日数のチェック
    return activitySummary.current_streak >= requirement.count;
  } else if (requirement.activityType === 'complete_resource' && requirement.metadata?.unique_categories) {
    // 完了率のチェック（パーセンテージ）
    const totalResources = activitySummary.total_resources || 0;
    if (totalResources === 0) return false;
    const completionRate = (activitySummary.completed_resources / totalResources) * 100;
    return completionRate >= requirement.count;
  } else {
    // 標準的なカウントベースのチェック
    return activityCount >= requirement.count;
  }
} 