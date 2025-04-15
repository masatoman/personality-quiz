import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function WelcomeHero() {
  return (
    <section className="bg-gradient-to-r from-primary to-primary-dark text-white py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              教えることで学ぶ、<br />
              新しい英語学習の形
            </h1>
            <p className="text-lg mb-8 opacity-90">
              ShiftWithは、ギバー行動（教材作成、フィードバック提供など）を通じて、
              より効果的に英語を学習できるプラットフォームです。
              あなたの知識共有が、自身の学習効果を高め、
              コミュニティ全体の価値向上にもつながります。
            </p>
            <div className="space-x-4">
              <Link
                href="/quiz"
                className="bg-white text-primary px-8 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
              >
                ギバー診断を受ける
              </Link>
              <Link
                href="/materials"
                className="border border-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-primary transition-colors"
              >
                教材を探す
              </Link>
            </div>
          </div>
          <div className="relative h-[400px]">
            <Image
              src="/images/hero-illustration.svg"
              alt="教えることで学ぶイメージ"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
} 