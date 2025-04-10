import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getUserAuth } from '@/lib/auth';
import { Badge, UserBadge } from '@/types/badges';
import { LearningActivity } from '@/types/learning';

/**
 * ユーザーのバッジ進捗状況を更新するAPIエンドポイント
 * 
 * @param req リクエストオブジェクト
 * @returns バッジの更新結果またはエラーレスポンス
 */
export async function POST(req: NextRequest) {
  try {
    // ユーザー認証情報を取得
    const { user } = await getUserAuth();
    if (!user) {
      return NextResponse.json(
        { error: '認証されていません。' },
        { status: 401 }
      );
    }

    // リクエストボディからアクティビティデータを取得
    const data = await req.json();
    const activity: LearningActivity = data.activity;

    if (!activity || !activity.activityType) {
      return NextResponse.json(
        { error: '無効なアクティビティデータです。' },
        { status: 400 }
      );
    }

    // Supabaseクライアントを初期化
    const supabase = createClient();

    // ユーザーのバッジを取得
    const { data: userBadges, error: badgeError } = await supabase
      .from('user_badges')
      .select('*, badges(*)')
      .eq('user_id', user.id);

    if (badgeError) {
      console.error('バッジ取得エラー:', badgeError);
      return NextResponse.json(
        { error: 'バッジの取得中にエラーが発生しました。' },
        { status: 500 }
      );
    }

    // アクティビティに関連するバッジを更新
    const updatedBadges: UserBadge[] = [];
    const newlyAcquiredBadges: Badge[] = [];

    // ユーザーのアクティビティ統計を取得
    const { data: userStats, error: statsError } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (statsError && statsError.code !== 'PGRST116') { // レコードが見つからない場合を除く
      console.error('ユーザー統計取得エラー:', statsError);
      return NextResponse.json(
        { error: 'ユーザー統計の取得中にエラーが発生しました。' },
        { status: 500 }
      );
    }

    // ユーザー統計が存在しない場合は新規作成
    const stats = userStats || { user_id: user.id };

    // アクティビティタイプに基づいて統計を更新
    switch (activity.activityType) {
      case 'complete_resource':
        stats.completed_resources = (stats.completed_resources || 0) + 1;
        break;
      case 'start_resource':
        stats.started_resources = (stats.started_resources || 0) + 1;
        break;
      case 'create_material':
        stats.created_materials = (stats.created_materials || 0) + 1;
        break;
      case 'provide_feedback':
        stats.provided_feedbacks = (stats.provided_feedbacks || 0) + 1;
        break;
      case 'daily_login':
        stats.login_days = (stats.login_days || 0) + 1;
        break;
      case 'share_resource':
        stats.shared_resources = (stats.shared_resources || 0) + 1;
        break;
      case 'quiz_complete':
        stats.completed_quizzes = (stats.completed_quizzes || 0) + 1;
        break;
    }

    // 更新または作成されたユーザー統計を保存
    const { error: upsertStatsError } = await supabase
      .from('user_stats')
      .upsert(stats);

    if (upsertStatsError) {
      console.error('統計更新エラー:', upsertStatsError);
      return NextResponse.json(
        { error: '統計の更新中にエラーが発生しました。' },
        { status: 500 }
      );
    }

    // 各バッジの進捗を計算して更新
    for (const userBadge of userBadges || []) {
      if (userBadge.acquired) continue; // 既に獲得済みのバッジはスキップ
      
      const badge = userBadge.badges as Badge;
      let totalProgress = 0;
      let requirementsMet = true;
      
      // バッジの各要件をチェック
      for (const requirement of badge.requirements) {
        let count = 0;
        
        // 要件のアクティビティタイプに基づいてカウントを取得
        switch (requirement.activityType) {
          case 'complete_resource':
            count = stats.completed_resources || 0;
            break;
          case 'start_resource':
            count = stats.started_resources || 0;
            break;
          case 'create_material':
            count = stats.created_materials || 0;
            break;
          case 'provide_feedback':
            count = stats.provided_feedbacks || 0;
            break;
          case 'daily_login':
            count = stats.login_days || 0;
            break;
          case 'share_resource':
            count = stats.shared_resources || 0;
            break;
          case 'quiz_complete':
            count = stats.completed_quizzes || 0;
            break;
        }
        
        // 進捗率を計算（最大100%）
        const requirementProgress = Math.min(100, (count / requirement.count) * 100);
        totalProgress += requirementProgress / badge.requirements.length;
        
        // 要件が満たされていない場合
        if (count < requirement.count) {
          requirementsMet = false;
        }
      }
      
      // バッジのステータスを更新
      const updatedBadge: Partial<UserBadge> = {
        id: userBadge.id,
        progress: Math.round(totalProgress)
      };
      
      // すべての要件が満たされた場合、バッジを獲得
      if (requirementsMet) {
        updatedBadge.acquired = true;
        updatedBadge.acquired_at = new Date().toISOString();
        newlyAcquiredBadges.push(badge);
      }
      
      // バッジの更新が必要な場合
      if (updatedBadge.progress !== userBadge.progress || updatedBadge.acquired) {
        const { error: updateError } = await supabase
          .from('user_badges')
          .update(updatedBadge)
          .eq('id', userBadge.id);
        
        if (updateError) {
          console.error('バッジ更新エラー:', updateError);
          continue;
        }
        
        updatedBadges.push({ ...userBadge, ...updatedBadge });
      }
    }
    
    // 新しく獲得したバッジがある場合は通知を作成
    if (newlyAcquiredBadges.length > 0) {
      const notifications = newlyAcquiredBadges.map(badge => ({
        user_id: user.id,
        type: 'badge_acquired',
        message: `「${badge.name}」バッジを獲得しました！`,
        data: { badge },
        created_at: new Date().toISOString(),
        is_read: false
      }));
      
      await supabase.from('notifications').insert(notifications);
    }
    
    return NextResponse.json({
      success: true,
      updatedBadges,
      newlyAcquiredBadges
    });
    
  } catch (error) {
    console.error('バッジ更新中のエラー:', error);
    return NextResponse.json(
      { error: 'バッジの更新中に予期せぬエラーが発生しました。' },
      { status: 500 }
    );
  }
} 