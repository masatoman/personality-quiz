import { auth, isAdmin, canAccessUserData, getUserAuth } from '../auth';
import { createClient } from '@/utils/supabase/server';

// モックの設定
jest.mock('@/utils/supabase/server');
jest.mock('next/headers', () => ({
  cookies: jest.fn().mockReturnValue({
    get: jest.fn(),
    getAll: jest.fn(),
  }),
}));

describe('Auth Utilities', () => {
  const mockSession = {
    user: {
      id: 'user-123',
      email: 'test@example.com',
    }
  };

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    role: 'user'
  };

  const mockAdminUser = {
    id: 'admin-456',
    email: 'admin@example.com',
    role: 'admin'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: { session: mockSession },
          error: null
        }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { role: 'user' },
              error: null
            })
          })
        })
      })
    });
  });

  describe('auth', () => {
    it('認証済みユーザーのセッション情報を取得できる', async () => {
      const session = await auth();
      
      expect(session).toEqual({
        ...mockSession,
        user: {
          ...mockSession.user,
          role: 'user'
        }
      });
      
      // Supabase clientの生成と呼び出しを検証
      expect(createClient).toHaveBeenCalled();
    });

    it('エラー時はnullを返す', async () => {
      (createClient as jest.Mock).mockReturnValue({
        auth: {
          getSession: jest.fn().mockResolvedValue({
            data: { session: null },
            error: { message: 'Session error' }
          }),
        }
      });

      const session = await auth();
      expect(session).toBeNull();
    });

    it('ユーザーデータ取得エラー時は基本セッションを返す', async () => {
      (createClient as jest.Mock).mockReturnValue({
        auth: {
          getSession: jest.fn().mockResolvedValue({
            data: { session: mockSession },
            error: null
          }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'User data error' }
              })
            })
          })
        })
      });

      const session = await auth();
      expect(session).toEqual(mockSession);
    });
  });

  describe('isAdmin', () => {
    it('管理者ユーザーの場合はtrueを返す', async () => {
      // ユーザーデータから管理者ロールを返すようモックを設定
      (createClient as jest.Mock).mockReturnValue({
        auth: {
          getSession: jest.fn().mockResolvedValue({
            data: { session: mockSession },
            error: null
          }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { role: 'admin' },
                error: null
              })
            })
          })
        })
      });

      const result = await isAdmin();
      expect(result).toBe(true);
    });

    it('一般ユーザーの場合はfalseを返す', async () => {
      const result = await isAdmin();
      expect(result).toBe(false);
    });

    it('認証されていない場合はfalseを返す', async () => {
      (createClient as jest.Mock).mockReturnValue({
        auth: {
          getSession: jest.fn().mockResolvedValue({
            data: { session: null },
            error: null
          }),
        }
      });

      const result = await isAdmin();
      expect(result).toBe(false);
    });
  });

  describe('canAccessUserData', () => {
    it('自分自身のデータにアクセスできる', async () => {
      const userId = 'user-123';
      const result = await canAccessUserData(userId);
      expect(result).toBe(true);
    });

    it('管理者は他のユーザーデータにアクセスできる', async () => {
      // 管理者ロールを返すようモックを設定
      (createClient as jest.Mock).mockReturnValue({
        auth: {
          getSession: jest.fn().mockResolvedValue({
            data: { session: mockSession },
            error: null
          }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { role: 'admin' },
                error: null
              })
            })
          })
        })
      });

      const userId = 'other-user-789';
      const result = await canAccessUserData(userId);
      expect(result).toBe(true);
    });

    it('一般ユーザーは他のユーザーデータにアクセスできない', async () => {
      const userId = 'other-user-789';
      const result = await canAccessUserData(userId);
      expect(result).toBe(false);
    });

    it('認証されていない場合はfalseを返す', async () => {
      (createClient as jest.Mock).mockReturnValue({
        auth: {
          getSession: jest.fn().mockResolvedValue({
            data: { session: null },
            error: null
          }),
        }
      });

      const userId = 'user-123';
      const result = await canAccessUserData(userId);
      expect(result).toBe(false);
    });
  });

  describe('getUserAuth', () => {
    it('認証済みユーザーの情報を返す', async () => {
      const user = await getUserAuth();
      expect(user).toEqual({
        ...mockSession.user,
        role: 'user'
      });
    });

    it('認証されていない場合はnullを返す', async () => {
      (createClient as jest.Mock).mockReturnValue({
        auth: {
          getSession: jest.fn().mockResolvedValue({
            data: { session: null },
            error: null
          }),
        }
      });

      const user = await getUserAuth();
      expect(user).toBeNull();
    });
  });
}); 