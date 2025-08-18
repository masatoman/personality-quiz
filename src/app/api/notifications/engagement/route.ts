import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationType, userId } = body;

    if (!notificationType || !userId) {
      return NextResponse.json(
        { error: 'notificationTypeとuserIdが必要です' },
        { status: 400 }
      );
    }

    // ユーザーの最後の活動を確認
    const { data: lastActivity } = await supabase
      .from('activities')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const now = new Date();
    const lastActivityDate = lastActivity ? new Date(lastActivity.created_at) : null;
    const daysSinceLastActivity = lastActivityDate 
      ? Math.floor((now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    let notificationMessage = '';
    let notificationType_ = '';

    switch (notificationType) {
      case 'welcome_back':
        if (daysSinceLastActivity >= 3) {
          notificationMessage = '久しぶりですね！新しい教材が追加されています。ぜひチェックしてみてください。';
          notificationType_ = 'engagement';
        }
        break;
      
      case 'new_material':
        notificationMessage = '新しい教材が追加されました！あなたの知識を共有してみませんか？';
        notificationType_ = 'material';
        break;
      
      case 'community_activity':
        notificationMessage = 'コミュニティで新しいコメントが投稿されました。あなたの意見も聞かせてください。';
        notificationType_ = 'community';
        break;
      
      case 'progress_reminder':
        if (daysSinceLastActivity >= 7) {
          notificationMessage = '学習の進捗はいかがですか？継続は力なりです！';
          notificationType_ = 'progress';
        }
        break;
      
      default:
        return NextResponse.json(
          { error: '無効な通知タイプです' },
          { status: 400 }
        );
    }

    if (!notificationMessage) {
      return NextResponse.json({
        success: true,
        message: '通知は不要です',
        shouldNotify: false
      });
    }

    // 通知をデータベースに保存（実際の実装では通知テーブルを作成）
    // 現在はactivitiesテーブルに記録
    const { data: notificationActivity, error: notificationError } = await supabase
      .from('activities')
      .insert({
        user_id: userId,
        activity_type: 'notification_sent',
        reference_id: notificationType_,
        reference_type: 'notification',
        points: 0,
        description: notificationMessage,
        metadata: {
          notification_type: notificationType_,
          days_since_last_activity: daysSinceLastActivity
        }
      })
      .select()
      .single();

    if (notificationError) {
      throw notificationError;
    }

    return NextResponse.json({
      success: true,
      notification: {
        id: notificationActivity.id,
        message: notificationMessage,
        type: notificationType_,
        shouldNotify: true
      }
    });

  } catch (error) {
    console.error('Engagement notification error:', error);
    return NextResponse.json(
      { error: '通知の送信中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// ユーザーのエンゲージメント状況を取得
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userIdが必要です' },
        { status: 400 }
      );
    }

    // ユーザーの活動履歴を取得
    const { data: activities } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    // エンゲージメントスコアを計算
    const now = new Date();
    const lastActivity = activities?.[0];
    const lastActivityDate = lastActivity ? new Date(lastActivity.created_at) : null;
    const daysSinceLastActivity = lastActivityDate 
      ? Math.floor((now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    // 過去30日間の活動頻度
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentActivities = activities?.filter(a => 
      new Date(a.created_at) >= thirtyDaysAgo
    ) || [];

    const engagementScore = Math.min(100, Math.max(0, 
      100 - (daysSinceLastActivity * 10) + (recentActivities.length * 5)
    ));

    return NextResponse.json({
      success: true,
      engagement: {
        userId,
        lastActivityDate: lastActivityDate?.toISOString(),
        daysSinceLastActivity,
        recentActivityCount: recentActivities.length,
        engagementScore: Math.round(engagementScore),
        shouldSendNotification: daysSinceLastActivity >= 3,
        recommendedActions: daysSinceLastActivity >= 7 ? [
          '新しい教材をチェック',
          'コミュニティに参加',
          '学習進捗を確認'
        ] : []
      }
    });

  } catch (error) {
    console.error('Engagement analysis error:', error);
    return NextResponse.json(
      { error: 'エンゲージメント分析中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
