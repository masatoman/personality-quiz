import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaStar, FaUser, FaEye } from 'react-icons/fa';

// ダミーデータ（後でAPIから取得）
const featuredMaterials = [
  {
    id: 1,
    title: 'ビジネス英語の基礎',
    description: 'メールやミーティングで使える実践的なビジネス英語を学びましょう。',
    thumbnail: '/images/materials/business-english.jpg',
    author: '田中 健太',
    rating: 4.8,
    views: 1250,
    level: '中級'
  },
  {
    id: 2,
    title: 'TOEIC頻出フレーズ',
    description: 'TOEICでよく出題される重要フレーズを効率的に学習できます。',
    thumbnail: '/images/materials/toeic-phrases.jpg',
    author: '鈴木 さやか',
    rating: 4.9,
    views: 2100,
    level: '中級'
  },
  {
    id: 3,
    title: '日常会話マスター',
    description: '海外旅行や日常生活で使える実用的な英会話フレーズ集です。',
    thumbnail: '/images/materials/daily-conversation.jpg',
    author: '高橋 美咲',
    rating: 4.7,
    views: 980,
    level: '初級'
  }
];

export default function FeaturedMaterials() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-bold">人気の教材</h2>
          <Link
            href="/materials"
            className="text-primary hover:text-primary-dark transition-colors"
          >
            すべての教材を見る →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredMaterials.map((material) => (
            <Link
              key={material.id}
              href={`/materials/${material.id}`}
              className="block group"
            >
              <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={material.thumbnail}
                    alt={material.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-white px-3 py-1 rounded-full text-sm font-medium">
                    {material.level}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {material.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {material.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <FaUser className="mr-1" />
                      {material.author}
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <FaStar className="text-yellow-400 mr-1" />
                        {material.rating}
                      </div>
                      <div className="flex items-center">
                        <FaEye className="mr-1" />
                        {material.views}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
} 