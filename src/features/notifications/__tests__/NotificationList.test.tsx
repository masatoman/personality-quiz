import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotificationList from '../NotificationList';
import { useNotifications } from '../useNotifications';

// 通知フックのモック
jest.mock('../useNotifications', () => ({
  useNotifications: jest.fn()
}));

describe('NotificationList', () => {
  const mockNotifications = [
    {
      id: '1',
      title: 'テスト通知1',
      message: 'これはテスト通知1です',
      type: 'info',
      read: false,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      title: 'テスト通知2',
      message: 'これはテスト通知2です',
      type: 'success',
      read: true,
      createdAt: '2024-01-02T00:00:00Z'
    }
  ];

  beforeEach(() => {
    (useNotifications as jest.Mock).mockReturnValue({
      notifications: mockNotifications,
      loading: false,
      markAsRead: jest.fn(),
      deleteNotification: jest.fn()
    });
  });

  it('通知リストを表示する', () => {
    render(<NotificationList />);
    expect(screen.getByText('テスト通知1')).toBeInTheDocument();
    expect(screen.getByText('テスト通知2')).toBeInTheDocument();
  });

  it('未読の通知を強調表示する', () => {
    render(<NotificationList />);
    const unreadNotification = screen.getByText('テスト通知1').closest('div');
    expect(unreadNotification).toHaveClass('bg-blue-50');
  });

  it('通知を既読にする', async () => {
    const mockMarkAsRead = jest.fn();
    (useNotifications as jest.Mock).mockReturnValue({
      notifications: mockNotifications,
      loading: false,
      markAsRead: mockMarkAsRead,
      deleteNotification: jest.fn()
    });

    render(<NotificationList />);
    const markAsReadButton = screen.getAllByText('既読にする')[0];
    fireEvent.click(markAsReadButton);

    expect(mockMarkAsRead).toHaveBeenCalledWith('1');
  });

  it('通知を削除する', async () => {
    const mockDeleteNotification = jest.fn();
    (useNotifications as jest.Mock).mockReturnValue({
      notifications: mockNotifications,
      loading: false,
      markAsRead: jest.fn(),
      deleteNotification: mockDeleteNotification
    });

    render(<NotificationList />);
    const deleteButtons = screen.getAllByText('削除');
    fireEvent.click(deleteButtons[0]);

    expect(mockDeleteNotification).toHaveBeenCalledWith('1');
  });

  it('ローディング状態を表示する', () => {
    (useNotifications as jest.Mock).mockReturnValue({
      notifications: [],
      loading: true,
      markAsRead: jest.fn(),
      deleteNotification: jest.fn()
    });

    render(<NotificationList />);
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });
}); 