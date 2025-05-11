'use client';

import React from 'react';
import Link from 'next/link';
import { FaEnvelope } from 'react-icons/fa';

const VerifyEmailPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <div className="flex justify-center">
            <FaEnvelope className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            メールを確認してください
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            登録したメールアドレスに確認メールを送信しました。
            メール内のリンクをクリックして、アカウントを有効化してください。
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  メールが届かない場合は、迷惑メールフォルダもご確認ください。
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/auth/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              ログインページに戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage; 