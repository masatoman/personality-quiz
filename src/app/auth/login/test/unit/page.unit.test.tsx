import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import LoginPage from '../page';
import { useAuth } from '@/hooks/useAuth';

// モック
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn()
}));

describe('LoginPage', () => {
  const mockRouter = {
    push: jest.fn()
  };
  
  const mockAuth = {
    signIn: jest.fn(),
    signInWithGoogle: jest.fn(),
    signInWithGithub: jest.fn(),
    isLoading: false,
    error: null,
    user: null
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuth as jest.Mock).mockReturnValue(mockAuth);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('正しくレンダリングされること', () => {
    render(<LoginPage />);
    
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
    expect(screen.getByLabelText('ログイン状態を保持する')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'メールアドレスとパスワードでログイン' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Googleアカウントでログイン' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'GitHubアカウントでログイン' })).toBeInTheDocument();
  });

  it('メールとパスワードでログインできること', async () => {
    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');
    const rememberMeCheckbox = screen.getByLabelText('ログイン状態を保持する');
    const submitButton = screen.getByRole('button', { name: 'メールアドレスとパスワードでログイン' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(rememberMeCheckbox);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAuth.signIn).toHaveBeenCalledWith('test@example.com', 'password123', true);
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('Googleログインが機能すること', async () => {
    render(<LoginPage />);
    
    const googleButton = screen.getByRole('button', { name: 'Googleアカウントでログイン' });
    fireEvent.click(googleButton);

    await waitFor(() => {
      expect(mockAuth.signInWithGoogle).toHaveBeenCalled();
    });
  });

  it('GitHubログインが機能すること', async () => {
    render(<LoginPage />);
    
    const githubButton = screen.getByRole('button', { name: 'GitHubアカウントでログイン' });
    fireEvent.click(githubButton);

    await waitFor(() => {
      expect(mockAuth.signInWithGithub).toHaveBeenCalled();
    });
  });

  it('エラーメッセージが表示されること', async () => {
    const mockError = new Error('ログインに失敗しました');
    mockAuth.signIn.mockRejectedValueOnce(mockError);

    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');
    const submitButton = screen.getByRole('button', { name: 'メールアドレスとパスワードでログイン' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('ログインに失敗しました。メールアドレスとパスワードを確認してください。')).toBeInTheDocument();
    });
  });
}); 