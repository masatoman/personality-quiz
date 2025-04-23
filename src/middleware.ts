import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuthCookie, validateSession } from '@/lib/auth';
import { securityMiddleware } from './middleware/security';

// 認証が必要なパス
const authRequiredPaths = [
  '/dashboard',
  '/create',
  '/settings',
  '/profile',
  '/my-materials'
];

// 認証をバイパスするパス（API、静的ファイル、公開ページなど）
const publicPaths = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/',
  '/about',
  '/explore',
  '/welcome',
  '/terms',
  '/privacy',
  '/test-ui'
];

export async function middleware(request: NextRequest) {
  // セキュリティミドルウェアの適用
  const securityResponse = await securityMiddleware(request);
  if (securityResponse.status !== 200) {
    return securityResponse;
  }

  const { pathname } = request.nextUrl;

  // 公開パスの場合はスキップ
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // APIルートの場合
  if (pathname.startsWith('/api/')) {
    return handleApiRoute(request);
  }

  // 認証が必要なパスの場合
  if (authRequiredPaths.some(path => pathname.startsWith(path))) {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return redirectToLogin(request);
    }

    try {
      const isValid = await validateSession(token);
      if (!isValid) {
        return redirectToLogin(request);
      }
    } catch (error) {
      console.error('Session validation error:', error);
      return redirectToLogin(request);
    }
  }

  return NextResponse.next();
}

async function handleApiRoute(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    return NextResponse.json(
      { message: '認証されていません' },
      { status: 401 }
    );
  }

  try {
    const isValid = await validateSession(token);
    if (!isValid) {
      return NextResponse.json(
        { message: 'セッションが無効です' },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: '認証エラーが発生しました' },
      { status: 500 }
    );
  }

  return NextResponse.next();
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('redirectTo', request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    // APIルートに適用
    '/api/:path*',
    // 認証が必要なページに適用
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/my-materials/:path*',
    '/create/:path*'
  ],
}; 