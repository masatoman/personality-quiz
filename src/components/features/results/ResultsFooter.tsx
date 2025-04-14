import React from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaShare } from 'react-icons/fa';

const ResultsFooter: React.FC = () => {
  return (
    <footer className="mt-8 flex flex-col md:flex-row items-center justify-between">
      <Link
        href="/quiz"
        className="flex items-center text-blue-600 hover:text-blue-700 mb-4 md:mb-0"
      >
        <FaArrowLeft className="mr-2" />
        もう一度診断する
      </Link>
      
      <div className="flex items-center space-x-4">
        <button
          onClick={() => window.print()}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded transition-colors"
        >
          結果を印刷
        </button>
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'ShiftWith 学習タイプ診断結果',
                text: '私の学習タイプを診断してみました！',
                url: window.location.href
              });
            }
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors flex items-center"
        >
          <FaShare className="mr-2" />
          結果をシェア
        </button>
      </div>
    </footer>
  );
};

export default ResultsFooter; 