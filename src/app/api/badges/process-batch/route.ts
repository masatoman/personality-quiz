import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { auth } from '@/lib/auth';
import { BadgeType } from '@/types/badges';
import { BADGE_DEFINITIONS } from '@/data/badges';
import { BadgeEvaluator } from '@/utils/badgeEvaluator';

/**
 * バッジ評価のバッチ処理API
 * このAPIは管理者専用であり、スケジューラーから呼び出されることを想定しています
 */
export async function POST(request: NextRequest) {
  try {
    // 認証チェック - 管理者のみが実行可能
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: '権限がありません。この操作は管理者のみ実行できます。' },
        { status: 403 }
      );
    }

    // リクエストから処理対象のユーザー数を取得（デフォルトは100）
    const { batchSize = 100, processAll = false } = await request.json();

    // Supabaseクライアントを作成
    const supabase = createClient();
    
    // 処理対象のユーザーを取得
    // 最終バッジチェック日時から1日以上経過したユーザー、または未チェックのユーザーを優先
    let query = supabase
      .from('users')
      .select('id, last_badge_check')
      .is('is_active', true)
      .order('last_badge_check', { ascending: true });
    
    if (!processAll) {
      query = query.limit(batchSize);
    }
    
    const { data: users, error: usersError } = await query;

    if (usersError) {
      console.error('ユーザー取得エラー:', usersError);
      return NextResponse.json(
        { error: 'ユーザー情報の取得中にエラーが発生しました' },
        { status: 500 }
      );
    }

    // 処理結果を保存する配列
    const results: { userId: string; newBadges: string[] }[] = [];

    // 各ユーザーのバッジを評価・更新
    for (const user of users) {
      const newBadges = await processUserBadges(supabase, user.id);
      
      // 最終チェック日時を更新
      await supabase
        .from('users')
        .update({ last_badge_check: new Date().toISOString() })
        .eq('id', user.id);
      
      if (newBadges.length > 0) {
        results.push({
          userId: user.id,
          newBadges
        });
      }
    }

    // レスポンスを返す
    return NextResponse.json({
      success: true,
      processedUsers: users.length,
      newBadgesAwarded: results.length,
      details: results
    });

  } catch (error) {
    console.error('バッジバッチ処理中の予期せぬエラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

/**
 * ユーザーのバッジを評価・更新する関数
 */
async function processUserBadges(supabase: any, userId: string): Promise<string[]> {
  try {
    // ユーザーのアクティビティ集計を取得
    const { data: activitySummary, error: summaryError } = await supabase
      .from('user_activities_summary')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (summaryError && summaryError.code !== 'PGRST116') {
      console.error(`ユーザー ${userId} のアクティビティ取得エラー:`, summaryError);
      return [];
    }

    // 現在のバッジ獲得状況を取得
    const { data: currentBadges, error: badgesError } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', userId);

    if (badgesError) {
      console.error(`ユーザー ${userId} のバッジ情報取得エラー:`, badgesError);
      return [];
    }

    // 獲得済みバッジのIDリスト
    const acquiredBadgeIds = (currentBadges || []).map(badge => badge.badge_id);

    // 新しく獲得したバッジを保存する配列
    const newlyAcquiredBadges: string[] = [];

    // 各バッジの要件をチェックし、獲得条件を満たしているか確認
    for (const badgeKey in BADGE_DEFINITIONS) {
      const badge = BADGE_DEFINITIONS[badgeKey as BadgeType];
      
      // すでに獲得しているバッジはスキップ
      if (acquiredBadgeIds.includes(badge.id)) {
        continue;
      }

      // すべての要件を満たしているかどうかをチェック
      const allRequirementsMet = BadgeEvaluator.evaluateAllRequirements(
        badge.requirements,
        activitySummary || {}
      );

      // すべての要件を満たしていれば、バッジを獲得
      if (allRequirementsMet) {
        const { error: insertError } = await supabase
          .from('user_badges')
          .insert({
            user_id: userId,
            badge_id: badge.id,
            acquired_at: new Date().toISOString(),
            progress: 100
          });

        if (insertError) {
          console.error(`バッジ ${badge.id} の追加エラー:`, insertError);
        } else {
          newlyAcquiredBadges.push(badge.id);
          
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

    return newlyAcquiredBadges;
  } catch (error) {
    console.error(`ユーザー ${userId} のバッジ処理エラー:`, error);
    return [];
  }
} 