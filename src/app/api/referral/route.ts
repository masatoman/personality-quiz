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
    const { 
      referrerId, 
      referredEmail, 
      referralCode 
    } = body;

    if (!referrerId || !referredEmail) {
      return NextResponse.json(
        { error: 'referrerIdとreferredEmailが必要です' },
        { status: 400 }
      );
    }

    // 紹介コードを生成（既存のコードがない場合）
    const code = referralCode || `REF_${referrerId}_${Date.now()}`;

    // 紹介記録を保存
    const { data: referralData, error: referralError } = await supabase
      .from('activities')
      .insert({
        user_id: referrerId,
        activity_type: 'referral_sent',
        reference_id: referredEmail,
        reference_type: 'email',
        points: 10, // 紹介ボーナスポイント
        description: `紹介メールを送信: ${referredEmail}`,
        metadata: {
          referral_code: code,
          referred_email: referredEmail,
          status: 'pending'
        }
      })
      .select()
      .single();

    if (referralError) {
      throw referralError;
    }

    // 紹介メール送信（実際の実装ではメールサービスを使用）
    const emailContent = {
      to: referredEmail,
      subject: 'ShiftWithに招待されました！',
      body: `
        <h2>ShiftWithに招待されました！</h2>
        <p>あなたの友人がShiftWithを紹介しています。</p>
        <p>ShiftWithは「一人学習の孤独感を解決する教え合いコミュニティ」です。</p>
        <p>以下のリンクから登録してください：</p>
        <a href="http://localhost:3000/auth/signup?ref=${code}">ShiftWithに参加する</a>
        <p>紹介コード: ${code}</p>
      `
    };

    // 実際のメール送信は実装しない（開発環境のため）
    console.log('紹介メール送信:', emailContent);

    return NextResponse.json({
      success: true,
      referral: {
        id: referralData.id,
        code,
        email: referredEmail,
        status: 'sent',
        points: 10
      }
    });

  } catch (error) {
    console.error('Referral error:', error);
    return NextResponse.json(
      { error: '紹介の処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// 紹介統計を取得
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

    // 過去30日間の紹介活動を取得
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: referralActivities } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .eq('activity_type', 'referral_sent')
      .gte('created_at', thirtyDaysAgo.toISOString());

    // 紹介成功数（実際の実装では招待されたユーザーの登録を追跡）
    const { data: successfulReferrals } = await supabase
      .from('activities')
      .select('*')
      .eq('activity_type', 'referral_successful')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo.toISOString());

    const totalReferrals = referralActivities?.length || 0;
    const successfulReferralsCount = successfulReferrals?.length || 0;
    const conversionRate = totalReferrals > 0 
      ? (successfulReferralsCount / totalReferrals) * 100 
      : 0;

    // 紹介による獲得ポイント
    const totalPoints = referralActivities?.reduce((sum, activity) => 
      sum + (activity.points || 0), 0
    ) || 0;

    return NextResponse.json({
      success: true,
      referralStats: {
        userId,
        totalReferrals,
        successfulReferrals: successfulReferralsCount,
        conversionRate: Math.round(conversionRate),
        totalPoints,
        period: '30日間'
      }
    });

  } catch (error) {
    console.error('Referral stats error:', error);
    return NextResponse.json(
      { error: '紹介統計の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
