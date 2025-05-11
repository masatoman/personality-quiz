import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'react-hot-toast';
import ProfileSettings from '../ProfileSettings';
import { useProfile } from '@/hooks/useProfile';

// モックの設定
jest.mock('@/hooks/useProfile');
jest.mock('react-hot-toast');

describe('ProfileSettings', () => {
  const mockUpdateProfile = jest.fn();
  const mockProfile = {
    email_notifications: true,
    push_notifications: true,
    notification_frequency: 'daily',
    profile_visibility: 'public',
    activity_visibility: 'public',
    learning_history_visibility: 'friends',
    preferred_learning_time: '09:00',
    daily_goal_minutes: 30,
    preferred_content_type: ['text', 'video']
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

  it('初期状態で設定が正しく表示される', () => {
    render(<ProfileSettings />);

    // 通知設定
    expect(screen.getByLabelText('メール通知')).toBeChecked();
    expect(screen.getByLabelText('プッシュ通知')).toBeChecked();
    expect(screen.getByLabelText('通知頻度')).toHaveValue('daily');

    // プライバシー設定
    expect(screen.getByLabelText('プロフィール公開範囲')).toHaveValue('public');
    expect(screen.getByLabelText('アクティビティ公開範囲')).toHaveValue('public');
    expect(screen.getByLabelText('学習履歴公開範囲')).toHaveValue('friends');

    // 学習設定
    expect(screen.getByLabelText('希望学習時間')).toHaveValue('09:00');
    expect(screen.getByLabelText('1日の目標学習時間（分）')).toHaveValue('30');
    expect(screen.getByLabelText('テキスト')).toBeChecked();
    expect(screen.getByLabelText('動画')).toBeChecked();
  });

  it('設定値が変更できる', async () => {
    render(<ProfileSettings />);
    const user = userEvent.setup();

    // 通知設定の変更
    await user.click(screen.getByLabelText('メール通知'));
    await user.selectOptions(screen.getByLabelText('通知頻度'), 'weekly');

    // プライバシー設定の変更
    await user.selectOptions(screen.getByLabelText('プロフィール公開範囲'), 'private');

    // 学習設定の変更
    await user.clear(screen.getByLabelText('1日の目標学習時間（分）'));
    await user.type(screen.getByLabelText('1日の目標学習時間（分）'), '60');
    await user.click(screen.getByLabelText('音声'));

    // 変更が反映されていることを確認
    expect(screen.getByLabelText('メール通知')).not.toBeChecked();
    expect(screen.getByLabelText('通知頻度')).toHaveValue('weekly');
    expect(screen.getByLabelText('プロフィール公開範囲')).toHaveValue('private');
    expect(screen.getByLabelText('1日の目標学習時間（分）')).toHaveValue('60');
    expect(screen.getByLabelText('音声')).toBeChecked();
  });

  it('フォーム送信時に設定が更新される', async () => {
    render(<ProfileSettings />);
    const user = userEvent.setup();

    // 設定を変更
    await user.click(screen.getByLabelText('メール通知'));
    await user.selectOptions(screen.getByLabelText('通知頻度'), 'weekly');
    await user.selectOptions(screen.getByLabelText('プロフィール公開範囲'), 'private');

    // フォームを送信
    const submitButton = screen.getByRole('button', { name: '設定を保存' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith(expect.objectContaining({
        email_notifications: false,
        notification_frequency: 'weekly',
        profile_visibility: 'private'
      }));
      expect(toast.success).toHaveBeenCalledWith('設定を更新しました');
    });
  });

  it('設定更新に失敗した場合エラーメッセージが表示される', async () => {
    mockUpdateProfile.mockRejectedValueOnce(new Error('更新に失敗しました'));
    render(<ProfileSettings />);
    const user = userEvent.setup();

    const submitButton = screen.getByRole('button', { name: '設定を保存' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('設定の更新に失敗しました');
    });
  });

  it('送信中は保存ボタンが無効化される', async () => {
    mockUpdateProfile.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(<ProfileSettings />);
    const user = userEvent.setup();

    const submitButton = screen.getByRole('button', { name: '設定を保存' });
    await user.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('更新中...');

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
      expect(submitButton).toHaveTextContent('設定を保存');
    });
  });
}); 