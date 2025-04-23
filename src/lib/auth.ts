import { createClient } from '@/utils/supabase/server';
import { Session, User } from '@supabase/supabase-js';
import { PostgrestError } from '@supabase/supabase-js';
import { hash, compare } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ExtendedSession extends Session {
  user: User & {
    role?: string;
  };
}

interface UserData {
  role: string | null;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const COOKIE_NAME = 'auth_token';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

export interface AuthToken {
  userId: string;
  email: string;
  role: string;
}

export interface SessionData {
  id: string;
  userId: string;
  token: string;
  lastActivity: Date;
  expiresAt: Date;
  userAgent: string;
  ipAddress: string;
}

export interface SessionConfig {
  maxAge: number;  // セッションの最大有効期間（秒）
  renewThreshold: number;  // 自動更新を行う残り時間のしきい値（秒）
  maxSessions: number;  // ユーザーごとの最大セッション数
}

const DEFAULT_SESSION_CONFIG: SessionConfig = {
  maxAge: 24 * 60 * 60,  // 24時間
  renewThreshold: 60 * 60,  // 1時間
  maxSessions: 5  // 最大5セッション
};

/**
 * セッション情報を取得する
 * 
 * @returns セッション情報、またはnull（未認証の場合）
 */
export async function auth(): Promise<ExtendedSession | null> {
  try {
    const supabase = createClient();
    
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      return null;
    }
    
    // ユーザーの詳細情報を取得（ロール情報など）
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single() as { data: UserData | null; error: PostgrestError | null };
      
    if (userError) {
      console.error('ユーザー情報取得エラー:', userError);
      return session;
    }
    
    // セッション情報にロール情報を追加
    return {
      ...session,
      user: {
        ...session.user,
        role: userData?.role ?? 'user'
      }
    };
  } catch (error) {
    console.error('認証エラー:', error);
    return null;
  }
}

/**
 * 現在のユーザーが管理者かどうかを確認する
 * 
 * @returns 管理者の場合はtrue、それ以外はfalse
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const session = await auth();
    return session?.user?.role === 'admin';
  } catch (error) {
    console.error('管理者権限チェックエラー:', error);
    return false;
  }
}

/**
 * ユーザーIDが現在のユーザーと一致するか、または管理者かどうかを確認する
 * 
 * @param userId 確認対象のユーザーID
 * @returns 一致または管理者の場合はtrue、それ以外はfalse
 */
export async function canAccessUserData(userId: string): Promise<boolean> {
  try {
    const session = await auth();
    if (!session) return false;
    
    return session.user.id === userId || session.user.role === 'admin';
  } catch (error) {
    console.error('ユーザーアクセス権限チェックエラー:', error);
    return false;
  }
}

/**
 * 現在のユーザーの認証情報を取得する
 * 
 * @returns 認証されたユーザー情報、または未認証の場合はnull
 */
export async function getUserAuth(): Promise<ExtendedSession['user'] | null> {
  try {
    const session = await auth();
    return session ? session.user : null;
  } catch (error) {
    console.error('ユーザー認証情報取得エラー:', error);
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword);
}

export function generateToken(user: User): string {
  return sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function verifyToken(token: string): AuthToken {
  try {
    return verify(token, JWT_SECRET) as AuthToken;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export function setAuthCookie(token: string): void {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 // 24 hours
  });
}

export function getAuthCookie(): string | undefined {
  return cookies().get(COOKIE_NAME)?.value;
}

export function removeAuthCookie(): void {
  cookies().delete(COOKIE_NAME);
}

export async function validateEmail(email: string): Promise<boolean> {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): boolean {
  // 最低8文字、大文字小文字を含む、数字を含む
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return passwordRegex.test(password);
}

export async function createSession(
  user: User,
  userAgent: string,
  ipAddress: string,
  config: Partial<SessionConfig> = {}
): Promise<SessionData> {
  const sessionConfig = { ...DEFAULT_SESSION_CONFIG, ...config };
  const now = new Date();
  const expiresAt = new Date(now.getTime() + sessionConfig.maxAge * 1000);

  // 古いセッションのクリーンアップ
  await cleanupOldSessions(user.id);

  // アクティブセッション数のチェック
  const activeSessions = await prisma.session.count({
    where: {
      userId: user.id,
      expiresAt: { gt: now }
    }
  });

  if (activeSessions >= sessionConfig.maxSessions) {
    // 最も古いセッションを削除
    const oldestSession = await prisma.session.findFirst({
      where: {
        userId: user.id,
        expiresAt: { gt: now }
      },
      orderBy: { lastActivity: 'asc' }
    });

    if (oldestSession) {
      await prisma.session.delete({
        where: { id: oldestSession.id }
      });
    }
  }

  // 新しいセッションの作成
  const token = generateToken(user);
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      token,
      lastActivity: now,
      expiresAt,
      userAgent,
      ipAddress
    }
  });

  setAuthCookie(token);
  return session;
}

export async function validateSession(token: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error('セッション検証エラー:', error);
      return false;
    }

    // セッションの有効期限をチェック
    const { data: session } = await supabase.auth.getSession();
    if (!session) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('セッション検証エラー:', error);
    return false;
  }
}

export async function renewSession(sessionId: string): Promise<SessionData | null> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + DEFAULT_SESSION_CONFIG.maxAge * 1000);

  try {
    const session = await prisma.session.update({
      where: { id: sessionId },
      data: {
        lastActivity: now,
        expiresAt
      }
    });

    const token = session.token;
    setAuthCookie(token);
    return session;
  } catch (error) {
    console.error('Session renewal error:', error);
    return null;
  }
}

export async function cleanupOldSessions(userId: string): Promise<void> {
  const now = new Date();
  await prisma.session.deleteMany({
    where: {
      userId,
      expiresAt: { lt: now }
    }
  });
}

export async function listActiveSessions(userId: string): Promise<SessionData[]> {
  const now = new Date();
  return prisma.session.findMany({
    where: {
      userId,
      expiresAt: { gt: now }
    },
    orderBy: { lastActivity: 'desc' }
  });
}

export async function terminateSession(sessionId: string): Promise<void> {
  await prisma.session.delete({
    where: { id: sessionId }
  });
}

export async function terminateAllSessions(userId: string, exceptSessionId?: string): Promise<void> {
  await prisma.session.deleteMany({
    where: {
      userId,
      id: exceptSessionId ? { not: exceptSessionId } : undefined
    }
  });
} 