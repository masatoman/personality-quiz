import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'react-hot-toast';
import NotificationSettings from '../NotificationSettings';
import { useProfile } from '@/hooks/useProfile';

// モックの設定
jest.mock('@/hooks/useProfile');
jest.mock('react-hot-toast');

describe('NotificationSettings', () => {
  const mockUpdateProfile = jest.fn();
  const mockProfile = {
    display_name: 'テストユーザー',
    settings: {
      activity_updates: true,
      learning_reminders: true,
      achievement_alerts: true,
      feedback_notifications: true,
      community_updates: true,
      email_notifications: true,
      push_notifications: true,
      in_app_notifications: true,
      notification_frequency: 'daily',
      quiet_hours_start: '22:00',
      quiet_hours_end: '07:00',
      minimum_importance: 'all'
    }
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

  it('通知設定フォームが正しくレンダリングされる', () => {
    render(<NotificationSettings />);

    // 各セクションのヘッダーが表示されていることを確認
    expect(screen.getByText('通知の種類')).toBeInTheDocument();
    expect(screen.getByText('通知方法')).toBeInTheDocument();
    expect(screen.getByText('通知頻度')).toBeInTheDocument();
    expect(screen.getByText('通知フィルター')).toBeInTheDocument();

    // チェックボックスが正しく表示されていることを確認
    expect(screen.getByLabelText('アクティビティ更新')).toBeInTheDocument();
    expect(screen.getByLabelText('学習リマインダー')).toBeInTheDocument();
    expect(screen.getByLabelText('メール通知')).toBeInTheDocument();
    expect(screen.getByLabelText('プッシュ通知')).toBeInTheDocument();

    // セレクトボックスが正しく表示されていることを確認
    expect(screen.getByLabelText('更新頻度')).toBeInTheDocument();
    expect(screen.getByLabelText('最小重要度')).toBeInTheDocument();

    // 時間入力フィールドが正しく表示されていることを確認
    expect(screen.getByLabelText('非通知時間帯（開始）')).toBeInTheDocument();
    expect(screen.getByLabelText('非通知時間帯（終了）')).toBeInTheDocument();
  });

  it('チェックボックスの状態が正しく更新される', async () => {
    render(<NotificationSettings />);
    const checkbox = screen.getByLabelText('アクティビティ更新') as HTMLInputElement;
    
    // チェックボックスをクリック
    await userEvent.click(checkbox);
    expect(checkbox.checked).toBe(false);

    // もう一度クリック
    await userEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
  });

  it('通知頻度の選択が正しく更新される', async () => {
    render(<NotificationSettings />);
    const select = screen.getByLabelText('更新頻度') as HTMLSelectElement;
    
    // 週1回に変更
    await userEvent.selectOptions(select, 'weekly');
    expect(select.value).toBe('weekly');

    // 月1回に変更
    await userEvent.selectOptions(select, 'monthly');
    expect(select.value).toBe('monthly');
  });

  it('非通知時間帯の設定が正しく更新される', async () => {
    render(<NotificationSettings />);
    const startTime = screen.getByLabelText('非通知時間帯（開始）') as HTMLInputElement;
    const endTime = screen.getByLabelText('非通知時間帯（終了）') as HTMLInputElement;
    
    // 開始時間を変更
    fireEvent.change(startTime, { target: { value: '23:00' } });
    expect(startTime.value).toBe('23:00');

    // 終了時間を変更
    fireEvent.change(endTime, { target: { value: '08:00' } });
    expect(endTime.value).toBe('08:00');
  });

  it('フォーム送信が正しく動作する', async () => {
    render(<NotificationSettings />);
    const submitButton = screen.getByText('設定を保存');

    // フォームを送信
    await userEvent.click(submitButton);

    // updateProfileが正しく呼び出されたことを確認
    expect(mockUpdateProfile).toHaveBeenCalledTimes(1);
    expect(mockUpdateProfile).toHaveBeenCalledWith({
      display_name: 'テストユーザー',
      settings: expect.objectContaining({
        notification_frequency: 'daily',
        minimum_importance: 'all',
      })
    });

    // 成功トーストが表示されたことを確認
    expect(toast.success).toHaveBeenCalledWith('通知設定を更新しました');
  });

  it('エラー時に適切なエラーメッセージが表示される', async () => {
    // エラーを発生させるようにモックを設定
    mockUpdateProfile.mockRejectedValueOnce(new Error('更新エラー'));
    
    render(<NotificationSettings />);
    const submitButton = screen.getByText('設定を保存');

    // フォームを送信
    await userEvent.click(submitButton);

    // エラートーストが表示されたことを確認
    expect(toast.error).toHaveBeenCalledWith('通知設定の更新に失敗しました');
  });
}); 