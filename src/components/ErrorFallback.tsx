'use client';

import React from 'react';

const ErrorFallback = () => {
  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md text-center">
      <h2 className="text-xl font-bold text-red-600 mb-4">エラーが発生しました</h2>
      <p className="text-gray-700 mb-4">
        申し訳ありませんが、問題が発生しました。<br />
        ページを再読み込みしても解決しない場合は、運営までご連絡ください。
      </p>
      <p className="text-sm text-gray-500 mb-4">エラーが発生しました</p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        ページを再読み込み
      </button>
    </div>
  );
};

export default ErrorFallback; 