import { createClient } from '@/utils/supabase/server';
import { Session, User } from '@supabase/supabase-js';
import { PostgrestError } from '@supabase/supabase-js';

export interface ExtendedSession extends Session {
  user: User & {
    role?: string;
  };
}

interface UserData {
  role: string | null;
}

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