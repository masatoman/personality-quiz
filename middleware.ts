import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 認証が必要なパスの定義
  const authRequired = [
    '/dashboard',
    '/profile',
    '/settings',
  ];

  // 現在のパスが認証必要かチェック
  const isAuthRequired = authRequired.some(path => 
    req.nextUrl.pathname.startsWith(path)
  );

  // 認証が必要なパスで未認証の場合
  if (isAuthRequired && !session) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // ログイン済みユーザーがauth関連ページにアクセスした場合
  if (session && (
    req.nextUrl.pathname === '/login' ||
    req.nextUrl.pathname === '/signup'
  )) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/dashboard';
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api (API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
}; 