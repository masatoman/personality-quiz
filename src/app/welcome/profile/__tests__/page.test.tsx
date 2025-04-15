import { render, screen, fireEvent } from '@testing-library/react'
import ProfileSetupPage from '../page'

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

describe('ProfileSetupPage', () => {
  it('フォームが正しく表示される', () => {
    render(<ProfileSetupPage />)
    
    // 必須フィールドの確認
    expect(screen.getByRole('textbox', { name: 'ニックネーム' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: '学習目標' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: '現在の英語レベル' })).toBeInTheDocument()
  })

  it('バリデーションが正しく機能する', () => {
    render(<ProfileSetupPage />)
    
    // 空のフォームを送信
    fireEvent.click(screen.getByRole('button', { name: 'プロフィールを保存' }))
    
    // 必須フィールドのaria-required属性を確認
    expect(screen.getByRole('textbox', { name: 'ニックネーム' })).toHaveAttribute('aria-required', 'true')
    expect(screen.getByRole('combobox', { name: '現在の英語レベル' })).toHaveAttribute('aria-required', 'true')
    expect(screen.getByRole('combobox', { name: '学習目標' })).toHaveAttribute('aria-required', 'true')
  })

  it('アクセシビリティ要素が正しく設定されている', () => {
    render(<ProfileSetupPage />)
    
    // メインコンテンツのアクセシビリティ
    expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'プロフィール初期設定')
    
    // バナーのロール確認
    expect(screen.getByRole('banner')).toBeInTheDocument()
    
    // 見出しの確認
    expect(screen.getByRole('heading', { name: 'プロフィール設定' })).toBeInTheDocument()
  })

  it('フォーム送信が正しく機能する', () => {
    render(<ProfileSetupPage />)
    
    // フォームに値を入力
    fireEvent.change(screen.getByRole('textbox', { name: 'ニックネーム' }), {
      target: { value: 'テストユーザー' },
    })
    
    // セレクトボックスの値を変更
    fireEvent.mouseDown(screen.getByRole('combobox', { name: '現在の英語レベル' }))
    fireEvent.click(screen.getByText('中級（TOEIC 500-700）'))
    
    fireEvent.mouseDown(screen.getByRole('combobox', { name: '学習目標' }))
    fireEvent.click(screen.getByText('ビジネス英語の習得'))
    
    // フォームを送信
    fireEvent.click(screen.getByRole('button', { name: 'プロフィールを保存' }))
  })
}) 