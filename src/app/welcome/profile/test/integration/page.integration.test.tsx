import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import ProfileSetupPage from '../../page'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn()
}))

jest.mock('@/hooks/useProfile', () => ({
  useProfile: jest.fn()
}))

describe('ProfileSetupPage Integration Tests', () => {
  const mockPush = jest.fn()
  const mockUseAuth = useAuth as jest.Mock
  const mockUseProfile = useProfile as jest.Mock
  const mockUpdateProfile = jest.fn()

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush })
    mockUseAuth.mockReturnValue({
      user: { id: '1', name: 'テストユーザー' },
      isLoading: false
    })
    mockUseProfile.mockReturnValue({
      updateProfile: mockUpdateProfile,
      isLoading: false
    })
  })

  describe('プロフィール更新機能', () => {
    it('プロフィールが正常に更新される', async () => {
      render(<ProfileSetupPage />)

      // フォームに値を入力
      fireEvent.change(screen.getByLabelText('ニックネーム'), {
        target: { value: 'テストユーザー' }
      })

      fireEvent.change(screen.getByLabelText('自己紹介'), {
        target: { value: 'テストの自己紹介文です。' }
      })

      // セレクトボックスの値を設定
      fireEvent.mouseDown(screen.getByLabelText('現在の英語レベル'))
      fireEvent.click(screen.getByText('中級（TOEIC 500-700）'))

      fireEvent.mouseDown(screen.getByLabelText('学習目標'))
      fireEvent.click(screen.getByText('ビジネス英語の習得'))

      fireEvent.mouseDown(screen.getByLabelText('1日の学習目標時間'))
      fireEvent.click(screen.getByText('30分'))

      // フォームを送信
      fireEvent.click(screen.getByRole('button', { name: 'プロフィールを保存' }))

      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalledWith({
          nickname: 'テストユーザー',
          bio: 'テストの自己紹介文です。',
          englishLevel: 'intermediate',
          studyGoal: 'business',
          studyTimePerDay: '30',
          notificationFrequency: 'daily'
        })
      })

      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  describe('エラーハンドリング', () => {
    it('必須フィールドが未入力の場合にエラーが表示される', async () => {
      render(<ProfileSetupPage />)

      // 空のフォームを送信
      fireEvent.click(screen.getByRole('button', { name: 'プロフィールを保存' }))

      await waitFor(() => {
        expect(screen.getByText('ニックネームは必須です')).toBeInTheDocument()
        expect(screen.getByText('英語レベルを選択してください')).toBeInTheDocument()
        expect(screen.getByText('学習目標を選択してください')).toBeInTheDocument()
      })
    })

    it('プロフィール更新に失敗した場合にエラーが表示される', async () => {
      mockUpdateProfile.mockRejectedValueOnce(new Error('更新に失敗しました'))
      render(<ProfileSetupPage />)

      // フォームに必要最小限の値を入力
      fireEvent.change(screen.getByLabelText('ニックネーム'), {
        target: { value: 'テストユーザー' }
      })

      fireEvent.mouseDown(screen.getByLabelText('現在の英語レベル'))
      fireEvent.click(screen.getByText('中級（TOEIC 500-700）'))

      fireEvent.mouseDown(screen.getByLabelText('学習目標'))
      fireEvent.click(screen.getByText('ビジネス英語の習得'))

      // フォームを送信
      fireEvent.click(screen.getByRole('button', { name: 'プロフィールを保存' }))

      await waitFor(() => {
        expect(screen.getByText('プロフィールの更新に失敗しました')).toBeInTheDocument()
      })
    })
  })

  describe('ローディング状態', () => {
    it('プロフィール更新中はローディング表示される', async () => {
      mockUseProfile.mockReturnValue({
        updateProfile: mockUpdateProfile,
        isLoading: true
      })

      render(<ProfileSetupPage />)
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'プロフィールを保存' })).toBeDisabled()
    })
  })
}) 