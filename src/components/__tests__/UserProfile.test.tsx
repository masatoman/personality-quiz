import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserProfile from '../UserProfile';

// モックデータ
const mockUser = {
  id: 'user123',
  name: 'テストユーザー',
  email: 'test@example.com',
  profile: {
    bio: '自己紹介文です',
    giverScore: 350,
    takerScore: 150,
    matcherScore: 200,
    level: 4,
    joinedDate: '2022-06-01',
    avatarUrl: '/avatars/default.png',
    preferences: {
      notifications: {
        email: true,
        push: false
      },
      privacy: {
        showProfile: true,
        showActivity: true
      }
    }
  }
};

// モック関数
const mockUpdateProfile = jest.fn();
const mockUploadAvatar = jest.fn();
const mockFetchUserProfile = jest.fn().mockResolvedValue(mockUser);

// コンテキストのモック
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'user123', email: 'test@example.com' },
    isAuthenticated: true,
    checkPermission: (permission: string) => permission === 'editOwnProfile'
  })
}));

describe('UserProfile コンポーネント', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ユーザープロフィールを正しく表示する', async () => {
    render(<UserProfile userId="user123" />);
    
    // ユーザープロフィールデータがロードされるのを待機
    await waitFor(() => {
      expect(screen.getByText('テストユーザー')).toBeInTheDocument();
    });
    
    // 基本情報が表示されていることを確認
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('自己紹介文です')).toBeInTheDocument();
    expect(screen.getByText('レベル: 4')).toBeInTheDocument();
    
    // ギバースコアが表示されていることを確認
    expect(screen.getByText('350')).toBeInTheDocument();
    
    // プロフィール画像が表示されていることを確認
    const avatar = screen.getByAltText('ユーザーアバター');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', '/avatars/default.png');
  });

  it('自分のプロフィールを編集できる', async () => {
    render(<UserProfile userId="user123" onUpdateProfile={mockUpdateProfile} />);
    
    // 編集ボタンをクリック
    await waitFor(() => {
      const editButton = screen.getByText('編集');
      expect(editButton).toBeInTheDocument();
      fireEvent.click(editButton);
    });
    
    // 編集モードになることを確認
    const bioInput = screen.getByLabelText('自己紹介');
    expect(bioInput).toBeInTheDocument();
    
    // 自己紹介を編集
    fireEvent.change(bioInput, { target: { value: '新しい自己紹介文です' } });
    
    // 保存ボタンをクリック
    const saveButton = screen.getByText('保存');
    fireEvent.click(saveButton);
    
    // 保存処理が呼び出されることを確認
    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        ...mockUser.profile,
        bio: '新しい自己紹介文です'
      });
    });
  });

  it('他のユーザーのプロフィールは編集ボタンが表示されない', async () => {
    // AuthContextのモックを上書き
    jest.mock('@/contexts/AuthContext', () => ({
      useAuth: () => ({
        user: { uid: 'otherUser', email: 'other@example.com' },
        isAuthenticated: true,
        checkPermission: () => false
      })
    }), { virtual: true });
    
    render(<UserProfile userId="user123" />);
    
    await waitFor(() => {
      expect(screen.getByText('テストユーザー')).toBeInTheDocument();
    });
    
    // 編集ボタンが表示されないことを確認
    expect(screen.queryByText('編集')).not.toBeInTheDocument();
  });

  it('プライバシー設定を変更できる', async () => {
    render(<UserProfile userId="user123" onUpdateProfile={mockUpdateProfile} />);
    
    // 設定タブをクリック
    await waitFor(() => {
      const settingsTab = screen.getByText('設定');
      fireEvent.click(settingsTab);
    });
    
    // プライバシー設定が表示されることを確認
    const profileVisibilityToggle = screen.getByLabelText('プロフィール公開');
    expect(profileVisibilityToggle).toBeInTheDocument();
    
    // 設定を変更
    fireEvent.click(profileVisibilityToggle);
    
    // 保存ボタンをクリック
    const saveButton = screen.getByText('設定を保存');
    fireEvent.click(saveButton);
    
    // 保存処理が呼び出されることを確認
    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        ...mockUser.profile,
        preferences: {
          ...mockUser.profile.preferences,
          privacy: {
            ...mockUser.profile.preferences.privacy,
            showProfile: false // トグルで反転
          }
        }
      });
    });
  });

  it('認証されていない場合はリダイレクトされる', async () => {
    // AuthContextのモックを上書き
    jest.mock('@/contexts/AuthContext', () => ({
      useAuth: () => ({
        user: null,
        isAuthenticated: false,
        checkPermission: () => false
      })
    }), { virtual: true });
    
    const mockNavigate = jest.fn();
    jest.mock('next/navigation', () => ({
      useRouter: () => ({
        push: mockNavigate
      })
    }), { virtual: true });
    
    render(<UserProfile userId="user123" />);
    
    // リダイレクトが呼び出されることを確認
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/auth/login?redirect=/profile/user123');
    });
  });
}); 