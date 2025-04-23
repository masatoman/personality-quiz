import { supabase } from '@/lib/supabase/client';
import { AuthError } from '@supabase/supabase-js';

export interface EmailAuthResponse {
  success: boolean;
  error?: string;
  user?: any;
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<EmailAuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      user: data.user,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof AuthError ? error.message : '認証エラーが発生しました',
    };
  }
}

export async function signUpWithEmail(
  email: string,
  password: string,
  options?: { username?: string }
): Promise<EmailAuthResponse> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: options?.username,
        },
      },
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // メール確認が必要な場合
    if (data.user?.confirmationSentAt) {
      return {
        success: true,
        user: data.user,
        error: 'メール確認が必要です。メールボックスを確認してください。',
      };
    }

    return {
      success: true,
      user: data.user,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof AuthError ? error.message : 'アカウント作成エラーが発生しました',
    };
  }
}

export async function resetPassword(email: string): Promise<EmailAuthResponse> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      error: 'パスワードリセット用のメールを送信しました。',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof AuthError ? error.message : 'パスワードリセットエラーが発生しました',
    };
  }
}

export async function updatePassword(
  newPassword: string
): Promise<EmailAuthResponse> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      error: 'パスワードを更新しました。',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof AuthError ? error.message : 'パスワード更新エラーが発生しました',
    };
  }
} 