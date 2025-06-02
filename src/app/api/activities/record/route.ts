import { NextRequest, NextResponse } from 'next/server';
import { recordActivity, ActivityData } from '@/lib/supabase/user-activities';
import { checkAndAwardBadges } from '@/lib/supabase/badges';
import { getClient } from '@/lib/supabase/client';

// Dynamic Server Usage エラーを解決するため動的レンダリングを強制
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, activityData }: { userId: string; activityData: ActivityData } = body;

    if (!userId || !activityData?.activity_type) {
      return NextResponse.json(
        { success: false, error: 'ユーザーIDまたは活動データが不足しています' },
        { status: 400 }
      );
    }

    // 認証チェック
    const supabase = getClient();
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session?.user) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      );
    }

    // 自分の活動のみ記録可能
    if (session.user.id !== userId) {
      return NextResponse.json(
        { success: false, error: '他のユーザーの活動は記録できません' },
        { status: 403 }
      );
    }

    // 活動を記録
    const { data: activity, error: activityError } = await recordActivity(userId, activityData);
    
    if (activityError) {
      console.error('活動記録エラー:', activityError);
      return NextResponse.json(
        { success: false, error: '活動の記録に失敗しました' },
        { status: 500 }
      );
    }

    // バッジのチェックと付与
    const { data: newBadges, error: badgeError } = await checkAndAwardBadges(
      userId, 
      activityData.activity_type
    );

    if (badgeError) {
      console.error('バッジチェックエラー:', badgeError);
      // バッジ付与エラーは致命的ではないので、ログだけ出力
    }

    return NextResponse.json({
      success: true,
      data: {
        activity,
        newBadges: newBadges || [],
      },
    });

  } catch (error) {
    console.error('活動記録API エラー:', error);
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'ユーザーIDが必要です' },
        { status: 400 }
      );
    }

    // 認証チェック
    const supabase = getClient();
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session?.user) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      );
    }

    // 自分の活動のみ取得可能
    if (session.user.id !== userId) {
      return NextResponse.json(
        { success: false, error: '他のユーザーの活動は取得できません' },
        { status: 403 }
      );
    }

    // パラメータの解析
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;
    const activityType = searchParams.get('activity_type') || undefined;
    const startDate = searchParams.get('start_date') || undefined;
    const endDate = searchParams.get('end_date') || undefined;

    const { getUserActivities } = await import('@/lib/supabase/user-activities');
    const { data: activities, error } = await getUserActivities(userId, {
      limit,
      offset,
      activity_type: activityType as any,
      start_date: startDate,
      end_date: endDate,
    });

    if (error) {
      console.error('活動履歴取得エラー:', error);
      return NextResponse.json(
        { success: false, error: '活動履歴の取得に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: activities,
    });

  } catch (error) {
    console.error('活動履歴取得API エラー:', error);
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
} 