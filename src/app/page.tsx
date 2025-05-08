'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { FaArrowRight, FaCheck, FaUsers, FaLightbulb, FaGraduationCap } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const startQuiz = () => {
    router.push('/quiz');
  };

  return (
    <div className="bg-color-background text-color-text-primary">
      {/* ヒーローセクション */}
      <motion.section 
        className="relative overflow-hidden py-16 md:py-24 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <span className="text-primary px-3 py-1 rounded-full bg-primary/10 inline-block mb-4 font-medium">
                無料診断テスト
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                あなたに最適な<br />
                <span className="text-gradient">英語学習方法</span>を発見
              </h1>
              <p className="text-color-text-secondary text-lg mb-8">
                たった5分の診断で、あなたの学習タイプを分析。<br />
                あなたの強みを活かした効率的な英語学習法がわかります。
              </p>
              
              <motion.button
                onClick={startQuiz}
                className="btn-primary rounded-lg text-lg font-semibold px-8 py-4 flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                診断を始める
                <motion.span
                  className="ml-2"
                  animate={{ x: isHovered ? 5 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FaArrowRight />
                </motion.span>
              </motion.button>
              
              <div className="mt-6 flex items-center text-color-text-secondary text-sm">
                <div className="flex -space-x-2 mr-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-xs">AB</div>
                  <div className="w-8 h-8 rounded-full bg-green-500 border-2 border-white flex items-center justify-center text-white text-xs">CD</div>
                  <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-white flex items-center justify-center text-white text-xs">EF</div>
                </div>
                <span>今週1,234人が診断を完了</span>
              </div>
            </motion.div>
            
            <motion.div
              className="relative"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-xl">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 absolute inset-0 opacity-80"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center">
                  <h3 className="text-2xl font-bold mb-4">あなたの英語学習タイプは？</h3>
                  <p className="mb-6">10の質問に答えるだけで、あなたに最適な学習方法が見つかります</p>
                  <div className="grid grid-cols-3 gap-4 w-full max-w-md">
                    <div className="bg-white/20 p-3 rounded-lg">
                      <p className="text-sm font-medium">体系的学習者</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-lg">
                      <p className="text-sm font-medium">実践的学習者</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-lg">
                      <p className="text-sm font-medium">バランス型</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent"></div>
      </motion.section>
      
      {/* 特徴セクション */}
      <section className="py-16 md:py-24 px-4 bg-base-100 dark:bg-neutral-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">効率的な学習のために知っておくべきこと</h2>
            <p className="text-color-text-secondary max-w-2xl mx-auto">
              あなたの学習タイプを理解することで、時間を無駄にせず、効率的に英語力を伸ばすことができます。
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              className="bg-card dark:bg-neutral-800 p-6 rounded-xl shadow-sm"
              whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                <FaUsers className="text-xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3">学習タイプの違い</h3>
              <p className="text-color-text-secondary">
                人それぞれ最適な学習法は異なります。自分に合った方法で学ぶことで、効率が大幅に向上します。
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start">
                  <FaCheck className="text-primary mt-1 mr-2 flex-shrink-0" />
                  <span className="text-sm">自分の学習タイプを知ることで学習効率が2倍に</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-primary mt-1 mr-2 flex-shrink-0" />
                  <span className="text-sm">あなたの強みを活かした学習法を発見</span>
                </li>
              </ul>
            </motion.div>
            
            <motion.div 
              className="bg-card dark:bg-neutral-800 p-6 rounded-xl shadow-sm"
              whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                <FaLightbulb className="text-xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3">カスタマイズされた学習法</h3>
              <p className="text-color-text-secondary">
                診断結果に基づいて、あなたに最適な教材、ツール、学習スケジュールをご提案します。
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start">
                  <FaCheck className="text-primary mt-1 mr-2 flex-shrink-0" />
                  <span className="text-sm">あなたの学習スタイルに合わせたツールの紹介</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-primary mt-1 mr-2 flex-shrink-0" />
                  <span className="text-sm">効率的な学習スケジュールの提案</span>
                </li>
              </ul>
            </motion.div>
            
            <motion.div 
              className="bg-card dark:bg-neutral-800 p-6 rounded-xl shadow-sm"
              whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                <FaGraduationCap className="text-xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3">継続的な成長サポート</h3>
              <p className="text-color-text-secondary">
                学習を続けやすくするためのコツや、モチベーションを維持する方法もアドバイスします。
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start">
                  <FaCheck className="text-primary mt-1 mr-2 flex-shrink-0" />
                  <span className="text-sm">効果的な学習習慣の作り方</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-primary mt-1 mr-2 flex-shrink-0" />
                  <span className="text-sm">モチベーションを維持するための具体的な方法</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* 学習タイプ紹介セクション */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">3つの英語学習タイプ</h2>
            <p className="text-color-text-secondary max-w-2xl mx-auto">
              あなたはどのタイプ？診断テストであなたの強みを活かした学習方法を見つけましょう。
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center mb-6 mx-auto">
                <span className="text-2xl font-bold">体</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">体系的学習者</h3>
              <p className="text-color-text-secondary text-center mb-4">
                計画的で着実な学習を好む
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <FaCheck className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
                  <span>文法や語彙を体系的に学ぶ</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
                  <span>計画通りに進めることでやる気が出る</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
                  <span>基礎からしっかり積み上げる</span>
                </li>
              </ul>
            </motion.div>
            
            <motion.div 
              className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-6 rounded-xl border border-green-100 dark:border-green-800"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mb-6 mx-auto">
                <span className="text-2xl font-bold">実</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">実践的学習者</h3>
              <p className="text-color-text-secondary text-center mb-4">
                実践を通じて学ぶことを好む
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>実際のコミュニケーションを通じて学ぶ</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>生きた英語を使いながら上達</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>実践的なスキルが身につく</span>
                </li>
              </ul>
            </motion.div>
            
            <motion.div 
              className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-xl border border-purple-100 dark:border-purple-800"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-16 h-16 bg-purple-500 text-white rounded-full flex items-center justify-center mb-6 mx-auto">
                <span className="text-2xl font-bold">バ</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">バランス型学習者</h3>
              <p className="text-color-text-secondary text-center mb-4">
                理論と実践のバランスを取る
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <FaCheck className="text-purple-500 mt-1 mr-2 flex-shrink-0" />
                  <span>基礎と応用をバランスよく学習</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-purple-500 mt-1 mr-2 flex-shrink-0" />
                  <span>理論と実践を結びつける</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-purple-500 mt-1 mr-2 flex-shrink-0" />
                  <span>柔軟な学習アプローチが得意</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* CTAセクション */}
      <section className="py-16 md:py-24 px-4 bg-gradient-to-r from-primary to-accent text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            今すぐあなたの英語学習タイプを診断
          </motion.h2>
          <motion.p 
            className="text-lg mb-8 opacity-90 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            たった5分でわかる診断テスト。あなたに最適な英語学習法を見つけて、効率的に上達しましょう！
          </motion.p>
          <motion.button
            onClick={startQuiz}
            className="bg-white text-primary hover:bg-white/90 px-8 py-4 rounded-lg font-semibold text-lg shadow-lg flex items-center mx-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            無料で診断テストを受ける
            <FaArrowRight className="ml-2" />
          </motion.button>
        </div>
      </section>
      
      {/* フッター */}
      <footer className="py-8 bg-neutral text-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Link href="/" className="text-xl font-bold">英語学習タイプ診断</Link>
            </div>
            <div className="text-sm opacity-70">
              © 2023 英語学習タイプ診断. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 