import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import {
  getUserPermissions,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  updateUserRole,
  addCustomPermission,
  removeCustomPermission,
} from '../permissions';
import { UserRole } from '@/types/permissions';

// Supabaseクライアントのモック
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}));

describe('Permission Management System', () => {
  const mockSupabase = {
    from: vi.fn(() => ({
      select: vi.fn(),
      update: vi.fn(),
      eq: vi.fn(),
    })),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as any).mockReturnValue(mockSupabase);
  });

  describe('getUserPermissions', () => {
    it('ユーザーの権限を正しく取得できること', async () => {
      const mockData = {
        role: 'admin' as UserRole,
        custom_permissions: ['special_access'],
      };
      mockSupabase.from().select.mockResolvedValue({ data: mockData });

      const permissions = await getUserPermissions('user-123');
      expect(permissions).toEqual({
        role: 'admin',
        permissions: expect.arrayContaining(['special_access']),
      });
    });

    it('ユーザーが存在しない場合はエラーを投げること', async () => {
      mockSupabase.from().select.mockResolvedValue({ data: null });

      await expect(getUserPermissions('non-existent')).rejects.toThrow();
    });
  });

  describe('hasPermission', () => {
    it('ユーザーが指定された権限を持っている場合はtrueを返すこと', async () => {
      const mockData = {
        role: 'admin' as UserRole,
        custom_permissions: ['view_analytics'],
      };
      mockSupabase.from().select.mockResolvedValue({ data: mockData });

      const result = await hasPermission('user-123', 'view_analytics');
      expect(result).toBe(true);
    });

    it('ユーザーが指定された権限を持っていない場合はfalseを返すこと', async () => {
      const mockData = {
        role: 'user' as UserRole,
        custom_permissions: [],
      };
      mockSupabase.from().select.mockResolvedValue({ data: mockData });

      const result = await hasPermission('user-123', 'manage_users');
      expect(result).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    it('ユーザーが全ての指定された権限を持っている場合はtrueを返すこと', async () => {
      const mockData = {
        role: 'admin' as UserRole,
        custom_permissions: ['view_analytics', 'manage_content'],
      };
      mockSupabase.from().select.mockResolvedValue({ data: mockData });

      const result = await hasAllPermissions('user-123', ['view_analytics', 'manage_content']);
      expect(result).toBe(true);
    });

    it('ユーザーが一部の権限を持っていない場合はfalseを返すこと', async () => {
      const mockData = {
        role: 'editor' as UserRole,
        custom_permissions: ['view_analytics'],
      };
      mockSupabase.from().select.mockResolvedValue({ data: mockData });

      const result = await hasAllPermissions('user-123', ['view_analytics', 'manage_users']);
      expect(result).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('ユーザーが少なくとも1つの権限を持っている場合はtrueを返すこと', async () => {
      const mockData = {
        role: 'editor' as UserRole,
        custom_permissions: ['view_analytics'],
      };
      mockSupabase.from().select.mockResolvedValue({ data: mockData });

      const result = await hasAnyPermission('user-123', ['view_analytics', 'manage_users']);
      expect(result).toBe(true);
    });

    it('ユーザーが指定された権限を1つも持っていない場合はfalseを返すこと', async () => {
      const mockData = {
        role: 'user' as UserRole,
        custom_permissions: [],
      };
      mockSupabase.from().select.mockResolvedValue({ data: mockData });

      const result = await hasAnyPermission('user-123', ['manage_users', 'manage_content']);
      expect(result).toBe(false);
    });
  });

  describe('updateUserRole', () => {
    it('ユーザーのロールを正しく更新できること', async () => {
      mockSupabase.from().update.mockResolvedValue({ data: { role: 'editor' } });

      await updateUserRole('user-123', 'editor');
      expect(mockSupabase.from().update).toHaveBeenCalledWith({ role: 'editor' });
    });
  });

  describe('addCustomPermission & removeCustomPermission', () => {
    it('カスタム権限を追加できること', async () => {
      const mockData = {
        custom_permissions: ['existing_permission'],
      };
      mockSupabase.from().select.mockResolvedValue({ data: mockData });
      mockSupabase.from().update.mockResolvedValue({ data: { custom_permissions: ['existing_permission', 'new_permission'] } });

      await addCustomPermission('user-123', 'new_permission');
      expect(mockSupabase.from().update).toHaveBeenCalledWith({
        custom_permissions: ['existing_permission', 'new_permission'],
      });
    });

    it('カスタム権限を削除できること', async () => {
      const mockData = {
        custom_permissions: ['permission1', 'permission2'],
      };
      mockSupabase.from().select.mockResolvedValue({ data: mockData });
      mockSupabase.from().update.mockResolvedValue({ data: { custom_permissions: ['permission2'] } });

      await removeCustomPermission('user-123', 'permission1');
      expect(mockSupabase.from().update).toHaveBeenCalledWith({
        custom_permissions: ['permission2'],
      });
    });
  });
}); 