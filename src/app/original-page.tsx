'use client';

import React, { useState, useEffect } from 'react';
import { PersonalityType } from '@/types/quiz';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaUsers, FaBalanceScale, FaBook } from 'react-icons/fa';

// basePath の設定をインポート
const basePath = process.env.NODE_ENV === 'production' ? '/quiz' : '';

interface IconProps {
  className?: string;
}

const TwitterIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const LineIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-12S17.52 2 12 2zm5.5 13.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm5.5 2c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z"/>
  </svg>
);

const InstagramIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.25a1.25 1.25 0 1 0-2.5 0 1.25 1.25 0 0 0 2.5 0zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/>
  </svg>
);

const FacebookIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const questions = [
  {
    text: '英語の勉強会で、あなたはどのように参加しますか？',
    options: [
      { text: '他の参加者の学習をサポートしながら自分も学ぶ', type: 'giver' as PersonalityType },
      { text: '自分の学習に集中して、効率よく進める', type: 'taker' as PersonalityType },
      { text: 'お互いに教え合いながら進める', type: 'matcher' as PersonalityType },
    ],
  },
  {
    text: 'オンライン英会話で、どのようなアプローチを取りますか？',
    options: [
      { text: '講師の話を注意深く聞き、効率的に学習する', type: 'taker' as PersonalityType },
      { text: '講師と友好的な関係を築きながら学ぶ', type: 'matcher' as PersonalityType },
      { text: '講師の指導方法に合わせて柔軟に対応する', type: 'giver' as PersonalityType },
    ],
  },
  {
    text: 'グループプロジェクトでの役割として、どれが最も自然ですか？',
    options: [
      { text: 'チームのまとめ役として、全員の意見を調整する', type: 'giver' as PersonalityType },
      { text: 'プロジェクトのリーダーとして、目標達成に向けて指揮を取る', type: 'matcher' as PersonalityType },
      { text: 'チームメンバーと協力しながら、相互に学び合う', type: 'taker' as PersonalityType },
    ],
  },
  {
    text: '英語の教材を選ぶ際、何を重視しますか？',
    options: [
      { text: '効率的に学習できる、体系的な教材', type: 'matcher' as PersonalityType },
      { text: '他の学習者と共有できる、インタラクティブな教材', type: 'taker' as PersonalityType },
      { text: '様々なレベルの学習者に対応できる、柔軟な教材', type: 'giver' as PersonalityType },
    ],
  },
  {
    text: '英語学習の目標設定について、どのように考えますか？',
    options: [
      { text: '明確な目標を立て、計画的に達成を目指す', type: 'matcher' as PersonalityType },
      { text: '周囲の成長に合わせて、柔軟に目標を調整する', type: 'taker' as PersonalityType },
      { text: '他者の目標達成もサポートしながら、共に成長する', type: 'giver' as PersonalityType },
    ],
  },
  {
    text: '英語でのコミュニケーションで最も重視することは？',
    options: [
      { text: '正確さと流暢さのバランスを取りながら効果的に伝える', type: 'matcher' as PersonalityType },
      { text: '相手の理解度に合わせて、分かりやすく伝える', type: 'giver' as PersonalityType },
      { text: '相互理解を深めながら、自然な会話を楽しむ', type: 'taker' as PersonalityType },
    ],
  },
  {
    text: '英語学習でつまずいた時、どのように対処しますか？',
    options: [
      { text: '他の学習者と情報を共有し、一緒に解決策を見つける', type: 'taker' as PersonalityType },
      { text: '自分で問題を分析し、効率的な解決方法を見つける', type: 'matcher' as PersonalityType },
      { text: '経験を共有して、同じ悩みを持つ人をサポートする', type: 'giver' as PersonalityType },
    ],
  },
  {
    text: '英語学習のモチベーションを保つために、何を重視しますか？',
    options: [
      { text: '目標達成に向けての進捗を確認する', type: 'matcher' as PersonalityType },
      { text: '他の学習者との交流や励まし合い', type: 'taker' as PersonalityType },
      { text: '他者の成長をサポートすることでの達成感', type: 'giver' as PersonalityType },
    ],
  },
  {
    text: '英語学習コミュニティでの理想的な役割は？',
    options: [
      { text: 'メンバーのサポートと学習環境の改善', type: 'giver' as PersonalityType },
      { text: '積極的な参加と建設的な意見の提供', type: 'matcher' as PersonalityType },
      { text: 'メンバー間の交流促進と相互学習', type: 'taker' as PersonalityType },
    ],
  },
  {
    text: '新しい英語学習法を試す際の姿勢は？',
    options: [
      { text: '効果を検証しながら、自分に最適な方法を見つける', type: 'matcher' as PersonalityType },
      { text: '他の学習者と共有し、フィードバックを交換する', type: 'taker' as PersonalityType },
      { text: '様々な学習者のニーズに対応できる方法を探る', type: 'giver' as PersonalityType },
    ],
  },
];

type StatType = {
  count: number;
  percentage: number;
};

type PersonalityDescription = {
  title: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  learningAdvice: {
    title: string;
    tips: string[];
    tools: string[];
  }
};

const saveResult = async (type: PersonalityType): Promise<boolean> => {
  try {
    const response = await fetch('/api/save-result/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: '結果の保存に失敗しました' }));
      throw new Error(errorData.error || '結果の保存に失敗しました');
    }
    
    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('結果の保存中にエラーが発生しました:', error);
    return false;
  }
};

const getPersonalityDescription = (type: PersonalityType | null): PersonalityDescription => {
  const descriptions: {[key in PersonalityType]: PersonalityDescription} = {
    giver: {
      title: '体系的学習者',
      description: '計画的で着実な学習を好む傾向があります。文法や語彙を体系的に学ぶことで、確実な進歩を実感できる時にやる気が出ます。',
      strengths: [
        '計画通りに学習を進められる',
        '基礎からしっかり積み上げていける',
        '学習の進捗を可視化できる'
      ],
      weaknesses: [
        '柔軟性に欠けることがある',
        '予定外の変更に弱い',
        '完璧主義になりすぎる傾向'
      ],
      learningAdvice: {
        title: 'おすすめの学習方法',
        tips: [
          '文法書を最初から順番に学ぶ',
          '単語帳で計画的に語彙を増やす',
          '定期的に復習時間を設ける'
        ],
        tools: [
          '文法学習アプリ',
          '単語帳アプリ',
          '学習管理ツール'
        ]
      }
    },
    taker: {
      title: '実践的学習者',
      description: '実際のコミュニケーションを通じて学ぶことを好みます。理論よりも実践を重視し、使える英語を身につけることに関心があります。',
      strengths: [
        '実践的なスキルが身につく',
        '生きた英語が学べる',
        '楽しみながら学習できる'
      ],
      weaknesses: [
        '基礎固めが不十分になりがち',
        '体系的な学習が苦手',
        '学習の継続性が課題'
      ],
      learningAdvice: {
        title: 'おすすめの学習方法',
        tips: [
          '英語の動画や映画を字幕なしで見る',
          'ネイティブとの会話練習',
          '興味のある題材で読み書きする'
        ],
        tools: [
          '英会話アプリ',
          '動画ストリーミングサービス',
          'ポッドキャストアプリ'
        ]
      }
    },
    matcher: {
      title: 'バランス型学習者',
      description: '理論と実践のバランスを重視します。状況に応じて学習方法を柔軟に変えられ、多角的なアプローチで英語力を伸ばすことができます。',
      strengths: [
        '柔軟な学習スタイル',
        '多様な教材を活用できる',
        '理論と実践のバランスが良い'
      ],
      weaknesses: [
        '特定分野の深い習得に時間がかかる',
        '優先順位付けが難しい',
        '学習の焦点が定まりにくい'
      ],
      learningAdvice: {
        title: 'おすすめの学習方法',
        tips: [
          '教科書学習と実践的な会話をミックス',
          '多様な教材を組み合わせる',
          '定期的に学習方法を見直す'
        ],
        tools: [
          '総合的な英語学習アプリ',
          'オンライン英会話サービス',
          '学習進捗管理ツール'
        ]
      }
    }
  };

  if (!type) {
    return {
      title: '',
      description: '',
      strengths: [],
      weaknesses: [],
      learningAdvice: {
        title: '',
        tips: [],
        tools: []
      }
    };
  }

  return descriptions[type];
};

// APIからの統計データを取得する関数
async function fetchStats() {
  try {
    const response = await fetch(`${basePath}/api/get-stats/`);
    if (!response.ok) {
      throw new Error('統計データの取得に失敗しました');
    }
    return await response.json();
  } catch (error) {
    console.error('統計データの取得エラー:', error);
    return {
      giver: { count: 0, percentage: 33 },
      taker: { count: 0, percentage: 33 },
      matcher: { count: 0, percentage: 34 },
      total: 0
    };
  }
}

export default function HomePage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [stats, setStats] = useState({
    giver: { count: 0, percentage: 33 },
    taker: { count: 0, percentage: 33 },
    matcher: { count: 0, percentage: 34 },
    total: 0
  });

  useEffect(() => {
    // スクロールイベントの処理
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    // 統計データの取得
    const getStats = async () => {
      try {
        const data = await fetchStats();
        setStats(data);
      } catch (error) {
        console.error('統計データの取得に失敗しました:', error);
      }
    };

    // イベントリスナーの登録と統計データの取得
    window.addEventListener('scroll', handleScroll);
    getStats();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <main className="min-h-screen">
      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 px-6 py-4 ${
        scrolled ? 'bg-white shadow-md' : 'bg-transparent'
      }`}>
        <div className="container mx-auto flex justify-between items-center">
          <h1 className={`text-xl font-bold ${scrolled ? 'text-gray-900' : 'text-gray-900'}`}>
            英語学習タイプ診断
          </h1>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#types" className="text-gray-700 hover:text-blue-600 transition-colors">
              学習タイプ
            </a>
            <a href="#benefits" className="text-gray-700 hover:text-blue-600 transition-colors">
              メリット
            </a>
            <a href="#growth" className="text-gray-700 hover:text-blue-600 transition-colors">
              成長プラン
            </a>
          </nav>
        </div>
      </header>

      <section className="hero min-h-screen pt-32 pb-20 px-6 bg-gradient-to-b from-blue-50 to-indigo-100">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              あなたの<span className="text-blue-600">英語学習タイプ</span>を知ろう
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-8">
              自分に合った学習法で効率的に英語を習得。心理学に基づいた診断であなたの強みを活かした学習法を発見しませんか？
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/quiz" className="start-btn">
                診断スタート（5分）
              </Link>
              <a href="#types" className="btn-secondary">
                詳しく見る
              </a>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="stat-card">
                <span className="text-sm font-medium text-blue-600">質問数</span>
                <p className="text-2xl font-bold text-gray-900">15問</p>
                <p className="text-sm text-gray-600">約5分で完了</p>
              </div>
              <div className="stat-card">
                <span className="text-sm font-medium text-purple-600">学習者の理解度向上</span>
                <p className="text-2xl font-bold text-gray-900">+43%</p>
                <p className="text-sm text-gray-600">自分に合った方法で学ぶ効果</p>
              </div>
              <div className="stat-card">
                <span className="text-sm font-medium text-green-600">累計診断者数</span>
                <p className="text-2xl font-bold text-gray-900">1,200+</p>
                <p className="text-sm text-gray-600">診断後の満足度98%</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="types" className="types-section">
        <div className="container mx-auto px-4 py-16">
          <h2 className="section-title text-center mb-12">あなたの英語学習タイプを発見しよう</h2>
          <p className="text-center mb-8">
            私たちは全て異なる学習スタイルを持っています。あなたに最適な学習方法を見つけましょう。
          </p>
          <div className="types-container">
            <div className="type-card">
              <div className="type-icon">
                <FaUsers size={40} color="#4F46E5" />
              </div>
              <h3 className="type-title">ギバー型</h3>
              <p>他者へ知識を伝えることで学ぶタイプ。教えることで理解が深まります。</p>
              <ul className="type-features">
                <li>グループ学習を好む</li>
                <li>説明することで記憶定着</li>
                <li>人とのつながりを大切にする</li>
              </ul>
              <div className="text-sm text-gray-500 mt-4">
                診断受験者の{stats.giver.percentage}%
              </div>
            </div>
            
            <div className="type-card">
              <div className="type-icon">
                <FaBalanceScale size={40} color="#4F46E5" />
              </div>
              <h3 className="type-title">マッチャー型</h3>
              <p>バランス重視で学ぶタイプ。多様な学習方法を組み合わせます。</p>
              <ul className="type-features">
                <li>柔軟な学習スタイル</li>
                <li>実践と理論のバランス</li>
                <li>環境に適応しやすい</li>
              </ul>
              <div className="text-sm text-gray-500 mt-4">
                診断受験者の{stats.matcher.percentage}%
              </div>
            </div>
            
            <div className="type-card">
              <div className="type-icon">
                <FaBook size={40} color="#4F46E5" />
              </div>
              <h3 className="type-title">テイカー型</h3>
              <p>自己学習を好むタイプ。情報収集と分析が得意です。</p>
              <ul className="type-features">
                <li>個人学習を好む</li>
                <li>情報整理が得意</li>
                <li>自分のペースを大切にする</li>
              </ul>
              <div className="text-sm text-gray-500 mt-4">
                診断受験者の{stats.taker.percentage}%
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="benefits" className="py-20 px-6 bg-gray-100">
        <div className="container mx-auto">
          <h2 className="section-title text-center mb-12">診断で得られるメリット</h2>
          <p className="text-center mb-16 max-w-2xl mx-auto">
            自分の学習スタイルを理解することで、学習効率が劇的に向上します
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">学習効率の向上</h3>
              <p className="text-gray-600">自分に合った学習法を知ることで、効率よく英語力を伸ばせます。</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">モチベーション維持</h3>
              <p className="text-gray-600">自分に合った方法で学ぶことで、継続的な学習が可能になります。</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">強みの活用</h3>
              <p className="text-gray-600">自分の強みを活かした学習アプローチで、最大限の成果を出せます。</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">学習時間の短縮</h3>
              <p className="text-gray-600">効率的な学習方法で、目標達成までの時間を短縮できます。</p>
            </div>
          </div>
        </div>
      </section>
      
      <section id="growth" className="py-20 px-6">
        <div className="container mx-auto">
          <h2 className="section-title text-center mb-12">英語習得への成長ロードマップ</h2>
          <p className="text-center mb-16 max-w-2xl mx-auto">
            タイプ診断から始まる、あなたの英語学習の道のり
          </p>
          
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-start mb-12">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl flex-shrink-0 md:mt-0 mb-4 md:mb-0 md:mr-6">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">学習タイプの診断</h3>
                <p className="text-gray-600 mb-3">5分程度の質問に答えるだけで、あなたの英語学習タイプを特定します。</p>
                <Link href="/quiz" className="text-blue-600 hover:underline font-medium inline-flex items-center">
                  診断を始める
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-start mb-12">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xl flex-shrink-0 md:mt-0 mb-4 md:mb-0 md:mr-6">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">学習法のカスタマイズ</h3>
                <p className="text-gray-600 mb-3">診断結果に基づいて、あなたに最適な学習ツールと方法を提案します。</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-start mb-12">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-xl flex-shrink-0 md:mt-0 mb-4 md:mb-0 md:mr-6">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">継続的な学習サポート</h3>
                <p className="text-gray-600 mb-3">あなたのタイプに合わせたリソースと定期的なフィードバックで、学習を継続的にサポートします。</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-start">
              <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 font-bold text-xl flex-shrink-0 md:mt-0 mb-4 md:mb-0 md:mr-6">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">目標達成と成長</h3>
                <p className="text-gray-600 mb-3">効率的な学習で英語力を着実に伸ばし、あなたの英語学習目標を達成します。</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-20 px-6 bg-blue-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">今すぐ自分の英語学習タイプを見つけよう</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            たった5分の診断で、あなたに最適な英語学習法がわかります。
          </p>
          <Link href="/quiz" className="inline-block bg-white text-blue-600 font-bold px-8 py-4 rounded-full shadow-lg hover:bg-blue-50 transition-colors">
            無料診断をスタート
          </Link>
        </div>
      </section>
      
      <footer className="py-10 px-6 bg-gray-800 text-white">
        <div className="container mx-auto text-center">
          <p className="opacity-70 text-sm">© 2023 英語学習タイプ診断 All Rights Reserved.</p>
        </div>
      </footer>
    </main>
  );
}

