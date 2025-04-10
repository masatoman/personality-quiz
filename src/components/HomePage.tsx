'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FaUsers, FaBalanceScale, FaBook, FaChartLine, 
  FaLightbulb, FaRocket, FaClock, FaChevronRight,
  FaUserCircle, FaTrophy, FaCalendarAlt, FaPlusCircle,
  FaSearch, FaEdit
} from 'react-icons/fa';

// メインコンポーネント
const HomePage: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  
  // スクロール検知
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen">
      {/* ヘッダー */}
      <header className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-6">
        <div className="container mx-auto flex justify-between items-center px-4">
          <h1 className="text-3xl font-bold">英語学習タイプ診断</h1>
          <nav className="space-x-4">
            <a href="#types" className="hover:underline">学習タイプ</a>
            <a href="#benefits" className="hover:underline">メリット</a>
            <a href="#roadmap" className="hover:underline">成長プラン</a>
          </nav>
        </div>
      </header>

      {/* ヒーローセクション */}
      <section className="bg-white text-center py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-4">あなたの英語学習タイプを知ろう</h2>
          <p className="text-lg text-gray-700 mb-8">自分に合った学習法で効率的に英語を習得。心理学に基づいた診断であなたの強みを活かした学習法を発見しませんか？</p>
          <div className="flex justify-center space-x-4">
            <Link href="/quiz" className="inline-block px-8 py-4 bg-blue-600 text-white rounded-full text-lg font-bold shadow-lg hover:bg-blue-700 transition-colors">
              診断スタート（5分）
            </Link>
            <a href="#types" className="inline-flex items-center px-6 py-3 border border-blue-600 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-colors">
              詳しく見る
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 quiz-info">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-lg font-medium text-gray-400">質問数</div>
              <div className="text-3xl font-bold">15問</div>
              <div className="text-gray-500 mt-2">約5分で完了</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-lg font-medium text-gray-400">学習者の理解度向上</div>
              <div className="text-3xl font-bold text-success">+43%</div>
              <div className="text-gray-500 mt-2">自分に合った方法で学ぶ効果</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-lg font-medium text-gray-400">累計診断者数</div>
              <div className="text-3xl font-bold">1,200+</div>
              <div className="text-gray-500 mt-2">診断後の満足度98%</div>
            </div>
          </div>
        </div>
      </section>

      {/* 学習タイプセクション */}
      <section id="types" className="bg-gray-100 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">あなたの英語学習タイプを発見しよう</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="type-card bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="type-icon mb-4">
                <FaUsers size={60} className="text-blue-500 mx-auto" />
              </div>
              <h3 className="type-title text-xl font-semibold mb-2">ギバー型</h3>
              <p className="type-desc text-gray-600 mb-4">他者へ知識を伝えることで学ぶタイプ。教えることで理解が深まります。</p>
              <ul className="type-features text-sm text-gray-500">
                <li>グループ学習を好む</li>
                <li>説明することで記憶定着</li>
                <li>人とのつながりを大切にする</li>
              </ul>
              <div className="type-stats text-sm text-gray-500 mt-4">診断受験者の33%</div>
            </div>
            <div className="type-card bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="type-icon mb-4">
                <FaBalanceScale size={60} className="text-blue-500 mx-auto" />
              </div>
              <h3 className="type-title text-xl font-semibold mb-2">マッチャー型</h3>
              <p className="type-desc text-gray-600 mb-4">バランス重視で学ぶタイプ。多様な学習方法を組み合わせます。</p>
              <ul className="type-features text-sm text-gray-500">
                <li>柔軟な学習スタイル</li>
                <li>実践と理論のバランス</li>
                <li>環境に適応しやすい</li>
              </ul>
              <div className="type-stats text-sm text-gray-500 mt-4">診断受験者の34%</div>
            </div>
            <div className="type-card bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="type-icon mb-4">
                <FaBook size={60} className="text-blue-500 mx-auto" />
              </div>
              <h3 className="type-title text-xl font-semibold mb-2">テイカー型</h3>
              <p className="type-desc text-gray-600 mb-4">自己学習を好むタイプ。情報収集と分析が得意です。</p>
              <ul className="type-features text-sm text-gray-500">
                <li>個人学習を好む</li>
                <li>情報整理が得意</li>
                <li>自分のペースを大切にする</li>
              </ul>
              <div className="type-stats text-sm text-gray-500 mt-4">診断受験者の33%</div>
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

      {/* 成長ロードマップ */}
      <section id="roadmap" className="bg-gray-100 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">英語習得への成長ロードマップ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="step-number text-blue-500 text-2xl font-bold mb-4">1</div>
              <h3 className="growth-title text-xl font-semibold mb-2">学習タイプの診断</h3>
              <p className="growth-desc text-gray-600">5分程度の質問に答えるだけで、あなたの英語学習タイプを特定します。</p>
              <Link href="/quiz" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-full hover:opacity-90 transition-colors">
                診断を始める
                <FaChevronRight className="ml-2" />
              </Link>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="step-number text-blue-500 text-2xl font-bold mb-4">2</div>
              <h3 className="growth-title text-xl font-semibold mb-2">学習法のカスタマイズ</h3>
              <p className="growth-desc text-gray-600">診断結果に基づいて、あなたに最適な学習ツールと方法を提案します。</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="step-number text-blue-500 text-2xl font-bold mb-4">3</div>
              <h3 className="growth-title text-xl font-semibold mb-2">継続的な学習サポート</h3>
              <p className="growth-desc text-gray-600">あなたのタイプに合わせたリソースと定期的なフィードバックで、学習を継続的にサポートします。</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="step-number text-blue-500 text-2xl font-bold mb-4">4</div>
              <h3 className="growth-title text-xl font-semibold mb-2">目標達成と成長</h3>
              <p className="growth-desc text-gray-600">効率的な学習で英語力を着実に伸ばし、あなたの英語学習目標を達成します。</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta bg-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">今すぐ自分の英語学習タイプを見つけよう</h2>
          <p className="text-xl opacity-90 mb-8">たった5分の診断で、あなたに最適な英語学習法がわかります。</p>
          <Link href="/quiz" className="inline-block px-8 py-4 bg-white text-primary font-bold rounded-full text-lg shadow-lg hover:bg-gray-100 transition-colors">
            無料診断をスタート
          </Link>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-12">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">今すぐ自分の英語学習タイプを見つけよう</h2>
          <p className="text-lg mb-8">たった5分の診断で、あなたに最適な英語学習法がわかります。</p>
          <Link href="/quiz" className="inline-block px-8 py-4 bg-white text-blue-600 font-bold rounded-full text-lg shadow-lg hover:bg-gray-100 transition-colors">
            無料診断をスタート
          </Link>
          <p className="mt-8 text-sm">&copy; 2023 英語学習タイプ診断 All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 