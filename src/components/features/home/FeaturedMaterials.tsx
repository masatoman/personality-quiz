'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaStar, FaUser, FaEye } from 'react-icons/fa';

interface Material {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  author?: string;
  rating: number;
  view_count: number;
  difficulty_level: number;
}

export default function FeaturedMaterials() {
  const [featuredMaterials, setFeaturedMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedMaterials = async () => {
      try {
        const response = await fetch('/api/materials?featured=true&limit=3');
        const data = await response.json();
        
        if (data.success) {
          setFeaturedMaterials(data.materials || []);
        }
      } catch (error) {
        console.error('人気教材の取得エラー:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedMaterials();
  }, []);

  const getDifficultyLabel = (level: number) => {
    switch (level) {
      case 1: return '初級';
      case 2: return '中級';
      case 3: return '上級';
      default: return '初級';
    }
  };

  if (loading) {
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
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                <div className="relative h-48 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

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
                    src={material.thumbnail || '/images/materials/default.jpg'}
                    alt={material.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-white px-3 py-1 rounded-full text-sm font-medium">
                    {getDifficultyLabel(material.difficulty_level)}
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
                      {material.author || '匿名'}
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <FaStar className="text-yellow-400 mr-1" />
                        {material.rating.toFixed(1)}
                      </div>
                      <div className="flex items-center">
                        <FaEye className="mr-1" />
                        {material.view_count}
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