import { auth, isAdmin, canAccessUserData } from '../auth';
import supabase from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
  auth: {
    getSession: jest.fn(),
  },
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
}));

describe('Security Tests', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
  };

  const mockSession = {
    user: mockUser,
    access_token: 'test-token',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('認証セキュリティ', () => {
    it('無効なトークンでの認証を拒否', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: { ...mockSession, access_token: 'invalid-token' } },
        error: new Error('Invalid token'),
      });

      const session = await auth();
      expect(session).toBeNull();
    });

    it('期限切れトークンでの認証を拒否', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { 
          session: { 
            ...mockSession, 
            expires_at: Date.now() - 1000 
          } 
        },
        error: new Error('Token expired'),
      });

      const session = await auth();
      expect(session).toBeNull();
    });

    it('改ざんされたユーザー情報での認証を拒否', async () => {
      const tampered_session = {
        ...mockSession,
        user: {
          ...mockUser,
          role: 'admin', // 不正に追加された権限
        },
      };

      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: tampered_session },
        error: null,
      });

      // データベースからの実際の権限を返す
      (supabase.from as jest.Mock)().select().eq().single.mockResolvedValue({
        data: { role: 'user' }, // 実際の権限
        error: null,
      });

      const isAdminResult = await isAdmin();
      expect(isAdminResult).toBe(false); // 不正な権限は無視される
    });
  });

  describe('アクセス制御', () => {
    it('権限のないユーザーデータへのアクセスを拒否', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      (supabase.from as jest.Mock)().select().eq().single.mockResolvedValue({
        data: { role: 'user' },
        error: null,
      });

      const canAccess = await canAccessUserData('other-user-id');
      expect(canAccess).toBe(false);
    });

    it('管理者は全ユーザーデータにアクセス可能', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      (supabase.from as jest.Mock)().select().eq().single.mockResolvedValue({
        data: { role: 'admin' },
        error: null,
      });

      const canAccess = await canAccessUserData('other-user-id');
      expect(canAccess).toBe(true);
    });

    it('ユーザーは自身のデータにのみアクセス可能', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      (supabase.from as jest.Mock)().select().eq().single.mockResolvedValue({
        data: { role: 'user' },
        error: null,
      });

      const canAccess = await canAccessUserData(mockUser.id);
      expect(canAccess).toBe(true);
    });
  });

  describe('入力検証', () => {
    it('SQLインジェクション攻撃パターンを検出', async () => {
      const maliciousId = "1'; DROP TABLE users; --";
      
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      // SQLインジェクションパターンを含むIDでのアクセスを試みる
      const canAccess = await canAccessUserData(maliciousId);
      expect(canAccess).toBe(false);
    });

    it('XSS攻撃パターンを検出', async () => {
      const maliciousId = '<script>alert("xss")</script>';
      
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      // XSSパターンを含むIDでのアクセスを試みる
      const canAccess = await canAccessUserData(maliciousId);
      expect(canAccess).toBe(false);
    });
  });

  describe('セッションセキュリティ', () => {
    it('同時ログインの制限', async () => {
      const sessions = [
        { ...mockSession, created_at: Date.now() },
        { ...mockSession, created_at: Date.now() - 1000 },
      ];

      // 複数のアクティブセッションが存在する場合
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: sessions[0] },
        error: null,
      });

      const session = await auth();
      expect(session).not.toBeNull();
      // 最新のセッションのみが有効であることを確認
      expect(session?.created_at).toBe(sessions[0].created_at);
    });

    it('セッションの整合性チェック', async () => {
      const modifiedSession = {
        ...mockSession,
        user: {
          ...mockUser,
          email: 'modified@example.com', // 改ざんされたメールアドレス
        },
      };

      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: modifiedSession },
        error: null,
      });

      // データベースからの実際のユーザー情報を返す
      (supabase.from as jest.Mock)().select().eq().single.mockResolvedValue({
        data: { email: 'original@example.com' }, // 実際のメールアドレス
        error: null,
      });

      const session = await auth();
      expect(session?.user.email).not.toBe('modified@example.com');
    });
  });
}); 