'use client';

import React from 'react';
import Link from 'next/link';
import { 
  FaHome, FaUserCircle, FaSignInAlt 
} from 'react-icons/fa';
import { User } from '@/types/auth';

interface ResultsHeaderProps {
  user: User | null;
  onLogin: () => void;
}

const ResultsHeader: React.FC<ResultsHeaderProps> = ({ user, onLogin }) => {
  return (
    <header className="bg-white shadow-md py-4">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-gray-600 hover:text-gray-900 flex items-center">
            <FaHome className="mr-2" /> ホーム
          </Link>
          <h1 className="text-lg md:text-xl font-bold text-center">英語学習タイプ診断結果</h1>
          {user ? (
            <Link href="/profile" className="text-gray-600 hover:text-gray-900 flex items-center">
              <FaUserCircle className="mr-2" /> プロフィール
            </Link>
          ) : (
            <button 
              onClick={onLogin}
              className="text-gray-600 hover:text-gray-900 flex items-center"
            >
              <FaSignInAlt className="mr-2" /> ログイン
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default ResultsHeader; 