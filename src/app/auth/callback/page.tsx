'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setIsProcessing(true);
        setError(null);

        // URLハッシュから認証情報を取得
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('セッション取得エラー:', sessionError);
          setError('認証中にエラーが発生しました。');
          return;
        }

        if (!data.session?.user) {
          console.error('セッション情報が存在しません');
          setError('認証情報が見つかりませんでした。');
          return;
        }

        const user = data.session.user;
        console.log('認証成功:', user.email);

        // プロフィールの存在確認
        const { data: existingProfile, error: profileCheckError } = await supabase
          .from('profiles')
          .select('id, display_name')
          .eq('id', user.id)
          .single();

        if (profileCheckError && profileCheckError.code !== 'PGRST116') {
          // PGRST116 = Row not found (期待される場合がある)
          console.error('プロフィール確認エラー:', profileCheckError);
        }

        // プロフィールが存在しない場合は作成
        if (!existingProfile) {
          console.log('プロフィールを作成中...');
          
          const { error: profileCreateError } = await supabase
            .from('profiles')
            .insert([
              {
                id: user.id,
                display_name: user.user_metadata?.name || user.email?.split('@')[0] || 'ユーザー',
                email: user.email,
                avatar_url: user.user_metadata?.avatar_url || null,
                bio: null,
                personality_type: null,
                giver_score: 50, // デフォルトスコア
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ]);

          if (profileCreateError) {
            console.error('プロフィール作成エラー:', profileCreateError);
            // プロフィール作成に失敗してもログインは継続
          } else {
            console.log('プロフィール作成成功');
          }

          // 新規ユーザーはウェルカムページへ誘導
          const welcomeUrl = new URL('/welcome', window.location.origin);
          welcomeUrl.searchParams.set('first_login', 'true');
          console.log('新規ユーザーをウェルカムページへ誘導:', welcomeUrl.pathname + welcomeUrl.search);
          router.push(welcomeUrl.pathname + welcomeUrl.search);
          return;
        }

        // クエリパラメータから元のページを取得
        const urlParams = new URLSearchParams(window.location.search);
        const redirectTo = urlParams.get('redirect') || '/dashboard';

        // 成功メッセージを表示するためのフラグをセット
        const redirectUrl = new URL(redirectTo, window.location.origin);
        redirectUrl.searchParams.set('auth_success', 'true');

        console.log('リダイレクト先:', redirectUrl.pathname + redirectUrl.search);
        router.push(redirectUrl.pathname + redirectUrl.search);

      } catch (error) {
        console.error('認証コールバック処理エラー:', error);
        setError('認証処理中に予期しないエラーが発生しました。');
      } finally {
        setIsProcessing(false);
      }
    };

    // URLハッシュが変更された時に実行
    if (typeof window !== 'undefined') {
      handleAuthCallback();
    }
  }, [router]);

  // エラー時の表示
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">認証エラー</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-2">
            <button
              onClick={() => router.push('/auth/login')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              ログインページへ戻る
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              再試行
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 処理中の表示
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">
          {isProcessing ? '認証を確認中...' : '認証完了'}
        </p>
        <p className="mt-2 text-sm text-gray-500">
          数秒でリダイレクトされます
        </p>
      </div>
    </div>
  );
} 