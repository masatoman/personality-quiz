import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Material } from '@/types/material';

export default function MaterialsList() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 仮のデータを使用
    const mockMaterials: Material[] = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        title: 'ギバーのための英会話フレーズ集',
        description: '日常会話で相手を助けるための便利なフレーズを集めました',
        category: 'conversation',
        difficulty: 'beginner',
        estimatedTime: 30,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        author: {
          id: 'author1',
          name: '田中太郎',
          avatarUrl: '/avatars/default.png',
          bio: '英語教育の専門家',
          expertise: ['英会話', '教育']
        },
        targetAudience: ['beginner'],
        language: 'ja',
        version: '1.0',
        sections: [],
        reviews: [],
        relatedMaterials: [],
        tags: ['英会話', 'フレーズ'],
        status: 'published',
        view_count: 100,
        rating: 4.5
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        title: 'ビジネス英語：互恵的関係の構築',
        description: 'ビジネスパートナーとWin-Winの関係を築くための英語表現',
        category: 'business',
        difficulty: 'intermediate',
        estimatedTime: 45,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        author: {
          id: 'author2',
          name: '佐藤花子',
          avatarUrl: '/avatars/default.png',
          bio: 'ビジネス英語の専門家',
          expertise: ['ビジネス英語', 'コミュニケーション']
        },
        targetAudience: ['professional'],
        language: 'ja',
        version: '1.0',
        sections: [],
        reviews: [],
        relatedMaterials: [],
        tags: ['ビジネス英語', '関係構築'],
        status: 'published',
        view_count: 150,
        rating: 4.8
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