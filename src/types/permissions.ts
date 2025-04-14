export type UserRole = 'admin' | 'editor' | 'user';

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface RolePermissions {
  role: UserRole;
  permissions: string[];
}

export interface UserPermissions {
  userId: string;
  role: UserRole;
  customPermissions?: string[];
}

// 利用可能な権限の定義
export const AVAILABLE_PERMISSIONS: Permission[] = [
  {
    id: 'manage_users',
    name: 'ユーザー管理',
    description: 'ユーザーの作成、編集、削除が可能',
  },
  {
    id: 'manage_content',
    name: 'コンテンツ管理',
    description: '教材やクイズなどのコンテンツの作成、編集、削除が可能',
  },
  {
    id: 'view_analytics',
    name: '分析データ閲覧',
    description: 'ユーザー統計や利用状況の分析データの閲覧が可能',
  },
  {
    id: 'manage_points',
    name: 'ポイント管理',
    description: 'ポイントの付与、削除、履歴の管理が可能',
  },
  {
    id: 'edit_own_content',
    name: '自身のコンテンツ編集',
    description: '自身が作成したコンテンツの編集が可能',
  },
];

// ロールごとのデフォルト権限設定
export const DEFAULT_ROLE_PERMISSIONS: RolePermissions[] = [
  {
    role: 'admin',
    permissions: [
      'manage_users',
      'manage_content',
      'view_analytics',
      'manage_points',
      'edit_own_content',
    ],
  },
  {
    role: 'editor',
    permissions: [
      'manage_content',
      'view_analytics',
      'edit_own_content',
    ],
  },
  {
    role: 'user',
    permissions: [
      'edit_own_content',
    ],
  },
]; 