import React from 'react';
import { useRouter } from 'next/router';

// 教材作成選択画面コンポーネント
const MaterialCreator: React.FC = () => {
  const router = useRouter();

  const handleOptionSelect = (option: 'quick' | 'standard' | 'template') => {
    switch (option) {
      case 'quick':
        router.push('/create/quick');
        break;
      case 'standard':
        router.push('/create/standard/basic-info');
        break;
      case 'template':
        router.push('/create/templates');
        break;
    }
  };

  return (
    <div className="flex flex-col p-4 space-y-6">
      <h1 className="text-2xl font-bold text-center">教材を作成する</h1>
      
      {/* クイック投稿オプション */}
      <div 
        className="border rounded-lg p-4 shadow-sm hover:shadow-md transition cursor-pointer"
        onClick={() => handleOptionSelect('quick')}
      >
        <div className="flex items-center mb-2">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-blue-500 text-xl">⚡</span>
          </div>
          <div>
            <h2 className="font-bold text-lg">クイック投稿</h2>
            <p className="text-sm text-gray-600">簡単に短い教材を作成できます</p>
          </div>
        </div>
        <p className="text-sm text-gray-700">
          • 数分で完成<br />
          • シンプルなテキスト入力<br />
          • 1ページの教材
        </p>
      </div>

      {/* 標準教材作成オプション */}
      <div 
        className="border rounded-lg p-4 shadow-sm hover:shadow-md transition cursor-pointer"
        onClick={() => handleOptionSelect('standard')}
      >
        <div className="flex items-center mb-2">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-green-500 text-xl">📚</span>
          </div>
          <div>
            <h2 className="font-bold text-lg">標準教材作成</h2>
            <p className="text-sm text-gray-600">詳細な設定で高品質な教材を作成</p>
          </div>
        </div>
        <p className="text-sm text-gray-700">
          • 複数セクション対応<br />
          • 画像やメディア追加<br />
          • SEO対策と詳細設定
        </p>
      </div>

      {/* テンプレート選択オプション */}
      <div 
        className="border rounded-lg p-4 shadow-sm hover:shadow-md transition cursor-pointer"
        onClick={() => handleOptionSelect('template')}
      >
        <div className="flex items-center mb-2">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-purple-500 text-xl">📋</span>
          </div>
          <div>
            <h2 className="font-bold text-lg">テンプレートから作成</h2>
            <p className="text-sm text-gray-600">既存のテンプレートを利用して素早く作成</p>
          </div>
        </div>
        <p className="text-sm text-gray-700">
          • 人気の教材形式<br />
          • すぐに編集可能<br />
          • カスタマイズ自由
        </p>
      </div>

      <div className="text-center text-sm text-gray-500 mt-4">
        <p>教材を公開すると<span className="font-bold text-blue-500">ポイント</span>を獲得できます！</p>
      </div>
    </div>
  );
};

export default MaterialCreator; 