'use client';

import React from 'react';
import { FaInfoCircle } from 'react-icons/fa';

interface LoginPromptProps {
  onLogin: () => void;
}

const LoginPrompt: React.FC<LoginPromptProps> = ({ onLogin }) => {
  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
      <div className="flex">
        <div className="flex-shrink-0">
          <FaInfoCircle className="h-5 w-5 text-blue-500" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-blue-700">
            結果を保存してあなたの進捗を追跡するにはログインしてください。
          </p>
          <div className="mt-2">
            <button
              onClick={onLogin}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded"
            >
              ログインして保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPrompt; 