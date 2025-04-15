import React from 'react';
import { FaBookOpen, FaUsers, FaStar, FaChartLine } from 'react-icons/fa';

const features = [
  {
    icon: FaBookOpen,
    title: '教材作成',
    description: '自分の知識を教材として共有することで、より深い理解が得られます。作成した教材は他のユーザーの学習に役立ちます。'
  },
  {
    icon: FaUsers,
    title: 'フィードバック',
    description: '他のユーザーの教材にフィードバックを提供することで、自身の知識も整理され、より確かなものになります。'
  },
  {
    icon: FaStar,
    title: 'ポイント獲得',
    description: 'ギバー行動（教材作成、フィードバック提供など）に応じてポイントを獲得。獲得したポイントは特典と交換できます。'
  },
  {
    icon: FaChartLine,
    title: 'ギバースコア',
    description: 'あなたの貢献度を可視化するギバースコア。スコアに応じて特別な機能やコンテンツがアンロックされます。'
  }
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          ShiftWithの特徴
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-primary text-3xl mb-4">
                <feature.icon />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 