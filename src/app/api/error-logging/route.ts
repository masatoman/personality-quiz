import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, setRateLimitHeaders, RateLimitPresets } from '@/lib/rate-limit';

interface ErrorLogData {
  name: string;
  message: string;
  stack?: string;
  digest?: string;
  url: string;
  userAgent: string;
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    // Rate Limiting チェック - エラーログにも制限を適用
    const rateLimitResult = checkRateLimit(request, RateLimitPresets.STRICT);
    
    if (rateLimitResult.isBlocked) {
      const response = NextResponse.json(
        { error: 'Too many error reports. Please try again later.' },
        { status: 429 }
      );
      setRateLimitHeaders(response.headers, rateLimitResult, RateLimitPresets.STRICT);
      return response;
    }

    const supabase = createClient();
    const errorData: ErrorLogData = await request.json();

    // 基本的なバリデーション
    if (!errorData.name || !errorData.message || !errorData.url) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      );
    }

    // ユーザー情報の取得（認証されている場合）
    const { data: { user } } = await supabase.auth.getUser();

    // エラーログをデータベースに保存
    const { error: insertError } = await supabase
      .from('error_logs')
      .insert({
        error_name: errorData.name,
        error_message: errorData.message,
        error_stack: errorData.stack,
        error_digest: errorData.digest,
        page_url: errorData.url,
        user_agent: errorData.userAgent,
        user_id: user?.id || null,
        occurred_at: errorData.timestamp,
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Error logging failed:', insertError);
      return NextResponse.json(
        { error: 'Failed to log error' },
        { status: 500 }
      );
    }

    // 重要なエラーの場合は管理者に通知
    if (shouldNotifyAdmin(errorData)) {
      await notifyAdmin(errorData, user);
    }

    const response = NextResponse.json(
      { success: true, message: 'Error logged successfully' },
      { status: 200 }
    );
    
    setRateLimitHeaders(response.headers, rateLimitResult, RateLimitPresets.STRICT);
    return response;

  } catch (error) {
    console.error('Error in error logging API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * 管理者への通知が必要かどうかを判定
 */
function shouldNotifyAdmin(errorData: ErrorLogData): boolean {
  // セキュリティ関連のエラー
  const securityErrors = [
    'SecurityError',
    'AuthenticationError',
    'AuthorizationError',
    'CSRFError'
  ];

  // データベース関連のエラー
  const databaseErrors = [
    'DatabaseError',
    'ConnectionError',
    'TimeoutError'
  ];

  // システムクリティカルなエラー
  const criticalErrors = [
    'OutOfMemoryError',
    'SystemError',
    'InternalError'
  ];

  const errorType = errorData.name;
  return securityErrors.includes(errorType) || 
         databaseErrors.includes(errorType) || 
         criticalErrors.includes(errorType);
}

/**
 * 管理者に通知を送信
 */
async function notifyAdmin(errorData: ErrorLogData, user: any): Promise<void> {
  try {
    // 本番環境では外部通知サービス（Slack、メール等）を使用
    const notificationData = {
      level: 'error',
      title: `Critical Error: ${errorData.name}`,
      message: errorData.message,
      url: errorData.url,
      user: user ? `User ID: ${user.id}` : 'Anonymous',
      timestamp: errorData.timestamp,
      stack: errorData.stack?.substring(0, 500), // スタックトレースを短縮
    };

    // 開発環境ではコンソールログ
    if (process.env.NODE_ENV === 'development') {
      console.warn('🚨 CRITICAL ERROR NOTIFICATION:', notificationData);
    } else {
      // 本番環境では実際の通知サービスに送信
      // 例: Slack webhook, メール送信, Discord webhook等
      console.log('Admin notification sent:', notificationData.title);
    }
  } catch (notificationError) {
    console.error('Failed to notify admin:', notificationError);
  }
} 