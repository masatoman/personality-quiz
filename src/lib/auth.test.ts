import { auth, isAdmin, canAccessUserData, getUserAuth } from './auth';
import { createClient } from '@/utils/supabase/server';

jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn()
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn()
}));

describe('認証機能のテスト', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'user'
  };

  const mockAdminUser = {
    id: 'admin-user-id',
    email: 'admin@example.com',
    role: 'admin'
  };

  const mockSession = {
    user: mockUser,
    access_token: 'test-token',
    refresh_token: 'refresh-token',
    expires_at: 123456789
  };

  const mockAdminSession = {
    ...mockSession,
    user: mockAdminUser
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('auth()', () => {
    it('認証済みユーザーの場合、セッション情報を返す', async () => {
      const mockSupabase = {
        auth: {
          getSession: jest.fn().mockResolvedValue({
            data: { session: mockSession },
            error: null
          })
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { role: 'user' },
            error: null
          })
        })
      };

      (createClient as jest.Mock).mockReturnValue(mockSupabase);

      const result = await auth();
      expect(result).toEqual({
        ...mockSession,
        user: {
          ...mockSession.user,
          role: 'user'
        }
      });
    });

    it('未認証の場合、nullを返す', async () => {
      const mockSupabase = {
        auth: {
          getSession: jest.fn().mockResolvedValue({
            data: { session: null },
            error: null
          })
        }
      };

      (createClient as jest.Mock).mockReturnValue(mockSupabase);

      const result = await auth();
      expect(result).toBeNull();
    });

    it('エラー発生時、nullを返す', async () => {
      const mockSupabase = {
        auth: {
          getSession: jest.fn().mockResolvedValue({
            data: { session: null },
            error: new Error('認証エラー')
          })
        }
      };

      (createClient as jest.Mock).mockReturnValue(mockSupabase);

      const result = await auth();
      expect(result).toBeNull();
    });
  });

  describe('isAdmin()', () => {
    it('管理者の場合、trueを返す', async () => {
      const mockSupabase = {
        auth: {
          getSession: jest.fn().mockResolvedValue({
            data: { session: mockAdminSession },
            error: null
          })
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { role: 'admin' },
            error: null
          })
        })
      };

      (createClient as jest.Mock).mockReturnValue(mockSupabase);

      const result = await isAdmin();
      expect(result).toBe(true);
    });

    it('一般ユーザーの場合、falseを返す', async () => {
      const mockSupabase = {
        auth: {
          getSession: jest.fn().mockResolvedValue({
            data: { session: mockSession },
            error: null
          })
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { role: 'user' },
            error: null
          })
        })
      };

      (createClient as jest.Mock).mockReturnValue(mockSupabase);

      const result = await isAdmin();
      expect(result).toBe(false);
    });
  });

  describe('canAccessUserData()', () => {
    it('自分のデータにアクセスする場合、trueを返す', async () => {
      const mockSupabase = {
        auth: {
          getSession: jest.fn().mockResolvedValue({
            data: { session: mockSession },
            error: null
          })
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { role: 'user' },
            error: null
          })
        })
      };

      (createClient as jest.Mock).mockReturnValue(mockSupabase);

      const result = await canAccessUserData(mockUser.id);
      expect(result).toBe(true);
    });

    it('管理者が他のユーザーのデータにアクセスする場合、trueを返す', async () => {
      const mockSupabase = {
        auth: {
          getSession: jest.fn().mockResolvedValue({
            data: { session: mockAdminSession },
            error: null
          })
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { role: 'admin' },
            error: null
          })
        })
      };

      (createClient as jest.Mock).mockReturnValue(mockSupabase);

      const result = await canAccessUserData('other-user-id');
      expect(result).toBe(true);
    });
  });

  describe('getUserAuth()', () => {
    it('認証済みユーザーの場合、ユーザー情報を返す', async () => {
      const mockSupabase = {
        auth: {
          getSession: jest.fn().mockResolvedValue({
            data: { session: mockSession },
            error: null
          })
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { role: 'user' },
            error: null
          })
        })
      };

      (createClient as jest.Mock).mockReturnValue(mockSupabase);

      const result = await getUserAuth();
      expect(result).toEqual({
        ...mockUser,
        role: 'user'
      });
    });

    it('未認証の場合、nullを返す', async () => {
      const mockSupabase = {
        auth: {
          getSession: jest.fn().mockResolvedValue({
            data: { session: null },
            error: null
          })
        }
      };

      (createClient as jest.Mock).mockReturnValue(mockSupabase);

      const result = await getUserAuth();
      expect(result).toBeNull();
    });
  });
}); 