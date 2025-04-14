import Link from 'next/link';
import { Material } from '@/types/material';

const getMaterials = (): Material[] => {
  return [
    {
      id: '1',
      title: '基礎から学ぶReact',
      description: 'Reactの基本概念と実践的な使い方を学びます',
      category: 'フロントエンド',
      difficulty: 'beginner',
      sections: []
    },
    {
      id: '2',
      title: 'TypeScriptの実践的な使い方',
      description: 'TypeScriptの高度な型システムと実践的なパターンを解説',
      category: 'プログラミング言語',
      difficulty: 'intermediate',
      sections: []
    },
    {
      id: '3',
      title: 'Next.jsアプリケーション開発',
      description: 'Next.jsを使用したフルスタックアプリケーションの開発手法',
      category: 'フレームワーク',
      difficulty: 'advanced',
      sections: []
    }
  ];
};

export default function MaterialsList() {
  const materials = getMaterials();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {materials.map((material) => (
        <Link
          key={material.id}
          href={`/materials/${material.id}`}
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h3 className="text-xl font-semibold mb-2">{material.title}</h3>
          <p className="text-gray-600 mb-4">{material.description}</p>
          <div className="flex justify-between items-center">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {material.category}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm ${
              material.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
              material.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {material.difficulty}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
} 