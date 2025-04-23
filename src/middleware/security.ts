import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { nanoid } from 'nanoid';

// Redisクライアントの初期化
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// レートリミッターの設定
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10秒間に10リクエスト
  analytics: true,
});

// CSRFトークンの検証
const validateCsrfToken = (request: NextRequest): boolean => {
  const csrfToken = request.headers.get('X-CSRF-Token');
  const cookieToken = request.cookies.get('csrf_token')?.value;
  
  if (!csrfToken || !cookieToken) {
    return false;
  }
  
  return csrfToken === cookieToken;
};

// CSRFトークンの生成
const generateCsrfToken = (): string => {
  return nanoid(32);
};

export async function securityMiddleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  // 静的ファイルやテストページはスキップ
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/public') ||
    pathname === '/test-ui' ||
    pathname.startsWith('/test-ui/')
  ) {
    return response;
  }
  
  // セキュリティヘッダーの設定
  const securityHeaders = {
    'X-DNS-Prefetch-Control': 'off',
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self';
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      block-all-mixed-content;
      upgrade-insecure-requests;
    `.replace(/\s+/g, ' ').trim()
  };
  
  // ヘッダーの適用
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // POSTリクエストに対するCSRF保護
  if (request.method === 'POST') {
    if (!validateCsrfToken(request)) {
      return new NextResponse(
        JSON.stringify({ error: 'CSRF token validation failed' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }
  
  // レートリミットの適用
  const ip = request.ip ?? '127.0.0.1';
  const { success, limit, reset, remaining } = await ratelimit.limit(ip);
  
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', reset.toString());
  
  if (!success) {
    return new NextResponse(
      JSON.stringify({ error: 'Too many requests' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  // 新しいCSRFトークンの生成（GETリクエストの場合）
  if (request.method === 'GET' && !request.cookies.get('csrf_token')) {
    const newCsrfToken = generateCsrfToken();
    response.cookies.set('csrf_token', newCsrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
  }
  
  return response;
} 