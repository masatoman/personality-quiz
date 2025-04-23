import { NextRequest } from 'next/server';
import { securityMiddleware } from '../security';

// Redisクライアントのモック
jest.mock('ioredis', () => require('ioredis-mock'));

describe('Security Middleware', () => {
  let req: NextRequest;

  beforeEach(() => {
    req = new NextRequest('http://localhost:3000/api/test', {
      method: 'GET',
    });
  });

  it('セキュリティヘッダーが正しく設定されていること', async () => {
    const res = await securityMiddleware(req);
    
    expect(res.headers.get('X-DNS-Prefetch-Control')).toBe('off');
    expect(res.headers.get('X-Frame-Options')).toBe('DENY');
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(res.headers.get('Referrer-Policy')).toBe('origin-when-cross-origin');
  });

  it('GETリクエスト時にCSRFトークンが生成されること', async () => {
    const res = await securityMiddleware(req);
    const setCookie = res.headers.get('Set-Cookie');
    
    expect(setCookie).toBeDefined();
    expect(setCookie).toContain('CSRF-Token=');
  });

  it('POSTリクエスト時に無効なCSRFトークンの場合403エラーが返ること', async () => {
    req = new NextRequest('http://localhost:3000/api/test', {
      method: 'POST',
      headers: {
        'X-CSRF-Token': 'invalid-token',
        Cookie: 'CSRF-Token=different-token',
      },
    });

    const res = await securityMiddleware(req);
    expect(res.status).toBe(403);
  });

  it('レート制限が正しく動作すること', async () => {
    // 10回までのリクエストは許可
    for (let i = 0; i < 10; i++) {
      const res = await securityMiddleware(req);
      expect(res.status).toBe(200);
    }

    // 11回目のリクエストは制限
    const res = await securityMiddleware(req);
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBeDefined();
  });
}); 