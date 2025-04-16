import { redirect } from 'next/navigation';
import { createClient } from '@/lib/session';
import { type AuthError } from '@supabase/supabase-js';

export default async function AuthCallbackPage() {
  const supabase = createClient();

  try {
    const { error } = await supabase.auth.exchangeCodeForSession(
      String(new URL(window.location.href).searchParams.get('code'))
    );

    if (error) {
      throw error;
    }
  } catch (error) {
    const authError = error as AuthError;
    console.error('認証エラー:', authError.message);
    return redirect('/auth/error?message=' + encodeURIComponent(authError.message));
  }

  return redirect('/dashboard');
} 