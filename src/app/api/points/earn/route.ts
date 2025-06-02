import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, setRateLimitHeaders, RateLimitPresets } from '@/lib/rate-limit';

// ポイント獲得処理
export async function POST(request: NextRequest) {
  try {
    // Rate Limiting チェック - ポイント獲得は厳しい制限を適用
    const rateLimitResult = checkRateLimit(request, RateLimitPresets.STRICT);
    
    if (rateLimitResult.isBlocked) {
      const response = NextResponse.json(
        { 
          error: 'Too many requests. Please try again later.',
          message: 'Rate limit exceeded for point earning'
        },
        { status: 429 }
      );
      setRateLimitHeaders(response.headers, rateLimitResult, RateLimitPresets.STRICT);
      return response;
    }

    const supabase = createClient();
    
    // 認証確認
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      const response = NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
      setRateLimitHeaders(response.headers, rateLimitResult, RateLimitPresets.STRICT);
      return response;
    }
    
    const { activity_type, points, metadata } = await request.json();
    
    if (!activity_type || !points || points <= 0) {
      const response = NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
      setRateLimitHeaders(response.headers, rateLimitResult, RateLimitPresets.STRICT);
      return response;
    }
    
    // ポイント獲得処理
    const { data: transaction, error } = await supabase
      .from('point_transactions')
      .insert({
        user_id: user.id,
        transaction_type: 'earned',
        points: points,
        activity_type: activity_type,
        metadata: metadata || {},
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('ポイント獲得エラー:', error);
      const response = NextResponse.json(
        { error: 'ポイントの獲得に失敗しました' },
        { status: 500 }
      );
      setRateLimitHeaders(response.headers, rateLimitResult, RateLimitPresets.STRICT);
      return response;
    }
    
    // ユーザーの総ポイントを更新
    const { error: updateError } = await supabase
      .from('user_points')
      .upsert({
        user_id: user.id,
        total_points: points,
        last_earned_at: new Date().toISOString()
      }, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      });
    
    if (updateError) {
      console.error('ポイント更新エラー:', updateError);
    }
    
    const response = NextResponse.json({
      success: true,
      transaction,
      earnedPoints: points
    });
    
    // Rate Limit情報をヘッダーに追加
    setRateLimitHeaders(response.headers, rateLimitResult, RateLimitPresets.STRICT);
    
    return response;
  } catch (error) {
    console.error('ポイント獲得API例外:', error);
    const response = NextResponse.json(
      { error: 'ポイント獲得中にエラーが発生しました' },
      { status: 500 }
    );
    return response;
  }
} 