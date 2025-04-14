import React from 'react';
import { FaSignInAlt } from 'react-icons/fa';

interface LoginPromptProps {
  onLogin: () => void;
}

const LoginPrompt: React.FC<LoginPromptProps> = ({ onLogin }) => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center">
        <FaSignInAlt className="text-blue-500 text-xl mr-3" />
        <div>
          <h3 className="font-semibold text-blue-800">結果を保存しませんか？</h3>
          <p className="text-blue-600 text-sm">
            ログインすると、診断結果を保存して後で見返すことができます。
          </p>
        </div>
        <button
          onClick={onLogin}
          className="ml-auto bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          ログイン
        </button>
      </div>
    </div>
  );
};

export default LoginPrompt; 