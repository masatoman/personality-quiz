import { render, screen, fireEvent } from '@testing-library/react'
import WelcomePage from '../../page'

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

describe('WelcomePage Unit Tests', () => {
  describe('表示要素のテスト', () => {
    beforeEach(() => {
      render(<WelcomePage />)
    })

    it('メインコンテンツが正しく表示される', () => {
      expect(screen.getByText('ShiftWithへようこそ！')).toBeInTheDocument()
      expect(screen.getByText('教えることで学ぶ、新しい英語学習の形')).toBeInTheDocument()
    })

    it('3つのステップが正しく表示される', () => {
      const steps = [
        '1. ギバー診断を受ける',
        '2. 教材を作成・共有',
        '3. ポイントを獲得'
      ]
      
      steps.forEach(step => {
        expect(screen.getByText(step)).toBeInTheDocument()
      })
    })

    it('診断開始ボタンが正しく表示される', () => {
      const button = screen.getByText('ギバー診断を始める')
      expect(button).toBeInTheDocument()
      expect(button.closest('a')).toHaveAttribute('href', '/quiz')
    })
  })

  describe('アクセシビリティテスト', () => {
    beforeEach(() => {
      render(<WelcomePage />)
    })

    it('適切なARIA属性が設定されている', () => {
      expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'ウェルカムページ')
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('見出しの階層が適切である', () => {
      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1).toHaveTextContent('ShiftWithへようこそ！')
    })

    it('フォーカス順序が適切である', () => {
      const focusableElements = screen.getAllByRole('link')
      expect(focusableElements.length).toBeGreaterThan(0)
      focusableElements.forEach(element => {
        expect(element).toHaveAttribute('tabIndex', '0')
      })
    })
  })

  describe('レスポンシブ対応テスト', () => {
    it('モバイル表示時のレイアウトが適切である', () => {
      window.innerWidth = 375
      window.dispatchEvent(new Event('resize'))
      render(<WelcomePage />)

      const container = screen.getByRole('main')
      expect(container).toHaveClass('px-4')
    })
  })
}) 