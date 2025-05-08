'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaArrowRight, FaCheck, FaUsers, FaLightbulb, FaGraduationCap } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const startQuiz = () => {
    router.push('/quiz?start=true');
  };

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* ヒーローセクション */}
      <motion.section 
        className="relative overflow-hidden py-16 md:py-24 px-4 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 dark:from-blue-800 dark:via-blue-900 dark:to-indigo-950 text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* デコレーション要素 */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/30 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-300/40 rounded-full translate-y-1/3 -translate-x-1/3 blur-2xl"></div>
        </div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <span className="bg-white/25 text-white px-4 py-1.5 rounded-full inline-block mb-6 font-medium shadow-sm backdrop-blur-sm">
                無料診断テスト
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-white">
                あなたに最適な<br />
                <span className="text-yellow-300 dark:text-yellow-200 drop-shadow-sm">英語学習方法</span>を発見
              </h1>
              <p className="text-white/90 dark:text-white/95 text-lg mb-8 leading-relaxed">
                たった5分の診断で、あなたの学習タイプを分析。<br />
                あなたの強みを活かした効率的な英語学習法がわかります。
              </p>
              
              <motion.button
                onClick={startQuiz}
                className="bg-white text-blue-700 dark:text-blue-800 hover:bg-white/90 px-8 py-4 rounded-lg font-semibold text-lg shadow-lg flex items-center transition-all duration-300"
                whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)" }}
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
              
              <div className="mt-8 flex items-center text-white text-sm">
                <div className="flex -space-x-2 mr-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white dark:border-blue-800 flex items-center justify-center text-white text-xs shadow-md">AB</div>
                  <div className="w-8 h-8 rounded-full bg-green-500 border-2 border-white dark:border-blue-800 flex items-center justify-center text-white text-xs shadow-md">CD</div>
                  <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-white dark:border-blue-800 flex items-center justify-center text-white text-xs shadow-md">EF</div>
                </div>
                <span className="text-white/90 dark:text-white/95 font-medium">今週1,234人が診断を完了</span>
              </div>
            </motion.div>
            
            <motion.div
              className="relative"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-2xl">
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 dark:from-indigo-700 dark:to-indigo-900 absolute inset-0"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center">
                  <h3 className="text-2xl font-bold mb-4 text-white">あなたの英語学習タイプは？</h3>
                  <p className="mb-6 text-white/90 dark:text-white/95">10の質問に答えるだけで、あなたに最適な学習方法が見つかります</p>
                  <div className="grid grid-cols-3 gap-4 w-full max-w-md">
                    <div className="bg-white/70 dark:bg-white/80 p-3 rounded-lg shadow-md">
                      <p className="text-sm font-medium text-indigo-900">体系的学習者</p>
                    </div>
                    <div className="bg-white/70 dark:bg-white/80 p-3 rounded-lg shadow-md">
                      <p className="text-sm font-medium text-indigo-900">実践的学習者</p>
                    </div>
                    <div className="bg-white/70 dark:bg-white/80 p-3 rounded-lg shadow-md">
                      <p className="text-sm font-medium text-indigo-900">バランス型</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>
      
      {/* 特徴セクション */}
      <section className="py-16 md:py-24 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">効率的な学習のために知っておくべきこと</h2>
            <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              あなたの学習タイプを理解することで、時間を無駄にせず、効率的に英語力を伸ばすことができます。
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              className="bg-white dark:bg-gray-750 p-7 rounded-xl shadow-md border border-gray-100 dark:border-gray-700"
              whileHover={{ y: -5, boxShadow: '0 15px 30px rgba(0,0,0,0.1)' }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded-lg flex items-center justify-center mb-5">
                <FaUsers className="text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">学習タイプの違い</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                人それぞれ最適な学習法は異なります。自分に合った方法で学ぶことで、効率が大幅に向上します。
              </p>
              <ul className="mt-4 space-y-3">
                <li className="flex items-start">
                  <FaCheck className="text-blue-600 dark:text-blue-400 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-800 dark:text-gray-200">自分の学習タイプを知ることで学習効率が2倍に</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-blue-600 dark:text-blue-400 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-800 dark:text-gray-200">あなたの強みを活かした学習法を発見</span>
                </li>
              </ul>
            </motion.div>
            
            <motion.div 
              className="bg-white dark:bg-gray-750 p-7 rounded-xl shadow-md border border-gray-100 dark:border-gray-700"
              whileHover={{ y: -5, boxShadow: '0 15px 30px rgba(0,0,0,0.1)' }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-14 h-14 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-300 rounded-lg flex items-center justify-center mb-5">
                <FaLightbulb className="text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">カスタマイズされた学習法</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                診断結果に基づいて、あなたに最適な教材、ツール、学習スケジュールをご提案します。
              </p>
              <ul className="mt-4 space-y-3">
                <li className="flex items-start">
                  <FaCheck className="text-yellow-600 dark:text-yellow-400 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-800 dark:text-gray-200">あなたの学習スタイルに合わせたツールの紹介</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-yellow-600 dark:text-yellow-400 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-800 dark:text-gray-200">効率的な学習スケジュールの提案</span>
                </li>
              </ul>
            </motion.div>
            
            <motion.div 
              className="bg-white dark:bg-gray-750 p-7 rounded-xl shadow-md border border-gray-100 dark:border-gray-700"
              whileHover={{ y: -5, boxShadow: '0 15px 30px rgba(0,0,0,0.1)' }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-14 h-14 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-300 rounded-lg flex items-center justify-center mb-5">
                <FaGraduationCap className="text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">継続的な成長サポート</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                学習を続けやすくするためのコツや、モチベーションを維持する方法もアドバイスします。
              </p>
              <ul className="mt-4 space-y-3">
                <li className="flex items-start">
                  <FaCheck className="text-green-600 dark:text-green-400 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-800 dark:text-gray-200">効果的な学習習慣の作り方</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-600 dark:text-green-400 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-800 dark:text-gray-200">モチベーションを維持するための具体的な方法</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* 学習タイプ紹介セクション */}
      <section className="py-16 md:py-24 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">3つの英語学習タイプ</h2>
            <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              あなたはどのタイプ？診断テストであなたの強みを活かした学習方法を見つけましょう。
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              className="bg-white dark:bg-gray-800 p-7 rounded-xl border-2 border-blue-200 dark:border-blue-800/40 shadow-md"
              whileHover={{ scale: 1.03, boxShadow: "0 15px 30px rgba(0, 0, 0, 0.1)" }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-800 text-white rounded-full flex items-center justify-center mb-6 mx-auto shadow-md">
                <span className="text-2xl font-bold">体</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center text-gray-900 dark:text-white">体系的学習者</h3>
              <p className="text-gray-700 dark:text-gray-300 text-center mb-4 leading-relaxed">
                計画的で着実な学習を好む
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <FaCheck className="text-blue-600 dark:text-blue-400 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-800 dark:text-gray-200">文法や語彙を体系的に学ぶ</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-blue-600 dark:text-blue-400 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-800 dark:text-gray-200">計画通りに進めることでやる気が出る</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-blue-600 dark:text-blue-400 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-800 dark:text-gray-200">基礎からしっかり積み上げる</span>
                </li>
              </ul>
            </motion.div>
            
            <motion.div 
              className="bg-white dark:bg-gray-800 p-7 rounded-xl border-2 border-green-200 dark:border-green-800/40 shadow-md"
              whileHover={{ scale: 1.03, boxShadow: "0 15px 30px rgba(0, 0, 0, 0.1)" }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-800 text-white rounded-full flex items-center justify-center mb-6 mx-auto shadow-md">
                <span className="text-2xl font-bold">実</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center text-gray-900 dark:text-white">実践的学習者</h3>
              <p className="text-gray-700 dark:text-gray-300 text-center mb-4 leading-relaxed">
                実践を通じて学ぶことを好む
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <FaCheck className="text-green-600 dark:text-green-400 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-800 dark:text-gray-200">実際のコミュニケーションを通じて学ぶ</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-600 dark:text-green-400 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-800 dark:text-gray-200">生きた英語を使いながら上達</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-600 dark:text-green-400 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-800 dark:text-gray-200">実践的なスキルが身につく</span>
                </li>
              </ul>
            </motion.div>
            
            <motion.div 
              className="bg-white dark:bg-gray-800 p-7 rounded-xl border-2 border-purple-200 dark:border-purple-800/40 shadow-md"
              whileHover={{ scale: 1.03, boxShadow: "0 15px 30px rgba(0, 0, 0, 0.1)" }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-800 text-white rounded-full flex items-center justify-center mb-6 mx-auto shadow-md">
                <span className="text-2xl font-bold">バ</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center text-gray-900 dark:text-white">バランス型学習者</h3>
              <p className="text-gray-700 dark:text-gray-300 text-center mb-4 leading-relaxed">
                理論と実践のバランスを取る
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <FaCheck className="text-purple-600 dark:text-purple-400 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-800 dark:text-gray-200">基礎と応用をバランスよく学習</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-purple-600 dark:text-purple-400 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-800 dark:text-gray-200">理論と実践を結びつける</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-purple-600 dark:text-purple-400 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-800 dark:text-gray-200">柔軟な学習アプローチが得意</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* CTAセクション */}
      <section className="py-16 md:py-24 px-4 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 dark:from-blue-700 dark:via-blue-800 dark:to-indigo-900 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-6 text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            今すぐあなたの英語学習タイプを診断
          </motion.h2>
          <motion.p 
            className="text-lg mb-8 text-white/90 dark:text-white/95 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            たった5分でわかる診断テスト。あなたに最適な英語学習法を見つけて、効率的に上達しましょう！
          </motion.p>
          <motion.button
            onClick={startQuiz}
            className="bg-white text-blue-700 hover:bg-white/90 px-8 py-4 rounded-lg font-semibold text-lg shadow-lg flex items-center mx-auto transition-all duration-300"
            whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)" }}
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
      <footer className="py-10 bg-indigo-950 dark:bg-gray-950 text-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Link href="/" className="text-xl font-bold text-white">英語学習タイプ診断</Link>
            </div>
            <div className="text-sm text-white/80">
              © 2023 英語学習タイプ診断. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 