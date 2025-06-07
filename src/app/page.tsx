'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaArrowRight, FaCheck, FaUsers, FaChalkboardTeacher, FaHeart, FaGift, FaBalanceScale, FaHandHoldingHeart, FaStar } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const startGiverDiagnosis = () => {
    router.push('/auth/signup');
  };

  const exploreContent = () => {
    router.push('/explore');
  };

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* ヒーローセクション */}
      <motion.section 
        className="relative overflow-hidden py-16 md:py-24 px-4 bg-gradient-to-br from-emerald-600 via-teal-700 to-blue-800 dark:from-emerald-800 dark:via-teal-900 dark:to-blue-950 text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* デコレーション要素 */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/30 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-300/40 rounded-full translate-y-1/3 -translate-x-1/3 blur-2xl"></div>
        </div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <span className="bg-white/25 text-white px-4 py-1.5 rounded-full inline-block mb-6 font-medium shadow-sm backdrop-blur-sm">
                🎓 教えて学べるプラットフォーム
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-white">
                <span className="text-yellow-300 dark:text-yellow-200 drop-shadow-sm">教えることで学ぶ</span><br />
                新しい英語学習体験
              </h1>
              <p className="text-white/90 dark:text-white/95 text-lg mb-8 leading-relaxed">
                ShiftWithは「ギバー精神」を育てながら英語力を向上させる<br />
                革新的な学習コミュニティです。あなたの知識を共有し、<br />
                教えることで自分自身も成長しましょう。
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  onClick={startGiverDiagnosis}
                  className="bg-white text-emerald-700 dark:text-emerald-800 hover:bg-white/90 px-8 py-4 rounded-lg font-semibold text-lg shadow-lg flex items-center transition-all duration-300"
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)" }}
                  whileTap={{ scale: 0.95 }}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  ギバー診断を始める
                  <motion.span
                    className="ml-2"
                    animate={{ x: isHovered ? 5 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FaArrowRight />
                  </motion.span>
                </motion.button>
                
                <motion.button
                  onClick={exploreContent}
                  className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 px-6 py-4 rounded-lg font-semibold text-lg shadow-lg flex items-center justify-center transition-all duration-300"
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaUsers className="mr-2" />
                  教材を探索する
                </motion.button>
              </div>
              
              <div className="mt-8 flex items-center text-white text-sm">
                <div className="flex -space-x-2 mr-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-white dark:border-emerald-800 flex items-center justify-center text-white text-xs shadow-md font-bold">G</div>
                  <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white dark:border-emerald-800 flex items-center justify-center text-white text-xs shadow-md font-bold">M</div>
                  <div className="w-8 h-8 rounded-full bg-orange-500 border-2 border-white dark:border-emerald-800 flex items-center justify-center text-white text-xs shadow-md font-bold">T</div>
                </div>
                <span className="text-white/90 dark:text-white/95 font-medium">今週234人がギバー診断を完了</span>
              </div>
            </motion.div>
            
            <motion.div
              className="relative"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-2xl">
                <div className="bg-gradient-to-br from-emerald-600 to-teal-800 dark:from-emerald-700 dark:to-teal-900 absolute inset-0"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center">
                  <FaChalkboardTeacher className="text-6xl mb-4 text-yellow-300" />
                  <h3 className="text-2xl font-bold mb-4 text-white">あなたのギバータイプは？</h3>
                  <p className="mb-6 text-white/90 dark:text-white/95">心理学に基づく診断で、あなたの「教える力」を発見</p>
                  <div className="grid grid-cols-3 gap-2 w-full max-w-md">
                    <div className="bg-white/70 dark:bg-white/80 p-2 rounded-lg shadow-md">
                      <p className="text-xs font-medium text-emerald-900">ギバー</p>
                    </div>
                    <div className="bg-white/70 dark:bg-white/80 p-2 rounded-lg shadow-md">
                      <p className="text-xs font-medium text-emerald-900">マッチャー</p>
                    </div>
                    <div className="bg-white/70 dark:bg-white/80 p-2 rounded-lg shadow-md">
                      <p className="text-xs font-medium text-emerald-900">テイカー</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>
      
      {/* ギバー精神の力セクション */}
      <section className="py-16 md:py-24 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">なぜ「教えること」が最強の学習法なのか</h2>
            <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              心理学の研究で証明された「ギバー効果」。教えることで、あなた自身の学習効果が飛躍的に向上します。
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              className="bg-white dark:bg-gray-750 p-7 rounded-xl shadow-md border border-gray-100 dark:border-gray-700"
              whileHover={{ y: -5, boxShadow: '0 15px 30px rgba(0,0,0,0.1)' }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 rounded-lg flex items-center justify-center mb-5">
                <FaChalkboardTeacher className="text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">記憶定着率が90%向上</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                他人に教えることで、自分の知識が整理され、記憶に深く刻まれます。
              </p>
              <ul className="mt-4 space-y-3">
                <li className="flex items-start">
                  <FaCheck className="text-emerald-600 dark:text-emerald-400 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-800 dark:text-gray-200">教材作成で知識を体系化</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-emerald-600 dark:text-emerald-400 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-800 dark:text-gray-200">説明することで理解が深まる</span>
                </li>
              </ul>
            </motion.div>
            
            <motion.div 
              className="bg-white dark:bg-gray-750 p-7 rounded-xl shadow-md border border-gray-100 dark:border-gray-700"
              whileHover={{ y: -5, boxShadow: '0 15px 30px rgba(0,0,0,0.1)' }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded-lg flex items-center justify-center mb-5">
                <FaUsers className="text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">学習コミュニティの力</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                お互いに教え合うことで、モチベーションが維持され、継続率が大幅に向上します。
              </p>
              <ul className="mt-4 space-y-3">
                <li className="flex items-start">
                  <FaCheck className="text-blue-600 dark:text-blue-400 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-800 dark:text-gray-200">仲間からの感謝でモチベーション向上</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-blue-600 dark:text-blue-400 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-800 dark:text-gray-200">多様な視点から学びを深める</span>
                </li>
              </ul>
            </motion.div>
            
            <motion.div 
              className="bg-white dark:bg-gray-750 p-7 rounded-xl shadow-md border border-gray-100 dark:border-gray-700"
              whileHover={{ y: -5, boxShadow: '0 15px 30px rgba(0,0,0,0.1)' }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 rounded-lg flex items-center justify-center mb-5">
                <FaStar className="text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">ギバースコアで成長実感</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                あなたの貢献度を可視化。教える行動が評価され、成長を実感できます。
              </p>
              <ul className="mt-4 space-y-3">
                <li className="flex items-start">
                  <FaCheck className="text-purple-600 dark:text-purple-400 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-800 dark:text-gray-200">貢献度をリアルタイムで確認</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-purple-600 dark:text-purple-400 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-800 dark:text-gray-200">バッジとポイントで達成感</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* 3つのギバータイプ紹介セクション */}
      <section className="py-16 md:py-24 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">あなたはどのギバータイプ？</h2>
            <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              心理学研究に基づく3つのタイプ。あなたの「教える力」を診断し、最適な学習方法を見つけましょう。
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              className="bg-white dark:bg-gray-800 p-7 rounded-xl border-2 border-emerald-200 dark:border-emerald-800/40 shadow-md"
              whileHover={{ scale: 1.03, boxShadow: "0 15px 30px rgba(0, 0, 0, 0.1)" }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-800 text-white rounded-full flex items-center justify-center mb-6 mx-auto shadow-md">
                <FaGift className="text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center text-gray-900 dark:text-white">ギバー（Giver）</h3>
              <p className="text-gray-700 dark:text-gray-300 text-center mb-4 leading-relaxed">
                積極的に知識を共有し、他者の成長を支援する
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <FaCheck className="text-emerald-600 dark:text-emerald-400 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-800 dark:text-gray-200">教材作成でコミュニティに貢献</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-emerald-600 dark:text-emerald-400 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-800 dark:text-gray-200">フィードバック提供で他者を支援</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-emerald-600 dark:text-emerald-400 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-800 dark:text-gray-200">「教える喜び」でモチベーション維持</span>
                </li>
              </ul>
            </motion.div>
            
            <motion.div 
              className="bg-white dark:bg-gray-800 p-7 rounded-xl border-2 border-blue-200 dark:border-blue-800/40 shadow-md"
              whileHover={{ scale: 1.03, boxShadow: "0 15px 30px rgba(0, 0, 0, 0.1)" }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-800 text-white rounded-full flex items-center justify-center mb-6 mx-auto shadow-md">
                <FaBalanceScale className="text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center text-gray-900 dark:text-white">マッチャー（Matcher）</h3>
              <p className="text-gray-700 dark:text-gray-300 text-center mb-4 leading-relaxed">
                与えることと受け取ることのバランスを重視
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <FaCheck className="text-blue-600 dark:text-blue-400 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-800 dark:text-gray-200">公平な知識交換を好む</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-blue-600 dark:text-blue-400 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-800 dark:text-gray-200">互恵的な学習関係を築く</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-blue-600 dark:text-blue-400 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-800 dark:text-gray-200">コミュニティの調和を大切にする</span>
                </li>
              </ul>
            </motion.div>
            
            <motion.div 
              className="bg-white dark:bg-gray-800 p-7 rounded-xl border-2 border-orange-200 dark:border-orange-800/40 shadow-md"
              whileHover={{ scale: 1.03, boxShadow: "0 15px 30px rgba(0, 0, 0, 0.1)" }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-800 text-white rounded-full flex items-center justify-center mb-6 mx-auto shadow-md">
                <FaHandHoldingHeart className="text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center text-gray-900 dark:text-white">テイカー（Taker）</h3>
              <p className="text-gray-700 dark:text-gray-300 text-center mb-4 leading-relaxed">
                学びを受け取ることから始めて、徐々にギバーへ
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <FaCheck className="text-orange-600 dark:text-orange-400 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-800 dark:text-gray-200">まずは質の高い教材で学習</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-orange-600 dark:text-orange-400 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-800 dark:text-gray-200">コメントやレビューで貢献開始</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-orange-600 dark:text-orange-400 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-800 dark:text-gray-200">段階的にギバー行動を習得</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* CTAセクション */}
      <section className="py-16 md:py-24 px-4 bg-gradient-to-br from-emerald-600 via-teal-700 to-blue-800 dark:from-emerald-700 dark:via-teal-800 dark:to-blue-900 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-6 text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            今すぐShiftWithコミュニティに参加
          </motion.h2>
          <motion.p 
            className="text-lg mb-8 text-white/90 dark:text-white/95 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            あなたのギバータイプを発見し、「教えることで学ぶ」新しい英語学習体験を始めましょう！
          </motion.p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <motion.button
              onClick={startGiverDiagnosis}
              className="bg-white text-emerald-700 hover:bg-white/90 px-8 py-4 rounded-lg font-semibold text-lg shadow-lg flex items-center mx-auto transition-all duration-300"
              whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)" }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              ギバー診断でコミュニティ参加
              <FaArrowRight className="ml-2" />
            </motion.button>
            
            <motion.button
              onClick={exploreContent}
              className="bg-emerald-200 text-emerald-800 hover:bg-emerald-300 px-6 py-4 rounded-lg font-semibold text-lg shadow-lg flex items-center mx-auto transition-all duration-300"
              whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)" }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <FaUsers className="mr-2" />
              教材をのぞいてみる
            </motion.button>
          </div>
        </div>
      </section>
      
      {/* フッター */}
      <footer className="py-10 bg-gray-900 dark:bg-gray-950 text-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Link href="/" className="text-xl font-bold text-white">ShiftWith</Link>
              <p className="text-sm text-gray-400 mt-1">教えることで学べるオンライン学習プラットフォーム</p>
            </div>
            <div className="text-sm text-gray-400">
              © 2024 ShiftWith. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 