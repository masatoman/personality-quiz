import { isAuthenticated } from '../session';
import supabase from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
  auth: {
    getSession: jest.fn(),
  },
}));

describe('Session Management', () => {
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

  describe('isAuthenticated', () => {
    it('有効なセッションが存在する場合はtrueを返す', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await isAuthenticated();
      expect(result).toBe(true);
    });

    it('セッションが存在しない場合はfalseを返す', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await isAuthenticated();
      expect(result).toBe(false);
    });

    it('エラーが発生した場合はfalseを返す', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: new Error('Session error'),
      });

      const result = await isAuthenticated();
      expect(result).toBe(false);
    });

    it('セッショントークンの有効期限が切れている場合はfalseを返す', async () => {
      const expiredSession = {
        ...mockSession,
        expires_at: Date.now() - 1000, // 過去の時刻
      };

      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: expiredSession },
        error: null,
      });

      const result = await isAuthenticated();
      expect(result).toBe(false);
    });
  });
}); 