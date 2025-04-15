'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FaUsers, FaBalanceScale, FaBook, FaChartLine, 
  FaLightbulb, FaRocket, FaClock, FaChevronRight,
  FaUserCircle, FaTrophy, FaCalendarAlt, FaPlusCircle,
  FaSearch, FaEdit, FaBriefcase, FaGraduationCap
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
      <header className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-6" role="banner">
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
            <Link href="/quiz" className="inline-block px-8 py-4 bg-blue-600 text-white rounded-full text-lg font-bold shadow-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              診断スタート（5分）
            </Link>
            <a href="#types" className="inline-flex items-center justify-center px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              詳しく見る
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 quiz-info">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <FaClock className="text-blue-500 w-8 h-8 mb-4 mx-auto" />
              <div className="text-lg font-medium text-gray-400">質問数</div>
              <div className="text-3xl font-bold">15問</div>
              <div className="text-gray-500 mt-2">約5分で完了</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <FaChartLine className="text-green-500 w-8 h-8 mb-4 mx-auto" />
              <div className="text-lg font-medium text-gray-400">TOEIC平均スコア向上</div>
              <div className="text-3xl font-bold text-success">+120点</div>
              <div className="text-gray-500 mt-2">3ヶ月の学習効果</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <FaUsers className="text-purple-500 w-8 h-8 mb-4 mx-auto" />
              <div className="text-lg font-medium text-gray-400">累計診断者数</div>
              <div className="text-3xl font-bold">1,200+</div>
              <div className="text-gray-500 mt-2">診断後の満足度98%</div>
            </div>
          </div>
        </div>
      </section>

      {/* 学習タイプセクション */}
      <section id="types" className="bg-gray-100 py-20" role="region" aria-labelledby="types-heading">
        <div className="container mx-auto px-4">
          <h2 id="types-heading" className="text-3xl md:text-4xl font-bold text-center mb-12">あなたの英語学習タイプを発見しよう</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="type-card bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="type-icon mb-4">
                <FaUsers size={60} className="text-blue-500 mx-auto" aria-hidden="true" />
              </div>
              <h3 className="type-title text-xl font-semibold mb-2">ギバー型</h3>
              <p className="type-desc text-gray-600 mb-4">他者へ知識を伝えることで学ぶタイプ。教えることで理解が深まります。</p>
              <ul className="type-features text-sm text-gray-500 space-y-2">
                <li className="flex items-center"><FaUserCircle className="mr-2" aria-hidden="true" />グループ学習を好む</li>
                <li className="flex items-center"><FaEdit className="mr-2" aria-hidden="true" />説明することで記憶定着</li>
                <li className="flex items-center"><FaUsers className="mr-2" aria-hidden="true" />人とのつながりを大切にする</li>
              </ul>
              <div className="type-stats text-sm text-gray-500 mt-4">診断受験者の33%</div>
            </div>
            <div className="type-card bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="type-icon mb-4">
                <FaBalanceScale size={60} className="text-green-500 mx-auto" aria-hidden="true" />
              </div>
              <h3 className="type-title text-xl font-semibold mb-2">マッチャー型</h3>
              <p className="type-desc text-gray-600 mb-4">相互学習を通じて成長するタイプ。ディスカッションやペア学習が効果的です。</p>
              <ul className="type-features text-sm text-gray-500 space-y-2">
                <li className="flex items-center"><FaBriefcase className="mr-2" aria-hidden="true" />ビジネス英語に強い</li>
                <li className="flex items-center"><FaEdit className="mr-2" aria-hidden="true" />フィードバックを活かせる</li>
                <li className="flex items-center"><FaUsers className="mr-2" aria-hidden="true" />コミュニケーション重視</li>
              </ul>
              <div className="type-stats text-sm text-gray-500 mt-4">診断受験者の38%</div>
            </div>
            <div className="type-card bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="type-icon mb-4">
                <FaBook size={60} className="text-purple-500 mx-auto" aria-hidden="true" />
              </div>
              <h3 className="type-title text-xl font-semibold mb-2">テイカー型</h3>
              <p className="type-desc text-gray-600 mb-4">個人学習を好むタイプ。体系的な学習と自己ペースでの進行が効果的です。</p>
              <ul className="type-features text-sm text-gray-500 space-y-2">
                <li className="flex items-center"><FaGraduationCap className="mr-2" aria-hidden="true" />体系的な学習が得意</li>
                <li className="flex items-center"><FaEdit className="mr-2" aria-hidden="true" />自己ペースで学習</li>
                <li className="flex items-center"><FaChartLine className="mr-2" aria-hidden="true" />目標達成に強い</li>
              </ul>
              <div className="type-stats text-sm text-gray-500 mt-4">診断受験者の29%</div>
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
      <section id="roadmap" className="bg-white py-20" role="region" aria-labelledby="roadmap-heading">
        <div className="container mx-auto px-4">
          <h2 id="roadmap-heading" className="text-3xl md:text-4xl font-bold text-center mb-12">英語学習の成長ロードマップ</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="roadmap-step p-6 bg-blue-50 rounded-lg">
              <div className="step-number text-blue-600 text-xl font-bold mb-4">STEP 1</div>
              <h3 className="text-xl font-semibold mb-3">学習タイプ診断</h3>
              <p className="text-gray-600 mb-4">5分の診断で自分に合った学習法を発見。効率的な学習の第一歩です。</p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li className="flex items-center"><FaClock className="mr-2" aria-hidden="true" />所要時間：5分</li>
                <li className="flex items-center"><FaLightbulb className="mr-2" aria-hidden="true" />15の質問に回答</li>
              </ul>
            </div>

            <div className="roadmap-step p-6 bg-green-50 rounded-lg">
              <div className="step-number text-green-600 text-xl font-bold mb-4">STEP 2</div>
              <h3 className="text-xl font-semibold mb-3">カスタム学習プラン</h3>
              <p className="text-gray-600 mb-4">診断結果に基づいて、あなたに最適な学習方法とリソースを提案します。</p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li className="flex items-center"><FaRocket className="mr-2" aria-hidden="true" />目標設定サポート</li>
                <li className="flex items-center"><FaCalendarAlt className="mr-2" aria-hidden="true" />週間学習スケジュール</li>
              </ul>
            </div>

            <div className="roadmap-step p-6 bg-purple-50 rounded-lg">
              <div className="step-number text-purple-600 text-xl font-bold mb-4">STEP 3</div>
              <h3 className="text-xl font-semibold mb-3">実践的トレーニング</h3>
              <p className="text-gray-600 mb-4">ビジネスシーンを想定した実践的な学習コンテンツで着実に成長。</p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li className="flex items-center"><FaBriefcase className="mr-2" aria-hidden="true" />ビジネス英語対応</li>
                <li className="flex items-center"><FaTrophy className="mr-2" aria-hidden="true" />達成度トラッキング</li>
              </ul>
            </div>

            <div className="roadmap-step p-6 bg-yellow-50 rounded-lg">
              <div className="step-number text-yellow-600 text-xl font-bold mb-4">STEP 4</div>
              <h3 className="text-xl font-semibold mb-3">目標達成</h3>
              <p className="text-gray-600 mb-4">定期的な進捗確認と目標の見直しで、確実な成長を実現します。</p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li className="flex items-center"><FaChartLine className="mr-2" aria-hidden="true" />スコア向上保証</li>
                <li className="flex items-center"><FaPlusCircle className="mr-2" aria-hidden="true" />継続的なサポート</li>
              </ul>
            </div>
          </div>

          {/* CTAセクション */}
          <div className="text-center mt-16">
            <Link href="/quiz" className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-full text-lg font-bold shadow-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              今すぐ診断を始める <FaChevronRight className="ml-2" aria-hidden="true" />
            </Link>
            <p className="text-gray-600 mt-4">所要時間はたった5分。あなたに最適な学習法を見つけましょう。</p>
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