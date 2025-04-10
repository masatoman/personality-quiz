import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

/**
 * セッション情報を取得する
 * 
 * @returns セッション情報、またはnull（未認証の場合）
 */
export async function auth() {
  const cookieStore = cookies();
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
    .single();
    
  if (userError) {
    console.error('ユーザー情報取得エラー:', userError);
    return session;
  }
  
  // セッション情報にロール情報を追加
  return {
    ...session,
    user: {
      ...session.user,
      role: userData?.role || 'user'
    }
  };
}

/**
 * 現在のユーザーが管理者かどうかを確認する
 * 
 * @returns 管理者の場合はtrue、それ以外はfalse
 */
export async function isAdmin() {
  const session = await auth();
  return session?.user?.role === 'admin';
}

/**
 * ユーザーIDが現在のユーザーと一致するか、または管理者かどうかを確認する
 * 
 * @param userId 確認対象のユーザーID
 * @returns 一致または管理者の場合はtrue、それ以外はfalse
 */
export async function canAccessUserData(userId: string) {
  const session = await auth();
  if (!session) return false;
  
  return session.user.id === userId || session.user.role === 'admin';
}

/**
 * 現在のユーザーの認証情報を取得する
 * 
 * @returns 認証されたユーザー情報、または未認証の場合はnull
 */
export async function getUserAuth() {
  const session = await auth();
  return session ? session.user : null;
} 