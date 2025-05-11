import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'react-hot-toast';
import ProfileEditor from '../ProfileEditor';
import { useProfile } from '@/hooks/useProfile';

// モックの設定
jest.mock('@/hooks/useProfile');
jest.mock('react-hot-toast');

describe('ProfileEditor', () => {
  const mockUpdateProfile = jest.fn();
  const mockProfile = {
    display_name: 'テストユーザー',
    bio: 'テストの自己紹介',
    avatar_url: 'https://example.com/avatar.jpg',
    personality_type: null,
    giver_score: 0,
    points: 0,
  };

  beforeEach(() => {
    // useProfileフックのモックを設定
    (useProfile as jest.Mock).mockReturnValue({
      profile: mockProfile,
      updateProfile: mockUpdateProfile,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('初期状態でプロフィール情報が表示される', () => {
    render(<ProfileEditor />);

    expect(screen.getByLabelText('表示名')).toHaveValue(mockProfile.display_name);
    expect(screen.getByLabelText('自己紹介')).toHaveValue(mockProfile.bio);
    expect(screen.getByAltText('プロフィール画像')).toBeInTheDocument();
  });

  it('フォームの入力値が更新される', async () => {
    render(<ProfileEditor />);
    const user = userEvent.setup();

    const displayNameInput = screen.getByLabelText('表示名');
    const bioInput = screen.getByLabelText('自己紹介');

    await user.clear(displayNameInput);
    await user.type(displayNameInput, '新しい表示名');
    await user.clear(bioInput);
    await user.type(bioInput, '新しい自己紹介');

    expect(displayNameInput).toHaveValue('新しい表示名');
    expect(bioInput).toHaveValue('新しい自己紹介');
  });

  it('フォーム送信時にプロフィールが更新される', async () => {
    render(<ProfileEditor />);
    const user = userEvent.setup();

    const newDisplayName = '新しい表示名';
    const newBio = '新しい自己紹介';

    await user.clear(screen.getByLabelText('表示名'));
    await user.type(screen.getByLabelText('表示名'), newDisplayName);
    await user.clear(screen.getByLabelText('自己紹介'));
    await user.type(screen.getByLabelText('自己紹介'), newBio);

    const submitButton = screen.getByRole('button', { name: '更新する' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        display_name: newDisplayName,
        bio: newBio,
        avatar_url: mockProfile.avatar_url,
      });
      expect(toast.success).toHaveBeenCalledWith('プロフィールを更新しました');
    });
  });

  it('プロフィール更新に失敗した場合エラーメッセージが表示される', async () => {
    mockUpdateProfile.mockRejectedValueOnce(new Error('更新に失敗しました'));
    render(<ProfileEditor />);
    const user = userEvent.setup();

    const submitButton = screen.getByRole('button', { name: '更新する' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('プロフィールの更新に失敗しました');
    });
  });

  it('送信中は更新ボタンが無効化される', async () => {
    mockUpdateProfile.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(<ProfileEditor />);
    const user = userEvent.setup();

    const submitButton = screen.getByRole('button', { name: '更新する' });
    await user.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('更新中...');

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
      expect(submitButton).toHaveTextContent('更新する');
    });
  });
}); 