import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 認証が必要なパス
const authRequiredPaths = [
  '/dashboard',
  '/create',
  '/settings',
  '/profile',
  '/my-materials',
  '/notifications',
  '/result'
];

// 認証をバイパスするパス（API、静的ファイルなど）
const publicPaths = [
  '/api/auth',    // 認証API
  '/api/test-supabase', // Supabaseテストエンドポイント
  '/auth',        // 認証関連ページ全般
  '/',            // トップページ
  '/quiz',        // ギバー診断
  '/welcome',     // 新規ユーザーウェルカム
  '/explore',     // 教材探索
  '/materials'    // 公開教材一覧
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 公開パスの場合はスキップ
  if (publicPaths.some(publicPath => path.startsWith(publicPath))) {
    return NextResponse.next();
  }

  // 認証が必要なパスかチェック
  if (authRequiredPaths.some(authPath => path.startsWith(authPath))) {
    
    // Supabase認証チェック
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase環境変数が設定されていません');
      return redirectToLogin(request, path);
    }

    try {
      // Supabaseクライアントを作成
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // リクエストからセッション情報を取得
      const authHeader = request.headers.get('authorization');
      const sessionToken = request.cookies.get('sb-access-token')?.value ||
                          request.cookies.get('supabase-auth-token')?.value;
      
      if (!sessionToken && !authHeader) {
        console.log(`🔒 未認証アクセスを検出: ${path}`);
        return redirectToLogin(request, path);
      }

      // セッション検証（簡易版 - 本格的な検証はAPIレベルで実施）
      if (sessionToken) {
        try {
          // JWTの基本的な形式チェック
          const parts = sessionToken.split('.');
          if (parts.length !== 3) {
            throw new Error('Invalid JWT format');
          }
          
          // Base64デコードでペイロードを確認
          const payload = JSON.parse(atob(parts[1]));
          
          // 有効期限チェック
          if (payload.exp && Date.now() >= payload.exp * 1000) {
            console.log('🕐 セッション期限切れ:', path);
            return redirectToLogin(request, path);
          }
          
        } catch (jwtError) {
          console.log('🔒 不正なセッショントークン:', path);
          return redirectToLogin(request, path);
        }
      }

    } catch (error) {
      console.error('認証ミドルウェアエラー:', error);
      return redirectToLogin(request, path);
    }

    // 認証成功時のレスポンス
    const response = NextResponse.next();
    
    // セキュリティヘッダーの追加
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    return response;
  }

  return NextResponse.next();
}

// ログインページへのリダイレクト関数
function redirectToLogin(request: NextRequest, originalPath: string) {
  const url = request.nextUrl.clone();
  url.pathname = '/auth/login';
  url.search = `?redirect=${encodeURIComponent(originalPath)}`;
  
  const response = NextResponse.redirect(url);
  
  // セキュリティヘッダーの追加
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/webhook (webhook endpoints)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/webhook).*)',
  ],
}; 