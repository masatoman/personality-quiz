import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 環境変数の存在確認
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // セキュリティのためキーの最初と最後のみ表示
    const maskKey = (key: string | undefined) => {
      if (!key) return 'NOT_SET';
      if (key.length < 20) return 'INVALID_LENGTH';
      return `${key.substring(0, 10)}...${key.substring(key.length - 10)}`;
    };

    const envStatus = {
      NEXT_PUBLIC_SUPABASE_URL: {
        exists: !!supabaseUrl,
        value: supabaseUrl || 'NOT_SET',
        isValid: supabaseUrl?.includes('supabase.co') || false
      },
      NEXT_PUBLIC_SUPABASE_ANON_KEY: {
        exists: !!supabaseAnonKey,
        maskedValue: maskKey(supabaseAnonKey),
        isValid: supabaseAnonKey?.startsWith('eyJ') || false,
        length: supabaseAnonKey?.length || 0
      }
    };

    // 簡単なSupabase接続テスト
    let connectionTest = null;
    if (supabaseUrl && supabaseAnonKey) {
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/materials?select=id&limit=1`, {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        connectionTest = {
          status: response.status,
          statusText: response.statusText,
          canConnect: response.ok,
          error: response.ok ? null : await response.text()
        };
      } catch (error) {
        connectionTest = {
          status: 'ERROR',
          canConnect: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      envVariables: envStatus,
      connectionTest,
      recommendations: [
        !envStatus.NEXT_PUBLIC_SUPABASE_URL.exists && "NEXT_PUBLIC_SUPABASE_URL環境変数を設定してください",
        !envStatus.NEXT_PUBLIC_SUPABASE_ANON_KEY.exists && "NEXT_PUBLIC_SUPABASE_ANON_KEY環境変数を設定してください",
        !envStatus.NEXT_PUBLIC_SUPABASE_URL.isValid && "NEXT_PUBLIC_SUPABASE_URLが無効です",
        !envStatus.NEXT_PUBLIC_SUPABASE_ANON_KEY.isValid && "NEXT_PUBLIC_SUPABASE_ANON_KEYが無効です（JWT形式である必要があります）",
        connectionTest && !connectionTest.canConnect && `Supabase接続エラー: ${connectionTest.error}`
      ].filter(Boolean)
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 