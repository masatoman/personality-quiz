/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */

import { Material, Difficulty } from '@/types/material';

// 教材データを取得する関数
export const getMaterial = async (_id: string): Promise<Material> => {
  return {
    id: "1",
    title: "TypeScriptの基礎",
    description: "TypeScriptの基本的な概念と使い方を学びます",
    difficulty: "beginner" as Difficulty,
    estimatedTime: 30,
    createdAt: "2024-03-20T00:00:00Z",
    updatedAt: "2024-03-20T00:00:00Z",
    author: {
      id: "author1",
      name: "山田太郎",
      avatarUrl: "https://example.com/avatar.jpg",
      expertise: ["TypeScript", "JavaScript"]
    },
    targetAudience: ["beginner", "student"],
    language: "ja",
    version: "1.0.0",
    sections: [
      {
        id: "section1",
        type: "text",
        title: "TypeScriptとは",
        content: "TypeScriptはJavaScriptのスーパーセットで、静的型付けを提供します。",
        format: "markdown"
      },
      {
        id: "section2",
        type: "image",
        title: "型システムの概要",
        imageUrl: "https://example.com/typescript-types.png",
        caption: "TypeScriptの型システム概要図",
        altText: "TypeScriptの型システムを図示した概要図",
        description: "TypeScriptの型システムの主要な機能を示す図解です。"
      },
      {
        id: "section3",
        type: "quiz",
        title: "理解度チェック",
        description: "TypeScriptの基本概念の理解度を確認します",
        timeLimit: 10,
        questions: [
          {
            id: "q1",
            question: "TypeScriptは何のスーパーセットですか？",
            options: [
              { id: "a", text: "JavaScript" },
              { id: "b", text: "Python" },
              { id: "c", text: "Java" },
              { id: "d", text: "C++" }
            ],
            correctAnswer: "a",
            explanation: "TypeScriptはJavaScriptのスーパーセットです。",
            points: 10
          }
        ]
      }
    ],
    reviews: [
      {
        id: "review1",
        userId: "user1",
        userName: "鈴木一郎",
        userAvatarUrl: "https://example.com/user1.jpg",
        rating: 5,
        comment: "とても分かりやすい教材でした。",
        createdAt: "2024-03-21T00:00:00Z",
        helpful: 3
      }
    ],
    relatedMaterials: [
      {
        id: "2",
        title: "TypeScriptの高度な型システム",
        difficulty: "intermediate" as Difficulty,
        estimatedTime: 45,
        rating: 4.5,
        reviewCount: 10,
        thumbnailUrl: "https://example.com/advanced-ts.png"
      }
    ],
    tags: ["TypeScript", "プログラミング", "入門"]
  };
};

// 教材の一覧を取得する関数
export async function getMaterials(_options?: {
  category?: string;
  difficulty?: Difficulty;
  sort?: string;
  page?: number;
  limit?: number;
}): Promise<Material[]> {
  // モックデータを返す
  const mockMaterials: Material[] = [
    {
      id: "1",
      title: "TypeScriptの基礎",
      description: "TypeScriptの基本的な概念と使い方を学びます",
      difficulty: "beginner" as Difficulty,
      estimatedTime: 30,
      createdAt: "2024-03-20T00:00:00Z",
      updatedAt: "2024-03-20T00:00:00Z",
      author: {
        id: "author1",
        name: "山田太郎",
        avatarUrl: "https://example.com/avatar.jpg",
        expertise: ["TypeScript", "JavaScript"]
      },
      targetAudience: ["beginner", "student"],
      language: "ja",
      version: "1.0.0",
      sections: [
        {
          id: "section1",
          type: "text",
          title: "TypeScriptとは",
          content: "TypeScriptはJavaScriptのスーパーセットで、静的型付けを提供します。",
          format: "markdown"
        }
      ],
      reviews: [],
      relatedMaterials: [],
      tags: ["TypeScript", "プログラミング", "入門"]
    },
    {
      id: "2",
      title: "TypeScriptの高度な型システム",
      description: "TypeScriptの高度な型システムについて学びます",
      difficulty: "intermediate" as Difficulty,
      estimatedTime: 45,
      createdAt: "2024-03-21T00:00:00Z",
      updatedAt: "2024-03-21T00:00:00Z",
      author: {
        id: "author2",
        name: "佐藤花子",
        avatarUrl: "https://example.com/author2.jpg",
        expertise: ["TypeScript", "型システム"]
      },
      targetAudience: ["intermediate", "developer"],
      language: "ja",
      version: "1.0.0",
      sections: [
        {
          id: "section1",
          type: "text",
          title: "ジェネリクスの基礎",
          content: "TypeScriptのジェネリクスについて詳しく解説します。",
          format: "markdown"
        }
      ],
      reviews: [],
      relatedMaterials: [],
      tags: ["TypeScript", "ジェネリクス", "中級"]
    }
  ];

  return mockMaterials;
} 