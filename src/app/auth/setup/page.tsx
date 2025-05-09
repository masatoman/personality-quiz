'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function SetupPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const registerTestUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/setup/register-test-users');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'ユーザー登録に失敗しました');
      }
      
      setResult(data);
    } catch (err: any) {
      setError(err.message);
      console.error('エラー:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">開発環境セットアップ</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">テストユーザー登録</h2>
        <p className="mb-4">
          開発環境用のテストユーザーを登録します。以下のテストユーザーが作成されます：
        </p>
        
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">タイプ</th>
                <th className="py-2 px-4 border-b">メールアドレス</th>
                <th className="py-2 px-4 border-b">パスワード</th>
                <th className="py-2 px-4 border-b">名前</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2 px-4 border-b">ギバー</td>
                <td className="py-2 px-4 border-b">giver@example.com</td>
                <td className="py-2 px-4 border-b">password123</td>
                <td className="py-2 px-4 border-b">ギバー太郎</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b">マッチャー</td>
                <td className="py-2 px-4 border-b">matcher@example.com</td>
                <td className="py-2 px-4 border-b">password123</td>
                <td className="py-2 px-4 border-b">マッチャー花子</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b">テイカー</td>
                <td className="py-2 px-4 border-b">taker@example.com</td>
                <td className="py-2 px-4 border-b">password123</td>
                <td className="py-2 px-4 border-b">テイカー次郎</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b">管理者</td>
                <td className="py-2 px-4 border-b">admin@example.com</td>
                <td className="py-2 px-4 border-b">password123</td>
                <td className="py-2 px-4 border-b">管理者</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <button
          onClick={registerTestUsers}
          disabled={loading}
          className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'ユーザー登録中...' : 'テストユーザーを登録する'}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
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
      
      {result && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{result.message}</p>
              <div className="mt-2">
                <ul className="list-disc pl-5 space-y-1">
                  {result.results && result.results.map((item: any, index: number) => (
                    <li key={index} className="text-sm">
                      {item.email}: {item.status === 'created' ? '作成成功' : item.status === 'exists' ? '既に存在' : 'エラー'} 
                      - {item.message}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-between mt-8">
        <Link 
          href="/auth/login"
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          ログインページへ
        </Link>
        
        <Link 
          href="/"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          ホームに戻る
        </Link>
      </div>
    </div>
  );
} 