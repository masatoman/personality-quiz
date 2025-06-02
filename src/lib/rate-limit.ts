import { NextRequest } from 'next/server';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  identifier?: (request: NextRequest) => string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// メモリベースのレート制限ストレージ（本番環境ではRedisなどを使用することを推奨）
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Rate Limitingチェック関数
 * @param request NextRequest オブジェクト
 * @param config Rate Limit設定
 * @returns isBlocked: 制限されているか, remaining: 残り回数, resetTime: リセット時刻
 */
export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): {
  isBlocked: boolean;
  remaining: number;
  resetTime: number;
  totalRequests: number;
} {
  const now = Date.now();
  
  // 識別子を取得（IP、ユーザーID、またはカスタム識別子）
  const identifier = config.identifier 
    ? config.identifier(request)
    : getRequestIdentifier(request);
  
  // 既存のエントリを取得または新規作成
  let entry = rateLimitStore.get(identifier);
  
  if (!entry || now > entry.resetTime) {
    // 新規エントリまたは期間リセット
    entry = {
      count: 1,
      resetTime: now + config.windowMs
    };
  } else {
    // 既存エントリのカウンタ増加
    entry.count += 1;
  }
  
  rateLimitStore.set(identifier, entry);
  
  // 期限切れエントリのクリーンアップ（メモリ効率化）
  cleanupExpiredEntries();
  
  const isBlocked = entry.count > config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - entry.count);
  
  return {
    isBlocked,
    remaining,
    resetTime: entry.resetTime,
    totalRequests: entry.count
  };
}

/**
 * リクエストから識別子を取得
 */
function getRequestIdentifier(request: NextRequest): string {
  // 認証されたユーザーの場合はユーザーIDを使用
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    try {
      const token = authHeader.replace('Bearer ', '');
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.sub) {
        return `user:${payload.sub}`;
      }
    } catch {
      // JWTデコードエラーの場合はIPアドレスにフォールバック
    }
  }
  
  // IPアドレスベースの識別
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  
  return `ip:${ip}`;
}

/**
 * 期限切れエントリのクリーンアップ
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * プリセット設定
 */
export const RateLimitPresets = {
  // 一般的なAPI制限：1分間に60リクエスト
  STANDARD: {
    maxRequests: 60,
    windowMs: 60 * 1000
  },
  
  // 厳しい制限：1分間に10リクエスト（ログイン等）
  STRICT: {
    maxRequests: 10,
    windowMs: 60 * 1000
  },
  
  // 緩い制限：1分間に120リクエスト（リード操作）
  LENIENT: {
    maxRequests: 120,
    windowMs: 60 * 1000
  },
  
  // 作成操作：1分間に5リクエスト
  CREATE: {
    maxRequests: 5,
    windowMs: 60 * 1000
  }
} as const;

/**
 * Rate Limit結果をHTTPヘッダーとして設定
 */
export function setRateLimitHeaders(
  headers: Headers,
  result: ReturnType<typeof checkRateLimit>,
  config: RateLimitConfig
): void {
  headers.set('X-RateLimit-Limit', config.maxRequests.toString());
  headers.set('X-RateLimit-Remaining', result.remaining.toString());
  headers.set('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000).toString());
  
  if (result.isBlocked) {
    headers.set('Retry-After', Math.ceil((result.resetTime - Date.now()) / 1000).toString());
  }
} 