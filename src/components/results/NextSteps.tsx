'use client';

import React from 'react';
import Link from 'next/link';
import { FaBook, FaUserFriends } from 'react-icons/fa';

// 次のステップコンポーネント
const NextSteps: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-bold mb-4">次のステップ</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <h3 className="font-bold mb-2 flex items-center">
            <FaBook className="mr-2 text-blue-500" />
            おすすめの学習リソース
          </h3>
          <p>あなたの学習タイプに合った教材やリソースを見つけましょう。</p>
          <Link href="/resources" className="text-blue-600 hover:underline mt-2 inline-block">
            リソースを探す →
          </Link>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="font-bold mb-2 flex items-center">
            <FaUserFriends className="mr-2 text-green-500" />
            学習コミュニティ
          </h3>
          <p>同じ学習タイプの仲間と一緒に学習効果を高めましょう。</p>
          <Link href="/community" className="text-blue-600 hover:underline mt-2 inline-block">
            コミュニティに参加する →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NextSteps; 