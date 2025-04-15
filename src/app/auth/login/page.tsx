'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaEnvelope, FaLock, FaGoogle, FaGithub } from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { signIn, signInWithGoogle, signInWithGithub } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signIn(email, password, rememberMe);
      router.push('/dashboard');
    } catch (err) {
      console.error('ログインエラー:', err);
      setError('ログインに失敗しました。メールアドレスとパスワードを確認してください。');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (err) {
      console.error('Googleログインエラー:', err);
      setError('Googleログインに失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGithub();
      router.push('/dashboard');
    } catch (err) {
      console.error('GitHubログインエラー:', err);
      setError('GitHubログインに失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  // テスト用ユーザーでのログイン（開発環境のみ）
  const loginAsTestUser = (userType: string) => {
    let email = '';
    
    switch (userType) {
      case 'giver':
        email = 'giver@example.com';
        break;
      case 'matcher':
        email = 'matcher@example.com';
        break;
      case 'taker':
        email = 'taker@example.com';
        break;
      case 'admin':
        email = 'admin@example.com';
        break;
    }
    
    setEmail(email);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">アカウントにログイン</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            または{' '}
            <Link href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500">
              新規アカウント登録
            </Link>
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
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
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
                  className="appearance-none rounded-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="メールアドレス"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">パスワード</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="パスワード"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                aria-label="ログイン状態を保持する"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                ログイン状態を保持
              </label>
            </div>

            <div className="text-sm">
              <Link 
                href="/auth/reset-password" 
                className="font-medium text-blue-600 hover:text-blue-500"
                aria-label="パスワードをリセットする"
              >
                パスワードをお忘れですか？
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              disabled={loading}
              aria-label="メールアドレスとパスワードでログイン"
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">またはソーシャルログイン</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
              aria-label="Googleアカウントでログイン"
            >
              <FaGoogle className="mr-2 h-5 w-5 text-red-500" />
              Google
            </button>
            <button
              type="button"
              onClick={handleGithubLogin}
              className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
              aria-label="GitHubアカウントでログイン"
            >
              <FaGithub className="mr-2 h-5 w-5 text-gray-900" />
              GitHub
            </button>
          </div>
        </form>
        
        {/* テスト用ログインボタン（開発環境のみ） */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">テスト用ログイン（開発専用）</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button
                type="button"
                onClick={() => loginAsTestUser('giver')}
                className="text-sm py-2 px-3 border border-blue-300 text-blue-600 rounded hover:bg-blue-50"
              >
                ギバー太郎でログイン
              </button>
              <button
                type="button"
                onClick={() => loginAsTestUser('matcher')}
                className="text-sm py-2 px-3 border border-purple-300 text-purple-600 rounded hover:bg-purple-50"
              >
                マッチャー花子でログイン
              </button>
              <button
                type="button"
                onClick={() => loginAsTestUser('taker')}
                className="text-sm py-2 px-3 border border-green-300 text-green-600 rounded hover:bg-green-50"
              >
                テイカー次郎でログイン
              </button>
              <button
                type="button"
                onClick={() => loginAsTestUser('admin')}
                className="text-sm py-2 px-3 border border-red-300 text-red-600 rounded hover:bg-red-50"
              >
                管理者でログイン
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage; 