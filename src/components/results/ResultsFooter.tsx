'use client';

import React from 'react';
import Link from 'next/link';
import { 
  FaTwitter, FaFacebook, FaLine, FaInstagram 
} from 'react-icons/fa';

const ResultsFooter: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">英語学習タイプ診断</h3>
            <p className="text-gray-300 text-sm">
              あなたの英語学習スタイルを理解し、最適な学習方法を見つけるためのオンライン診断ツールです。
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">共有する</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-blue-400">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-white hover:text-blue-600">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-white hover:text-green-400">
                <FaLine size={20} />
              </a>
              <a href="#" className="text-white hover:text-pink-500">
                <FaInstagram size={20} />
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">クイック リンク</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white">
                  ホーム
                </Link>
              </li>
              <li>
                <Link href="/quiz" className="text-gray-300 hover:text-white">
                  診断を受ける
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white">
                  このサイトについて
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ResultsFooter; 