import { supabase } from '@/lib/supabase/client';
import { AuthError, Provider } from '@supabase/supabase-js';

export interface SocialAuthResponse {
  success: boolean;
  error?: string;
  user?: any;
}

export async function signInWithSocial(
  provider: Provider
): Promise<SocialAuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
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
      error: error instanceof AuthError ? error.message : 'ソーシャルログインエラーが発生しました',
    };
  }
}

export async function handleAuthCallback(): Promise<SocialAuthResponse> {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    if (!data.session) {
      return {
        success: false,
        error: 'セッションが見つかりません',
      };
    }

    return {
      success: true,
      user: data.session.user,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof AuthError ? error.message : '認証コールバックエラーが発生しました',
    };
  }
}

export async function linkSocialAccount(
  provider: Provider
): Promise<SocialAuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/settings/account`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
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
      error: error instanceof AuthError ? error.message : 'アカウント連携エラーが発生しました',
    };
  }
}

export async function unlinkSocialAccount(
  provider: Provider
): Promise<SocialAuthResponse> {
  try {
    const { error } = await supabase.auth.unlinkIdentity(provider);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      error: 'アカウントの連携を解除しました',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof AuthError ? error.message : 'アカウント連携解除エラーが発生しました',
    };
  }
} 