'use client';

import React, { useEffect } from 'react';

export default function TestUIPage() {
  useEffect(() => {
    const form = document.getElementById('validationForm');
    const requiredField = document.getElementById('requiredField') as HTMLInputElement;
    const validationMessage = document.getElementById('validationMessage');

    if (form && requiredField && validationMessage) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!requiredField.value) {
          validationMessage.textContent = 'このフィールドは必須です';
        } else {
          validationMessage.textContent = '';
        }
      });
    }
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">テストUI</h1>
      
      {/* フォームセクション */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">フォームテスト</h2>
        <form id="testForm" className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              メールアドレス
            </label>
            <input
              type="email"
              id="email"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="checkbox"
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="checkbox" className="ml-2 block text-sm text-gray-700">
              同意する
            </label>
          </div>
          
          <div className="flex space-x-4">
            <button
              type="submit"
              id="submitButton"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              送信
            </button>
            <button
              type="button"
              id="testButton"
              disabled
              className="px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed"
            >
              テストボタン
            </button>
          </div>
        </form>
      </section>

      {/* スタイルテストセクション */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">スタイルテスト</h2>
        <div id="styledElement" className="text-red-600 font-bold">
          赤いテキスト
        </div>
        <div id="hiddenElement" className="hidden">
          非表示コンテンツ
        </div>
      </section>

      {/* イベントテストセクション */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">イベントテスト</h2>
        <button
          id="eventButton"
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          イベントテスト
        </button>
      </section>

      {/* バリデーションテストセクション */}
      <section>
        <h2 className="text-xl font-semibold mb-4">バリデーションテスト</h2>
        <form id="validationForm" className="space-y-4">
          <div>
            <label htmlFor="requiredField" className="block text-sm font-medium text-gray-700">
              必須フィールド
            </label>
            <input
              type="text"
              id="requiredField"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <span id="validationMessage" className="text-red-600 text-sm mt-1 block"></span>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            検証
          </button>
        </form>
      </section>
    </div>
  );
} 