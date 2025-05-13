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
  '/login',       // ログインページ
  '/',            // トップページ
  '/quiz',        // ギバー診断
  '/auth',        // 認証関連ページ
  '/welcome',     // 新規ユーザーウェルカム
  '/explore',     // 教材探索
  '/materials'    // 公開教材一覧
];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 公開パスの場合はスキップ
  if (publicPaths.some(publicPath => path.startsWith(publicPath))) {
    return NextResponse.next();
  }

  // 認証が必要なパスかチェック
  if (authRequiredPaths.some(authPath => path.startsWith(authPath))) {
    // セッショントークンの確認
    const session = request.cookies.get('session');
    const authToken = request.cookies.get('auth-token');

    // 認証情報が不足している場合
    if (!session && !authToken) {
      console.log(`🔒 未認証アクセスを検出: ${path}`);
      
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.search = `?redirect=${encodeURIComponent(path)}`;
      
      // リダイレクトレスポンスにセキュリティヘッダーを追加
      const response = NextResponse.redirect(url);
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('X-XSS-Protection', '1; mode=block');
      
      return response;
    }

    // 認証情報があれば次のミドルウェアへ
    const response = NextResponse.next();
    
    // セキュリティヘッダーの追加
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 