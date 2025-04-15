import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import WelcomePage from '../../page'
import { useAuth } from '@/hooks/useAuth'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn()
}))

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

describe('WelcomePage Integration Tests', () => {
  const mockPush = jest.fn()
  const mockUseAuth = useAuth as jest.Mock

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush })
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false
    })
  })

  describe('認証状態との連携', () => {
    it('未ログイン状態で適切なコンテンツが表示される', () => {
      render(<WelcomePage />)
      expect(screen.getByText('新規登録')).toBeInTheDocument()
      expect(screen.getByText('ログイン')).toBeInTheDocument()
    })

    it('ログイン済みの場合はダッシュボードにリダイレクトされる', () => {
      mockUseAuth.mockReturnValue({
        user: { id: '1', name: 'テストユーザー' },
        isLoading: false
      })

      render(<WelcomePage />)
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })

    it('ローディング中は適切な表示がされる', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: true
      })

      render(<WelcomePage />)
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })
  })

  describe('ナビゲーション機能', () => {
    it('診断開始ボタンクリックで適切なページに遷移する', async () => {
      render(<WelcomePage />)
      
      const button = screen.getByText('ギバー診断を始める')
      fireEvent.click(button)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/quiz')
      })
    })

    it('ログインリンクが正しく機能する', async () => {
      render(<WelcomePage />)
      
      const loginLink = screen.getByText('ログイン')
      fireEvent.click(loginLink)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login')
      })
    })
  })

  describe('エラーハンドリング', () => {
    it('認証エラー時に適切なエラーメッセージが表示される', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
        error: new Error('認証エラー')
      })

      render(<WelcomePage />)
      expect(screen.getByText('認証エラーが発生しました')).toBeInTheDocument()
    })
  })
}) 