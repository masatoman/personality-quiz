'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaArrowRight, FaUsers, FaHeart, FaBalanceScale, FaSearch, FaBrain, FaTrophy, FaGraduationCap, FaUserFriends, FaCheckCircle } from 'react-icons/fa';

export default function LandingPage() {
  // const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* ヒーローセクション */}
      <motion.section 
        className="relative overflow-hidden py-16 md:py-24 px-4 bg-slate-900 text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto text-center relative z-10">
          {/* バッジ */}
          <motion.div
            className="inline-flex items-center px-4 py-2 rounded-full bg-slate-800/60 border border-slate-600 backdrop-blur-sm text-slate-200 mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <span className="mr-2">🎓</span>
            中学英文法に特化した教え合いアプリ
          </motion.div>

          {/* メインタイトル */}
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-white"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <span className="text-blue-400">中学英文法を教え合いで</span><br />
            完全マスター
          </motion.h1>

          {/* 説明文 */}
          <motion.p 
            className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            みんなで作る文法解説コミュニティ<br />
            「人に教えることで自分も学ぶ」という<br />
            科学的に証明された学習方法で英文法をマスターしましょう！
          </motion.p>

          {/* CTAボタン */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Link href="/materials">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 flex items-center shadow-lg hover:shadow-xl">
                文法教材を見る
                <FaArrowRight className="ml-2" />
              </button>
            </Link>
            
                          <Link href="/materials">
              <button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-slate-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center">
                <FaSearch className="mr-2" />
                文法教材を探す
              </button>
            </Link>
          </motion.div>

          {/* 統計情報 */}
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-6 text-slate-400"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              </div>
              <span className="text-white font-medium">
                {/* TODO: 実際の統計データに置き換える */}
                中学英文法を教え合いで完全マスター
              </span>
            </div>
          </motion.div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 to-slate-800/90"></div>
      </motion.section>

      {/* コミュニティ紹介セクション */}
      <section className="py-16 md:py-24 px-4 bg-gray-50" role="region">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              className="relative"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-2xl">
                <div className="bg-blue-600 absolute inset-0"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                    <FaUserFriends className="text-2xl" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-white">文法解説コミュニティ</h3>
                  <p className="text-blue-100 mb-6">中学英文法をみんなで教え合い、完全マスター</p>
                  
                  <div className="grid grid-cols-3 gap-2 w-full max-w-xs">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                      <p className="font-semibold text-sm text-white">文法解説</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                      <p className="font-semibold text-sm text-white">練習問題</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                      <p className="font-semibold text-sm text-white">相互理解</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-white p-8 rounded-xl border border-gray-200 shadow-lg"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <FaBrain className="text-blue-600 text-xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">コミュニティの価値</h3>
              </div>
              
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <FaCheckCircle className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                  <span>中学英文法を体系的に学習</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                  <span>教えることで自分の理解も深まる</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                  <span>学年別・文法項目別の効率的学習</span>
                </li>
              </ul>

              <Link href="/materials">
                <button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center">
                  文法教材を見る
                  <FaArrowRight className="ml-2" />
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 機能紹介セクション */}
      <section 
        className="py-16 md:py-24 px-4 bg-white"
        role="region"
        aria-labelledby="features-heading"
      >
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h2 id="features-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              中学英文法を教え合いで完全マスター
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              文法項目別・学年別の効率的学習で、中学英文法を確実に身につけましょう。
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* 機能1 */}
            <motion.div 
              className="bg-blue-50 p-8 rounded-xl border border-blue-200 text-center hover:shadow-lg transition-all duration-300"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              whileHover={{ y: -5 }}
            >
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FaBrain className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">文法項目別学習</h3>
              <p className="text-gray-700 mb-6">
                be動詞から関係代名詞まで、中学英文法を体系的に学習できます。
              </p>
              <ul className="text-left space-y-3 text-sm text-gray-700">
                <li className="flex items-center">
                  <FaCheckCircle className="text-blue-500 mr-3 flex-shrink-0" />
                  <span>8つの文法項目に分類</span>
                </li>
                <li className="flex items-center">
                  <FaCheckCircle className="text-blue-500 mr-3 flex-shrink-0" />
                  <span>段階的な学習進度</span>
                </li>
              </ul>
            </motion.div>

            {/* 機能2 */}
            <motion.div 
              className="bg-green-50 p-8 rounded-xl border border-green-200 text-center hover:shadow-lg transition-all duration-300"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              whileHover={{ y: -5 }}
            >
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FaUsers className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">学年別レベル対応</h3>
              <p className="text-gray-700 mb-6">
                中1〜中3の学年レベルに合わせた教材で、無理なく学習を進められます。
              </p>
              <ul className="text-left space-y-3 text-sm text-gray-700">
                <li className="flex items-center">
                  <FaCheckCircle className="text-green-500 mr-3 flex-shrink-0" />
                  <span>学年に応じた難易度調整</span>
                </li>
                <li className="flex items-center">
                  <FaCheckCircle className="text-green-500 mr-3 flex-shrink-0" />
                  <span>基礎から応用まで段階的学習</span>
                </li>
              </ul>
            </motion.div>

            {/* 機能3 */}
            <motion.div 
              className="bg-yellow-50 p-8 rounded-xl border border-yellow-200 text-center hover:shadow-lg transition-all duration-300"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              whileHover={{ y: -5 }}
            >
              <div className="w-16 h-16 bg-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FaTrophy className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">教え合いで理解深化</h3>
              <p className="text-gray-700 mb-6">
                教えることで自分の理解も深まり、記憶定着率が大幅に向上します。
              </p>
              <ul className="text-left space-y-3 text-sm text-gray-700">
                <li className="flex items-center">
                  <FaCheckCircle className="text-yellow-600 mr-3 flex-shrink-0" />
                  <span>説明することで理解が深まる</span>
                </li>
                <li className="flex items-center">
                  <FaCheckCircle className="text-yellow-600 mr-3 flex-shrink-0" />
                  <span>記憶定着率90%向上</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 学習方法紹介セクション */}
      <section className="py-16 md:py-24 px-4 bg-gray-50" role="region">
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              中学英文法の学習方法
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              文法項目別・学年別の効率的学習で、中学英文法を確実にマスター
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* 教材作成 */}
            <motion.div 
              className="bg-white p-8 rounded-xl border border-blue-200 shadow-lg text-center hover:shadow-xl transition-all duration-300"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              whileHover={{ y: -8 }}
            >
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaHeart className="text-3xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">文法解説作成</h3>
              <p className="text-gray-700 mb-6">
                自分の理解を整理して文法解説を作成し、他の学習者を支援
              </p>
              <ul className="text-left space-y-3 text-sm text-gray-700">
                <li className="flex items-center">
                  <FaCheckCircle className="text-blue-500 mr-3 flex-shrink-0" />
                  <span>文法知識の体系化</span>
                </li>
                <li className="flex items-center">
                  <FaCheckCircle className="text-blue-500 mr-3 flex-shrink-0" />
                  <span>例文と解説で理解促進</span>
                </li>
                <li className="flex items-center">
                  <FaCheckCircle className="text-blue-500 mr-3 flex-shrink-0" />
                  <span>コミュニティへの貢献</span>
                </li>
              </ul>
            </motion.div>

            {/* 学習支援 */}
            <motion.div 
              className="bg-white p-8 rounded-xl border border-green-200 shadow-lg text-center hover:shadow-xl transition-all duration-300"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              whileHover={{ y: -8 }}
            >
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaBalanceScale className="text-3xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">練習問題作成</h3>
              <p className="text-gray-700 mb-6">
                文法項目に応じた練習問題を作成し、理解度を確認
              </p>
              <ul className="text-left space-y-3 text-sm text-gray-700">
                <li className="flex items-center">
                  <FaCheckCircle className="text-green-500 mr-3 flex-shrink-0" />
                  <span>文法項目別の問題作成</span>
                </li>
                <li className="flex items-center">
                  <FaCheckCircle className="text-green-500 mr-3 flex-shrink-0" />
                  <span>学年レベルに応じた難易度</span>
                </li>
                <li className="flex items-center">
                  <FaCheckCircle className="text-green-500 mr-3 flex-shrink-0" />
                  <span>理解度の確認と定着</span>
                </li>
              </ul>
            </motion.div>

            {/* 段階的成長 */}
            <motion.div 
              className="bg-white p-8 rounded-xl border border-orange-200 shadow-lg text-center hover:shadow-xl transition-all duration-300"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              whileHover={{ y: -8 }}
            >
              <div className="w-20 h-20 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaGraduationCap className="text-3xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">段階的マスター</h3>
              <p className="text-gray-700 mb-6">
                基礎から応用まで、段階的に中学英文法を完全マスター
              </p>
              <ul className="text-left space-y-3 text-sm text-gray-700">
                <li className="flex items-center">
                  <FaCheckCircle className="text-orange-500 mr-3 flex-shrink-0" />
                  <span>中1レベルから順次学習</span>
                </li>
                <li className="flex items-center">
                  <FaCheckCircle className="text-orange-500 mr-3 flex-shrink-0" />
                  <span>文法項目別の理解確認</span>
                </li>
                <li className="flex items-center">
                  <FaCheckCircle className="text-orange-500 mr-3 flex-shrink-0" />
                  <span>完全マスターへの道筋</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 最終CTA */}
      <section className="py-16 md:py-24 px-4 bg-slate-900 text-white" role="region">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              今すぐ中学英文法を教え合いでマスター
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              文法項目別・学年別の効率的学習で、中学英文法を確実に身につけましょう！
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/materials">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 flex items-center shadow-lg hover:shadow-xl">
                  文法教材を見て学習開始
                  <FaArrowRight className="ml-2" />
                </button>
              </Link>
              
              <Link href="/materials">
                <button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-slate-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center">
                  <FaSearch className="mr-2" />
                  文法教材を探してみる
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-black text-slate-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <Link href="/" className="text-2xl font-bold text-white mb-2 block hover:text-blue-300 transition-colors">
                ShiftWith
              </Link>
              <p className="text-slate-400">
                中学英文法を教え合いで完全マスター
              </p>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-slate-500">
                © 2024 ShiftWith. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 