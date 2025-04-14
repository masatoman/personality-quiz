import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserSettings from '../UserSettings';
import { useAuth } from '@/features/auth/AuthProvider';

// AuthProviderのモック
jest.mock('@/features/auth/AuthProvider', () => ({
  useAuth: jest.fn()
}));

// Supabaseクライアントのモック
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: () => ({
    from: () => ({
      update: jest.fn().mockResolvedValue({ data: null, error: null }),
      select: jest.fn().mockResolvedValue({ data: null, error: null })
    })
  })
}));

describe('UserSettings', () => {
  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    settings: {
      emailNotifications: true,
      theme: 'light',
      language: 'ja'
    }
  };

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false
    });
  });

  it('ユーザー設定フォームを表示する', () => {
    render(<UserSettings />);
    expect(screen.getByLabelText('メール通知')).toBeInTheDocument();
    expect(screen.getByLabelText('テーマ')).toBeInTheDocument();
    expect(screen.getByLabelText('言語')).toBeInTheDocument();
  });

  it('設定の変更を保存する', async () => {
    render(<UserSettings />);
    
    const emailNotificationToggle = screen.getByLabelText('メール通知');
    fireEvent.click(emailNotificationToggle);

    const saveButton = screen.getByText('設定を保存');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('設定を保存しました')).toBeInTheDocument();
    });
  });

  it('テーマを切り替える', () => {
    render(<UserSettings />);
    
    const themeSelect = screen.getByLabelText('テーマ');
    fireEvent.change(themeSelect, { target: { value: 'dark' } });

    expect(themeSelect).toHaveValue('dark');
  });

  it('言語を変更する', () => {
    render(<UserSettings />);
    
    const languageSelect = screen.getByLabelText('言語');
    fireEvent.change(languageSelect, { target: { value: 'en' } });

    expect(languageSelect).toHaveValue('en');
  });
}); 