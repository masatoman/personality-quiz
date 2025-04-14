import { createClient } from '@supabase/supabase-js';
import { UserRole } from '@/types/permissions';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface UserPermissions {
  role: UserRole;
  permissions: string[];
}

/**
 * ユーザーの権限情報を取得
 */
export async function getUserPermissions(userId: string): Promise<UserPermissions> {
  const { data, error } = await supabase
    .from('user_permissions')
    .select('role, custom_permissions')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    throw new Error('ユーザーの権限情報の取得に失敗しました');
  }

  return {
    role: data.role,
    permissions: data.custom_permissions || [],
  };
}

/**
 * 指定された権限を持っているかチェック
 */
export async function hasPermission(userId: string, permission: string): Promise<boolean> {
  try {
    const { permissions } = await getUserPermissions(userId);
    return permissions.includes(permission);
  } catch (error) {
    console.error('権限チェックに失敗しました:', error);
    return false;
  }
}

/**
 * 全ての指定された権限を持っているかチェック
 */
export async function hasAllPermissions(userId: string, requiredPermissions: string[]): Promise<boolean> {
  try {
    const { permissions } = await getUserPermissions(userId);
    return requiredPermissions.every(permission => permissions.includes(permission));
  } catch (error) {
    console.error('権限チェックに失敗しました:', error);
    return false;
  }
}

/**
 * 指定された権限のいずれかを持っているかチェック
 */
export async function hasAnyPermission(userId: string, requiredPermissions: string[]): Promise<boolean> {
  try {
    const { permissions } = await getUserPermissions(userId);
    return requiredPermissions.some(permission => permissions.includes(permission));
  } catch (error) {
    console.error('権限チェックに失敗しました:', error);
    return false;
  }
}

/**
 * ユーザーのロールを更新
 */
export async function updateUserRole(userId: string, newRole: UserRole): Promise<void> {
  const { error } = await supabase
    .from('user_permissions')
    .update({ role: newRole })
    .eq('user_id', userId);

  if (error) {
    throw new Error('ユーザーロールの更新に失敗しました');
  }
}

/**
 * カスタム権限を追加
 */
export async function addCustomPermission(userId: string, permission: string): Promise<void> {
  const { data, error } = await supabase
    .from('user_permissions')
    .select('custom_permissions')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    throw new Error('ユーザー権限の取得に失敗しました');
  }

  const currentPermissions = data.custom_permissions || [];
  if (!currentPermissions.includes(permission)) {
    const { error: updateError } = await supabase
      .from('user_permissions')
      .update({ custom_permissions: [...currentPermissions, permission] })
      .eq('user_id', userId);

    if (updateError) {
      throw new Error('カスタム権限の追加に失敗しました');
    }
  }
}

/**
 * カスタム権限を削除
 */
export async function removeCustomPermission(userId: string, permission: string): Promise<void> {
  const { data, error } = await supabase
    .from('user_permissions')
    .select('custom_permissions')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    throw new Error('ユーザー権限の取得に失敗しました');
  }

  const currentPermissions = data.custom_permissions || [];
  const updatedPermissions = currentPermissions.filter((p: string) => p !== permission);

  const { error: updateError } = await supabase
    .from('user_permissions')
    .update({ custom_permissions: updatedPermissions })
    .eq('user_id', userId);

  if (updateError) {
    throw new Error('カスタム権限の削除に失敗しました');
  }
} 