import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PasswordResetRequestForm from '../PasswordResetRequestForm';
import { createBrowserClient } from '@supabase/ssr';

// Supabaseクライアントのモック
jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(() => ({
    auth: {
      resetPasswordForEmail: jest.fn(),
    },
  })),
}));

describe('PasswordResetRequestForm', () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      auth: {
        resetPasswordForEmail: jest.fn()
      }
    };
    (createBrowserClient as jest.Mock).mockReturnValue(mockSupabase);
    // windowのlocationをモック
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:3000' },
      writable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('正しくフォームが表示される', () => {
    render(<PasswordResetRequestForm />);
    
    expect(screen.getByText('パスワードをリセット')).toBeInTheDocument();
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'パスワードリセットメールを送信' })).toBeInTheDocument();
  });

  it('メールアドレスが入力されていない場合、エラーメッセージを表示する', async () => {
    render(<PasswordResetRequestForm />);
    
    const submitButton = screen.getByRole('button', { name: /パスワードをリセット/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText('メールアドレスを入力してください')).toBeInTheDocument();
    expect(mockSupabase.auth.resetPasswordForEmail).not.toHaveBeenCalled();
  });

  it('無効なメールアドレスが入力された場合、エラーメッセージを表示する', async () => {
    render(<PasswordResetRequestForm />);
    
    const emailInput = screen.getByLabelText(/メールアドレス/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    const submitButton = screen.getByRole('button', { name: /パスワードをリセット/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText('有効なメールアドレスを入力してください')).toBeInTheDocument();
    expect(mockSupabase.auth.resetPasswordForEmail).not.toHaveBeenCalled();
  });

  it('パスワードリセットリクエストが成功した場合、成功メッセージを表示する', async () => {
    mockSupabase.auth.resetPasswordForEmail.mockResolvedValueOnce({ error: null });
    render(<PasswordResetRequestForm />);
    
    const emailInput = screen.getByLabelText(/メールアドレス/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    const submitButton = screen.getByRole('button', { name: /パスワードをリセット/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/パスワードリセットのメールを送信しました/i)).toBeInTheDocument();
    });
    expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('test@example.com');
  });

  it('パスワードリセットリクエストが失敗した場合、エラーメッセージを表示する', async () => {
    mockSupabase.auth.resetPasswordForEmail.mockRejectedValueOnce(new Error('エラーが発生しました'));
    render(<PasswordResetRequestForm />);
    
    const emailInput = screen.getByLabelText(/メールアドレス/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    const submitButton = screen.getByRole('button', { name: /パスワードをリセット/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/エラーが発生しました/i)).toBeInTheDocument();
    });
    expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('test@example.com');
  });

  it('送信中はボタンが無効化される', async () => {
    mockSupabase.auth.resetPasswordForEmail.mockImplementationOnce(() => new Promise(() => {}));
    
    render(<PasswordResetRequestForm />);
    
    const emailInput = screen.getByLabelText('メールアドレス');
    await userEvent.type(emailInput, 'test@example.com');
    
    const submitButton = screen.getByRole('button', { name: 'パスワードリセットメールを送信' });
    await userEvent.click(submitButton);
    
    expect(screen.getByText('送信中...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('ログインページへのリンクが機能する', () => {
    render(<PasswordResetRequestForm />);
    
    const loginLink = screen.getByText('ログインページに戻る');
    expect(loginLink).toHaveAttribute('href', '/auth/login');
  });

  it('エラーメッセージが適切なスタイリングで表示される', async () => {
    render(<PasswordResetRequestForm />);
    
    const submitButton = screen.getByRole('button', { name: /パスワードをリセット/i });
    fireEvent.click(submitButton);

    const errorMessage = await screen.findByText('メールアドレスを入力してください');
    expect(errorMessage).toHaveClass('text-red-600');
    expect(errorMessage.parentElement).toHaveClass('flex items-center gap-2');
  });

  it('成功メッセージが適切なスタイリングで表示される', async () => {
    mockSupabase.auth.resetPasswordForEmail.mockResolvedValueOnce({ error: null });
    render(<PasswordResetRequestForm />);
    
    const emailInput = screen.getByLabelText(/メールアドレス/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    const submitButton = screen.getByRole('button', { name: /パスワードをリセット/i });
    fireEvent.click(submitButton);

    const successMessage = await screen.findByText(/パスワードリセットのメールを送信しました/i);
    expect(successMessage).toHaveClass('text-green-600');
    expect(successMessage.parentElement).toHaveClass('flex items-center gap-2');
  });

  it('アクセシビリティ要件を満たしている', () => {
    render(<PasswordResetRequestForm />);
    
    // フォームのラベルとinputの関連付け
    const emailInput = screen.getByLabelText('メールアドレス');
    expect(emailInput).toHaveAttribute('aria-required', 'true');
    
    // エラー状態の通知
    fireEvent.click(screen.getByRole('button', { name: /パスワードをリセット/i }));
    const errorMessage = screen.getByText('メールアドレスを入力してください');
    expect(errorMessage).toHaveAttribute('role', 'alert');
    
    // ボタンの状態
    const submitButton = screen.getByRole('button', { name: /パスワードをリセット/i });
    expect(submitButton).toHaveAttribute('aria-busy', 'false');
  });

  it('ローディング状態のボタンが適切に表示される', async () => {
    mockSupabase.auth.resetPasswordForEmail.mockImplementationOnce(() => new Promise(() => {}));
    render(<PasswordResetRequestForm />);
    
    const emailInput = screen.getByLabelText('メールアドレス');
    await userEvent.type(emailInput, 'test@example.com');
    
    const submitButton = screen.getByRole('button', { name: 'パスワードリセットメールを送信' });
    await userEvent.click(submitButton);
    
    expect(submitButton).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
}); 