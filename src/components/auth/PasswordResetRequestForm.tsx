import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { HiOutlineMail } from 'react-icons/hi';
import { HiCheckCircle, HiXCircle } from 'react-icons/hi2';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PasswordResetRequestForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'パスワードリセットメールの送信に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg border border-gray-100">
        <div className="flex flex-col items-center text-center space-y-4">
          <HiCheckCircle className="w-16 h-16 text-green-500" />
          <h2 className="text-2xl font-bold text-gray-900">メール送信完了</h2>
          <p className="text-gray-600">
            パスワードリセット用のメールを送信しました。
            <br />
            メールの指示に従ってパスワードを再設定してください。
          </p>
          <p className="text-sm text-gray-500 mt-4">
            メールが届かない場合は、迷惑メールフォルダもご確認ください。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">パスワードをリセット</h2>
        <p className="mt-2 text-gray-600">
          登録したメールアドレスを入力してください。
          <br />
          パスワードリセットの手順を記載したメールをお送りします。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            メールアドレス
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiOutlineMail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="your@email.com"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 flex items-center space-x-3">
            <HiXCircle className="h-5 w-5 text-red-400" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              送信中...
            </>
          ) : (
            'パスワードリセットメールを送信'
          )}
        </button>

        <div className="text-center">
          <a
            href="/auth/login"
            className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            ログインページに戻る
          </a>
        </div>
      </form>
    </div>
  );
} 