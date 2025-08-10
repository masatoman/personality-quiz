'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaEnvelope, FaLock, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';
import { getClient } from '@/lib/supabase/client';

const ResetPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [mode, setMode] = useState<'request' | 'update'>('request');
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword } = useAuth();

  useEffect(() => {
    // URLパラメータを確認してモードを決定
    const modeParam = searchParams.get('mode');
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    
    if (modeParam === 'update' && accessToken && refreshToken) {
      setMode('update');
      // セッションを設定
      const supabase = getClient();
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
    } else {
      setMode('request');
    }
  }, [searchParams]);

  // パスワードの一致確認
  useEffect(() => {
    if (mode === 'update' && newPassword && confirmPassword) {
      setPasswordMismatch(newPassword !== confirmPassword);
    }
  }, [newPassword, confirmPassword, mode]);

  // パスワードリセットメール送信リクエスト
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await resetPassword(email);
      setSuccess('パスワードリセット用のメールを送信しました。メールボックスをご確認ください。');
      setEmail('');
    } catch (err) {
      console.error('パスワードリセットエラー:', err);
      setError('パスワードリセットメールの送信に失敗しました。メールアドレスをご確認ください。');
    } finally {
      setLoading(false);
    }
  };

  // 新しいパスワードの設定
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordMismatch) {
      setError('パスワードが一致しません。');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const supabase = getClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setSuccess('パスワードが正常に更新されました。ログインページに移動します。');
      
      // 3秒後にログインページにリダイレクト
      setTimeout(() => {
        router.push('/auth/login?message=パスワードが更新されました');
      }, 3000);
    } catch (err) {
      console.error('パスワード更新エラー:', err);
      setError('パスワードの更新に失敗しました。再度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {mode === 'request' ? 'パスワードリセット' : '新しいパスワード設定'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {mode === 'request' ? (
              <>
                メールアドレスを入力してください。パスワードリセット用のリンクをお送りします。
              </>
            ) : (
              <>
                新しいパスワードを設定してください。
              </>
            )}
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}
        
        {mode === 'request' ? (
          // パスワードリセットリクエストフォーム
          <form className="mt-8 space-y-6" onSubmit={handleRequestReset}>
            <div>
              <label htmlFor="email-address" className="sr-only">メールアドレス</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="メールアドレス"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
                disabled={loading}
              >
                {loading ? 'メール送信中...' : 'パスワードリセットメールを送信'}
              </button>
            </div>
          </form>
        ) : (
          // 新しいパスワード設定フォーム
          <form className="mt-8 space-y-6" onSubmit={handleUpdatePassword}>
            <div className="space-y-4">
              <div>
                <label htmlFor="new-password" className="sr-only">新しいパスワード</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="new-password"
                    name="new-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="appearance-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="新しいパスワード"
                    minLength={6}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="confirm-password" className="sr-only">パスワード（確認）</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`appearance-none relative block w-full px-3 py-3 pl-10 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm ${
                      passwordMismatch ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="パスワード（確認）"
                    minLength={6}
                  />
                </div>
              </div>
            </div>

            {passwordMismatch && (
              <p className="text-sm text-red-600">パスワードが一致しません</p>
            )}

            <div>
              <button
                type="submit"
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  loading || passwordMismatch ? 'opacity-70 cursor-not-allowed' : ''
                }`}
                disabled={loading || passwordMismatch}
              >
                {loading ? 'パスワード更新中...' : 'パスワードを更新'}
              </button>
            </div>
          </form>
        )}

        {mode === 'request' && (
          <div className="text-center">
            <Link 
              href="/auth/login" 
              className="inline-flex items-center font-medium text-blue-600 hover:text-blue-500"
            >
              <FaArrowLeft className="mr-2 h-4 w-4" />
              ログインページに戻る
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
