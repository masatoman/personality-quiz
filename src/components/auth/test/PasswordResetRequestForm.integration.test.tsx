import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PasswordResetRequestForm from '../PasswordResetRequestForm';
import { createBrowserClient } from '@supabase/ssr';
import { http } from 'msw';
import { server } from '../../../mocks/server';
import { expect, describe, it, beforeAll, afterAll, afterEach, vi } from 'vitest';

// テスト環境のセットアップ
beforeAll(() => {
  // MSWサーバーの起動
  server.listen({ onUnhandledRequest: 'bypass' });
  
  // windowのlocationをモック
  Object.defineProperty(window, 'location', {
    value: { origin: 'http://localhost:3000' },
    writable: true,
  });
});

afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});

afterAll(() => {
  server.close();
});

// 実際のSupabaseクライアントを使用
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
);

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => supabase),
}));

describe('PasswordResetRequestForm Integration', () => {
  it('実際のSupabaseクライアントと統合して動作する', async () => {
    render(<PasswordResetRequestForm />);

    const emailInput = screen.getByLabelText('メールアドレス');
    await userEvent.type(emailInput, 'test@example.com');

    const submitButton = screen.getByRole('button', { name: 'パスワードリセットメールを送信' });
    await userEvent.click(submitButton);

    // 送信中の状態を確認
    expect(screen.getByText('送信中...')).toBeInTheDocument();

    // 結果の確認（エラーまたは成功）
    await waitFor(
      () => {
        expect(
          screen.queryByText('メール送信完了') ||
          screen.queryByText('パスワードリセットメールの送信に失敗しました')
        ).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it('無効なメールアドレスの場合、エラーが表示される', async () => {
    render(<PasswordResetRequestForm />);

    const emailInput = screen.getByLabelText('メールアドレス');
    await userEvent.type(emailInput, 'invalid-email');

    const submitButton = screen.getByRole('button', { name: 'パスワードリセットメールを送信' });
    await userEvent.click(submitButton);

    await waitFor(
      () => {
        expect(screen.getByText(/パスワードリセットメールの送信に失敗しました/)).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it('ネットワークエラー時に適切なエラーメッセージが表示される', async () => {
    // ネットワークエラーをシミュレート
    vi.spyOn(supabase.auth, 'resetPasswordForEmail').mockRejectedValueOnce(
      new Error('ネットワークエラー')
    );

    render(<PasswordResetRequestForm />);

    const emailInput = screen.getByLabelText('メールアドレス');
    await userEvent.type(emailInput, 'test@example.com');

    const submitButton = screen.getByRole('button', { name: 'パスワードリセットメールを送信' });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('ネットワークエラー')).toBeInTheDocument();
    });
  });

  it('フォーム送信後のリダイレクトURLが正しい', async () => {
    const spy = vi.spyOn(supabase.auth, 'resetPasswordForEmail');
    
    render(<PasswordResetRequestForm />);

    const emailInput = screen.getByLabelText('メールアドレス');
    await userEvent.type(emailInput, 'test@example.com');

    const submitButton = screen.getByRole('button', { name: 'パスワードリセットメールを送信' });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith(
        'test@example.com',
        { redirectTo: 'http://localhost:3000/auth/reset-password' }
      );
    });
  });

  it('エラー発生時にエラーメッセージが適切に表示される', async () => {
    server.use(
      http.post(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/recover`, () => {
        return new Response(
          JSON.stringify({ error: 'Invalid email' }),
          { status: 400 }
        );
      })
    );

    render(<PasswordResetRequestForm />);
    
    const emailInput = screen.getByLabelText(/メールアドレス/i);
    await userEvent.type(emailInput, 'invalid@example.com');
    
    const submitButton = screen.getByRole('button', { name: /パスワードをリセット/i });
    await userEvent.click(submitButton);

    const errorMessage = await screen.findByRole('alert');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveClass('text-red-600');
  });

  it('送信中の状態が適切に表示される', async () => {
    server.use(
      http.post(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/recover`, async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return new Response(
          JSON.stringify({ data: null }),
          { status: 200 }
        );
      })
    );

    render(<PasswordResetRequestForm />);
    
    const emailInput = screen.getByLabelText(/メールアドレス/i);
    await userEvent.type(emailInput, 'test@example.com');
    
    const submitButton = screen.getByRole('button', { name: /パスワードをリセット/i });
    await userEvent.click(submitButton);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveAttribute('aria-busy', 'true');

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
  });

  it('displays error message when invalid email is submitted', async () => {
    server.use(
      http.post('*/auth/v1/reset-password-email', () => {
        return new Response(
          JSON.stringify({
            error: 'Invalid email format',
            message: 'メールアドレスの形式が正しくありません。'
          }),
          { status: 400 }
        );
      })
    );

    render(<PasswordResetRequestForm />);
    const emailInput = screen.getByLabelText('メールアドレス');
    const submitButton = screen.getByRole('button', { name: 'パスワードをリセット' });

    await userEvent.type(emailInput, 'invalid-email');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('メールアドレスの形式が正しくありません。')).toBeInTheDocument();
    });
  });

  it('shows loading state while submitting form', async () => {
    server.use(
      http.post('*/auth/v1/reset-password-email', async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return new Response(
          JSON.stringify({}),
          { status: 200 }
        );
      })
    );

    render(<PasswordResetRequestForm />);
    const emailInput = screen.getByLabelText('メールアドレス');
    const submitButton = screen.getByRole('button', { name: 'パスワードをリセット' });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays an error message when invalid email format is submitted', async () => {
    server.use(
      http.post('*/auth/v1/reset-password-for-email', () => {
        return new Response(
          JSON.stringify({
            error: 'メールアドレスの形式が正しくありません。'
          }),
          { status: 400 }
        );
      })
    );

    render(<PasswordResetRequestForm />);
    const emailInput = screen.getByLabelText('メールアドレス');
    const submitButton = screen.getByRole('button', { name: 'パスワードをリセット' });

    await userEvent.type(emailInput, 'invalid-email');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('メールアドレスの形式が正しくありません。')).toBeInTheDocument();
    });
  });

  it('shows loading state while submitting', async () => {
    server.use(
      http.post('*/auth/v1/reset-password-for-email', async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return new Response(
          JSON.stringify({}),
          { status: 200 }
        );
      })
    );

    render(<PasswordResetRequestForm />);
    const emailInput = screen.getByLabelText('メールアドレス');
    const submitButton = screen.getByRole('button', { name: 'パスワードをリセット' });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
}); 