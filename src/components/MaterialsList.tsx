import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Material } from '@/types/material';

export default function MaterialsList() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 仮のデータを使用
    const mockMaterials = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        title: 'ギバーのための英会話フレーズ集',
        description: '日常会話で相手を助けるための便利なフレーズを集めました',
        category: 'conversation',
        difficulty: 'beginner',
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        title: 'ビジネス英語：互恵的関係の構築',
        description: 'ビジネスパートナーとWin-Winの関係を築くための英語表現',
        category: 'business',
        difficulty: 'intermediate',
      },
    ];

    setMaterials(mockMaterials);
    setLoading(false);
  }, []);

  if (loading) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {materials.map((material) => (
        <Link
          key={material.id}
          href={`/materials/study/${material.id}`}
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">{material.title}</h2>
          <p className="text-gray-600 mb-4">{material.description}</p>
          <div className="flex items-center justify-between text-sm">
            <span className="px-3 py-1 bg-gray-100 rounded-full">{material.category}</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
              {material.difficulty}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
} 