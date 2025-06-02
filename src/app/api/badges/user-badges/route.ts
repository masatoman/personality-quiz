import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getUserAuth } from '@/lib/auth';
import { Badge } from '@/types/badges';
import { BADGE_DEFINITIONS } from '@/data/badges';

// Dynamic Server Usage エラーを解決するため動的レンダリングを強制
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface UserBadgeData {
  id: string;
  user_id: string;
  badge_id: string;
  acquired_at: string;  // DBのカラム名はスネークケース
  progress: number;
}

// ユーザーのバッジを取得するAPIルート
export async function GET(request: NextRequest) {
  try {
    // URLからクエリパラメータを取得
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    // ユーザーIDが提供されていない場合はエラー
    if (!userId) {
      return NextResponse.json(
        { error: 'ユーザーIDが必要です' },
        { status: 400 }
      );
    }

    // 認証チェック - 自分のデータまたは管理者のみがアクセス可能
    const user = await getUserAuth();
    if (!user || (user.id !== userId && user.role !== 'admin')) {
      return NextResponse.json(
        { error: 'このデータにアクセスする権限がありません' },
        { status: 403 }
      );
    }

    // Supabaseクライアントを作成
    const supabase = createClient();
    
    // ユーザーのバッジ情報を取得
    const { data: userBadges, error: badgesError } = await supabase
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

    // マスターデータと結合して完全なバッジ情報を作成
    const completeBadges: Badge[] = (userBadges as UserBadgeData[]).map(userBadge => {
      const badgeDefinition = Object.values(BADGE_DEFINITIONS).find(
        badge => badge.id === userBadge.badge_id
      );
      
      if (!badgeDefinition) {
        return null;
      }
      
      return {
        ...badgeDefinition,
        progress: userBadge.progress,
        acquiredAt: userBadge.acquired_at ? new Date(userBadge.acquired_at) : undefined
      };
    }).filter(Boolean) as Badge[];

    // 未獲得のバッジ情報も含める（進捗情報付き）
    const { data: userProgress } = await supabase
      .from('user_activities_summary')
      .select('*')
      .eq('user_id', userId)
      .single();

    // 全てのバッジ定義をループして、未獲得のバッジの進捗状況を計算
    const allBadges: Badge[] = [...completeBadges];
    
    // 未獲得のバッジを追加
    Object.values(BADGE_DEFINITIONS).forEach(badgeDefinition => {
      // すでに獲得済みの場合はスキップ
      if (completeBadges.some(badge => badge.id === badgeDefinition.id)) {
        return;
      }
      
      // 進捗状況を計算（単純化した計算例）
      let progress = 0;
      if (userProgress) {
        const requirement = badgeDefinition.requirements[0]; // 主要な要件を使用
        const activityCount = userProgress[`${requirement.activityType}_count`] || 0;
        progress = Math.min(100, Math.floor((activityCount / requirement.count) * 100));
      }
      
      allBadges.push({
        ...badgeDefinition,
        progress,
        acquiredAt: undefined
      });
    });

    // 獲得済みバッジを先頭に、その後は進捗率の高い順にソート
    allBadges.sort((a, b) => {
      // 獲得済みバッジを優先
      if (a.acquiredAt && !b.acquiredAt) return -1;
      if (!a.acquiredAt && b.acquiredAt) return 1;
      
      // 同じ獲得状態なら進捗率で比較
      return b.progress - a.progress;
    });

    // レスポンスを返す
    return NextResponse.json({
      badges: allBadges,
      acquired: completeBadges.length,
      total: Object.keys(BADGE_DEFINITIONS).length
    });
    
  } catch (error) {
    console.error('バッジ情報取得中の予期せぬエラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
} 