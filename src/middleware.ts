import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

// セキュリティヘッダーを設定する関数
function setSecurityHeaders(response: NextResponse): NextResponse {
  // 基本セキュリティヘッダー
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // コンテンツセキュリティポリシー
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://va.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://*.supabase.co https://vercel.live wss://*.supabase.co",
    "media-src 'self' data: blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);
  
  // その他のセキュリティヘッダー
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('X-Download-Options', 'noopen');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  
  return response;
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 公開パスの場合はスキップ（ただしセキュリティヘッダーは適用）
  if (publicPaths.some(publicPath => path.startsWith(publicPath))) {
    const response = NextResponse.next();
    return setSecurityHeaders(response);
  }

  // 認証が必要なパスかチェック
  if (authRequiredPaths.some(authPath => path.startsWith(authPath))) {
    
    // 開発環境でSKIP_AUTHが有効な場合は認証をスキップ
    const skipAuth = process.env.NEXT_PUBLIC_SKIP_AUTH === 'true';
    const isDevMode = process.env.NODE_ENV === 'development';
    
    if (isDevMode && skipAuth) {
      console.log(`🚧 開発モード: 認証をスキップ - ${path}`);
      const response = NextResponse.next();
      // 開発モードであることを示すヘッダーを追加
      response.headers.set('X-Dev-Mode', 'true');
      response.headers.set('X-Auth-Skipped', 'true');
      return setSecurityHeaders(response);
    }
    
    // Supabase認証チェック
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase環境変数が設定されていません');
      return setSecurityHeaders(redirectToLogin(request, path));
    }

    try {
      // リクエストからセッション情報を取得
      const authHeader = request.headers.get('authorization');
      const sessionToken = request.cookies.get('sb-access-token')?.value ||
                          request.cookies.get('supabase-auth-token')?.value;
      
      if (!sessionToken && !authHeader) {
        console.log(`🔒 未認証アクセスを検出: ${path}`);
        return setSecurityHeaders(redirectToLogin(request, path));
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
            return setSecurityHeaders(redirectToLogin(request, path));
          }
          
        } catch {
          console.log('🔒 不正なセッショントークン:', path);
          return setSecurityHeaders(redirectToLogin(request, path));
        }
      }

    } catch (error) {
      console.error('認証ミドルウェアエラー:', error);
      return setSecurityHeaders(redirectToLogin(request, path));
    }

    // 認証成功時のレスポンス
    const response = NextResponse.next();
    return setSecurityHeaders(response);
  }

  // その他のパスもセキュリティヘッダーを適用
  const response = NextResponse.next();
  return setSecurityHeaders(response);
}

// ログインページへのリダイレクト関数
function redirectToLogin(request: NextRequest, originalPath: string) {
  const url = request.nextUrl.clone();
  url.pathname = '/auth/login';
  url.search = `?redirect=${encodeURIComponent(originalPath)}`;
  
  const response = NextResponse.redirect(url);
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