import { renderHook, act } from '@testing-library/react';
import { useProfile } from './useProfile';
import { useAuth } from './useAuth';
import { getProfile, upsertProfile } from '@/lib/api';
import { PersonalityType } from '@/types/quiz';

jest.mock('./useAuth', () => ({
  useAuth: jest.fn()
}));

jest.mock('@/lib/api', () => ({
  getProfile: jest.fn(),
  upsertProfile: jest.fn()
}));

describe('useProfile フック', () => {
  const mockUser = { id: 'test-user-id', email: 'test@example.com' };
  const mockProfile = {
    id: 'profile-1',
    user_id: mockUser.id,
    display_name: 'テストユーザー',
    bio: 'テストの自己紹介',
    personality_type: 'HELPER' as PersonalityType
  };

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (getProfile as jest.Mock).mockResolvedValue(mockProfile);
    (upsertProfile as jest.Mock).mockResolvedValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('初期状態でプロファイルを取得する', async () => {
    const { result } = renderHook(() => useProfile());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.profile).toBeNull();

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.profile).toEqual(mockProfile);
    expect(result.current.error).toBeNull();
    expect(getProfile).toHaveBeenCalledWith(mockUser.id);
  });

  it('ユーザーが未認証の場合、プロファイルをnullに設定する', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });

    const { result } = renderHook(() => useProfile());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.profile).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(getProfile).not.toHaveBeenCalled();
  });

  it('プロファイル取得時にエラーが発生した場合、エラーを設定する', async () => {
    const error = new Error('プロファイルの取得に失敗しました');
    (getProfile as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useProfile());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.error).toEqual(error);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.profile).toBeNull();
  });

  describe('updateProfile', () => {
    const updateData = {
      display_name: '新しい名前',
      bio: '新しい自己紹介',
      personality_type: 'MENTOR' as PersonalityType
    };

    it('プロファイルを正常に更新する', async () => {
      const { result } = renderHook(() => useProfile());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.updateProfile(updateData);
      });

      expect(upsertProfile).toHaveBeenCalledWith(mockUser.id, updateData);
      expect(getProfile).toHaveBeenCalledTimes(2);
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('未認証状態での更新時にエラーをスローする', async () => {
      (useAuth as jest.Mock).mockReturnValue({ user: null });
      const { result } = renderHook(() => useProfile());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await expect(async () => {
        await act(async () => {
          await result.current.updateProfile(updateData);
        });
      }).rejects.toThrow('ユーザーが認証されていません');
    });

    it('更新失敗時にエラーをスローする', async () => {
      (upsertProfile as jest.Mock).mockResolvedValue(false);
      const { result } = renderHook(() => useProfile());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await expect(async () => {
        await act(async () => {
          await result.current.updateProfile(updateData);
        });
      }).rejects.toThrow('プロファイルの更新に失敗しました');
    });
  });
}); 