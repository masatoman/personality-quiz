import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function GiverScoreIntro() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative h-[400px]">
            <Image
              src="/images/giver-score-chart.svg"
              alt="ギバースコアのグラフ"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-6">
              ギバースコアで<br />
              あなたの成長を可視化
            </h2>
            <p className="text-lg mb-6 text-gray-600">
              ギバースコアは、教材作成やフィードバック提供などの「ギバー行動」を
              数値化したものです。スコアが高いほど、あなたの貢献が
              コミュニティに価値を提供し、同時に自身の学習効果も高まっていることを
              示しています。
            </p>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center mt-1 flex-shrink-0">
                  1
                </div>
                <div className="ml-4">
                  <h3 className="font-bold mb-1">ギバー診断を受ける</h3>
                  <p className="text-gray-600">
                    15の質問に答えて、あなたのギバータイプを診断します。
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center mt-1 flex-shrink-0">
                  2
                </div>
                <div className="ml-4">
                  <h3 className="font-bold mb-1">ギバー行動でスコアアップ</h3>
                  <p className="text-gray-600">
                    教材作成やフィードバック提供でスコアが上昇します。
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center mt-1 flex-shrink-0">
                  3
                </div>
                <div className="ml-4">
                  <h3 className="font-bold mb-1">特典をアンロック</h3>
                  <p className="text-gray-600">
                    スコアに応じて特別なコンテンツや機能が利用可能になります。
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <Link
                href="/quiz"
                className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors"
              >
                ギバー診断を受ける
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 