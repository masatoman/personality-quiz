'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { 
  FaUsers, FaBook, FaChartLine, 
  FaLightbulb, FaRocket, FaClock, FaChevronRight,
  FaEdit, FaBriefcase, FaThumbsUp, FaHeart, FaSmile, FaSearch
} from 'react-icons/fa';

// メインコンポーネント
const HomePage: React.FC = () => {
  // スクロール検知
  useEffect(() => {
    const handleScroll = () => {
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen">
      {/* ヘッダー */}
      <header className="bg-blue-600 text-white py-6" role="banner">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">英語学習タイプ診断</h1>
          <nav className="space-x-4" role="navigation" aria-label="メインナビゲーション">
            <a href="#types" className="hover:underline focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-500 rounded-sm px-2 py-1">学習タイプ</a>
            <a href="#benefits" className="hover:underline focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-500 rounded-sm px-2 py-1">メリット</a>
            <a href="#roadmap" className="hover:underline focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-500 rounded-sm px-2 py-1">成長プラン</a>
          </nav>
        </div>
      </header>

      {/* ヒーローセクション */}
      <section className="bg-white text-center py-20" role="region" aria-labelledby="hero-heading">
        <div className="container mx-auto px-4">
          <h2 id="hero-heading" className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">あなたの英語学習タイプを知ろう</h2>
          <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-3xl mx-auto">自分に合った学習法で効率的に英語を習得。心理学に基づいた診断であなたの強みを活かした学習法を発見しませんか？</p>
          
          {/* ビジネス向けタグ */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">TOEIC対策</span>
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">ビジネス英語</span>
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">プレゼンテーション</span>
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">オンライン会議</span>
          </div>

          <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4 mb-16">
            <Link href="/materials" className="inline-block px-8 py-4 bg-blue-600 text-white rounded-full text-lg font-bold shadow-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              教材を探す
            </Link>
            <Link href="/create" className="inline-flex items-center justify-center px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              教材を作る
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 material-info">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <FaBook className="text-blue-500 w-8 h-8 mb-4 mx-auto" />
              <div className="text-lg font-medium text-gray-400">教材数</div>
              <div className="text-3xl font-bold">50+</div>
              <div className="text-gray-500 mt-2">豊富な学習コンテンツ</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <FaChartLine className="text-green-500 w-8 h-8 mb-4 mx-auto" />
              <div className="text-lg font-medium text-gray-400">学習効果</div>
              <div className="text-3xl font-bold text-success">90%</div>
              <div className="text-gray-500 mt-2">記憶定着率向上</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <FaUsers className="text-purple-500 w-8 h-8 mb-4 mx-auto" />
              <div className="text-lg font-medium text-gray-400">コミュニティ</div>
              <div className="text-3xl font-bold">500+</div>
              <div className="text-gray-500 mt-2">教え合い学習者</div>
            </div>
          </div>
        </div>
      </section>

      {/* 学習方法セクション */}
      <section id="methods" className="bg-gray-100 py-20" role="region" aria-labelledby="methods-heading">
        <div className="container mx-auto px-4">
          <h2 id="methods-heading" className="text-3xl md:text-4xl font-bold text-center mb-12">教え合いで学ぶ英語学習</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="method-card bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="method-icon mb-4">
                <FaUsers size={60} className="text-blue-500 mx-auto" aria-hidden="true" />
              </div>
              <h3 className="method-title text-xl font-semibold mb-2">教材を作る</h3>
              <p className="method-desc text-gray-600 mb-4">自分の知識を整理して教材を作成。教えることで理解が深まります。</p>
              <ul className="method-features text-sm text-gray-500 space-y-2">
                <li className="flex items-center"><FaEdit className="mr-2" aria-hidden="true" />知識の整理・体系化</li>
                <li className="flex items-center"><FaLightbulb className="mr-2" aria-hidden="true" />理解度の向上</li>
                <li className="flex items-center"><FaUsers className="mr-2" aria-hidden="true" />他者への貢献</li>
              </ul>
              <div className="method-stats text-sm text-gray-500 mt-4">記憶定着率90%向上</div>
            </div>
            <div className="method-card bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="method-icon mb-4">
                <FaBook size={60} className="text-green-500 mx-auto" aria-hidden="true" />
              </div>
              <h3 className="method-title text-xl font-semibold mb-2">教材で学ぶ</h3>
              <p className="method-desc text-gray-600 mb-4">仲間が作った質の高い教材で効率的に学習。実践的な内容で成長。</p>
              <ul className="method-features text-sm text-gray-500 space-y-2">
                <li className="flex items-center"><FaBriefcase className="mr-2" aria-hidden="true" />実践的な内容</li>
                <li className="flex items-center"><FaThumbsUp className="mr-2" aria-hidden="true" />感謝の表現</li>
                <li className="flex items-center"><FaUsers className="mr-2" aria-hidden="true" />コミュニティ感</li>
              </ul>
              <div className="method-stats text-sm text-gray-500 mt-4">学習効率50%向上</div>
            </div>
            <div className="method-card bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="method-icon mb-4">
                <FaHeart size={60} className="text-purple-500 mx-auto" aria-hidden="true" />
              </div>
              <h3 className="method-title text-xl font-semibold mb-2">感謝を伝える</h3>
              <p className="method-desc text-gray-600 mb-4">良い教材には感謝を伝える。自然な感謝の循環が生まれます。</p>
              <ul className="method-features text-sm text-gray-500 space-y-2">
                <li className="flex items-center"><FaHeart className="mr-2" aria-hidden="true" />自然な感謝表現</li>
                <li className="flex items-center"><FaSmile className="mr-2" aria-hidden="true" />モチベーション向上</li>
                <li className="flex items-center"><FaChartLine className="mr-2" aria-hidden="true" />継続的な成長</li>
              </ul>
              <div className="method-stats text-sm text-gray-500 mt-4">継続率80%向上</div>
            </div>
          </div>
        </div>
      </section>

      {/* メリットセクション */}
      <section id="benefits" className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">診断で得られるメリット</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="benefit-card bg-gray-100 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="benefit-icon mb-4">
                <FaChartLine size={40} className="text-blue-500 mx-auto" />
              </div>
              <h3 className="benefit-title text-xl font-semibold mb-2">学習効率の向上</h3>
              <p className="benefit-desc text-gray-600">自分に合った学習法を知ることで、効率よく英語力を伸ばせます。</p>
            </div>
            <div className="benefit-card bg-gray-100 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="benefit-icon mb-4">
                <FaLightbulb size={40} className="text-blue-500 mx-auto" />
              </div>
              <h3 className="benefit-title text-xl font-semibold mb-2">モチベーション維持</h3>
              <p className="benefit-desc text-gray-600">自分に合った方法で学ぶことで、継続的な学習が可能になります。</p>
            </div>
            <div className="benefit-card bg-gray-100 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="benefit-icon mb-4">
                <FaRocket size={40} className="text-blue-500 mx-auto" />
              </div>
              <h3 className="benefit-title text-xl font-semibold mb-2">強みの活用</h3>
              <p className="benefit-desc text-gray-600">自分の強みを活かした学習アプローチで、最大限の成果を出せます。</p>
            </div>
            <div className="benefit-card bg-gray-100 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="benefit-icon mb-4">
                <FaClock size={40} className="text-blue-500 mx-auto" />
              </div>
              <h3 className="benefit-title text-xl font-semibold mb-2">学習時間の短縮</h3>
              <p className="benefit-desc text-gray-600">効率的な学習方法で、目標達成までの時間を短縮できます。</p>
            </div>
          </div>
        </div>
      </section>

      {/* 学習ステップ */}
      <section id="steps" className="bg-white py-20" role="region" aria-labelledby="steps-heading">
        <div className="container mx-auto px-4">
          <h2 id="steps-heading" className="text-3xl md:text-4xl font-bold text-center mb-12">教え合い学習の3ステップ</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="step-card p-6 bg-blue-50 rounded-lg">
              <div className="step-number text-blue-600 text-xl font-bold mb-4">STEP 1</div>
              <h3 className="text-xl font-semibold mb-3">教材を探す</h3>
              <p className="text-gray-600 mb-4">仲間が作った質の高い教材を探して学習。実践的な内容で効率的に成長。</p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li className="flex items-center"><FaSearch className="mr-2" aria-hidden="true" />豊富な教材から選択</li>
                <li className="flex items-center"><FaThumbsUp className="mr-2" aria-hidden="true" />評価・レビュー確認</li>
              </ul>
            </div>

            <div className="step-card p-6 bg-green-50 rounded-lg">
              <div className="step-number text-green-600 text-xl font-bold mb-4">STEP 2</div>
              <h3 className="text-xl font-semibold mb-3">教材を作る</h3>
              <p className="text-gray-600 mb-4">自分の知識を整理して教材を作成。教えることで理解が深まります。</p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li className="flex items-center"><FaEdit className="mr-2" aria-hidden="true" />知識の整理・体系化</li>
                <li className="flex items-center"><FaLightbulb className="mr-2" aria-hidden="true" />理解度の向上</li>
              </ul>
            </div>

            <div className="step-card p-6 bg-purple-50 rounded-lg">
              <div className="step-number text-purple-600 text-xl font-bold mb-4">STEP 3</div>
              <h3 className="text-xl font-semibold mb-3">感謝を伝える</h3>
              <p className="text-gray-600 mb-4">良い教材には感謝を伝える。自然な感謝の循環で継続的な成長。</p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li className="flex items-center"><FaHeart className="mr-2" aria-hidden="true" />自然な感謝表現</li>
                <li className="flex items-center"><FaSmile className="mr-2" aria-hidden="true" />モチベーション向上</li>
              </ul>
            </div>
          </div>

          {/* CTAセクション */}
          <div className="text-center mt-16">
            <Link href="/materials" className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-full text-lg font-bold shadow-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              教材を探す <FaChevronRight className="ml-2" aria-hidden="true" />
            </Link>
            <p className="text-gray-600 mt-4">豊富な教材から始めて、教え合い学習を体験しましょう。</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta bg-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">今すぐ教え合い学習を始めよう</h2>
          <p className="text-xl opacity-90 mb-8">質の高い教材で学び、自分の知識を共有して共に成長しましょう。</p>
          <Link href="/materials" className="inline-block px-8 py-4 bg-white text-primary font-bold rounded-full text-lg shadow-lg hover:bg-gray-100 transition-colors">
            教材を探す
          </Link>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-blue-600 text-white py-12">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">教え合いで学ぶ英語学習コミュニティ</h2>
          <p className="text-lg mb-8">一人学習の孤独感を解決し、教え合いで共に成長しましょう。</p>
          <Link href="/materials" className="inline-block px-8 py-4 bg-white text-blue-600 font-bold rounded-full text-lg shadow-lg hover:bg-gray-100 transition-colors">
            教材を探す
          </Link>
          <p className="mt-8 text-sm">&copy; 2025 ShiftWith All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 