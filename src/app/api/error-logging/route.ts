import { NextResponse } from 'next/server';

interface ErrorLogData {
  name: string;
  message: string;
  stack?: string;
  componentStack?: string;
  url: string;
  userAgent: string;
  timestamp: string;
}

export async function POST(request: Request) {
  try {
    const data: ErrorLogData = await request.json();
    
    // ログの検証と整形
    if (!data.name || !data.message) {
      return NextResponse.json({ error: 'Invalid error data' }, { status: 400 });
    }
    
    // 実際の環境ではここでログをデータベースや外部サービスに保存
    console.error('Client Error Logged:', {
      name: data.name,
      message: data.message,
      url: data.url,
      timestamp: data.timestamp,
      userAgent: data.userAgent.substring(0, 100), // 長すぎる場合は切り詰め
      // 開発環境のみスタックトレースを記録
      ...(process.env.NODE_ENV === 'development' && {
        stack: data.stack,
        componentStack: data.componentStack
      })
    });
    
    // 本番環境では外部サービスに送信
    // 例: Sentry, LogRocket, Datadog などの統合
    if (process.env.NODE_ENV === 'production') {
      // 以下はサンプルコード
      /*
      await fetch('https://logging-service.example.com/api/errors', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.LOGGING_API_KEY}`
        },
        body: JSON.stringify(data)
      });
      */
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging handler failed:', error);
    return NextResponse.json(
      { error: 'Internal server error in error logging' },
      { status: 500 }
    );
  }
} 