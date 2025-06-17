'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FaRocket, FaBookOpen, FaTrophy, FaArrowRight, FaUserGraduate, FaLightbulb, FaUsers } from 'react-icons/fa';

const WelcomeClient = () => {
  const searchParams = useSearchParams();
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  useEffect(() => {
    setIsFirstLogin(searchParams.get('first_login') === 'true');
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            ShiftWithへようこそ！
          </h1>
          {isFirstLogin && (
            <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-6 inline-block">
              <p className="text-green-800 font-semibold">
                ✅ アカウント作成が完了しました！
              </p>
            </div>
          )}
          <p className="text-xl text-gray-600 mb-8">
            「教えることで学ぶ」新しい学習体験を始めましょう
          </p>
        </div>

        {/* ShiftWithとは？ */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            <FaLightbulb className="inline mr-2 text-yellow-500" />
            ShiftWithとは？
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FaBookOpen className="text-2xl text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">学習教材を作成</h3>
              <p className="text-sm text-gray-600">
                自分の知識を教材にまとめることで、より深く理解できます
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FaUsers className="text-2xl text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">コミュニティで共有</h3>
              <p className="text-sm text-gray-600">
                作った教材を共有し、他の人からフィードバックを受けられます
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FaTrophy className="text-2xl text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">成長を実感</h3>
              <p className="text-sm text-gray-600">
                ギバースコアで自分の貢献度と成長を可視化できます
              </p>
            </div>
          </div>
        </div>

        {/* 次のステップ */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            <FaRocket className="inline mr-2 text-orange-500" />
            さっそく始めてみましょう！
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Link 
              href="/create" 
              className="group block bg-blue-50 hover:bg-blue-100 rounded-xl p-6 transition-colors border-2 border-transparent hover:border-blue-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">
                    1. 教材を作ってみる
                  </h3>
                  <p className="text-sm text-blue-600 mb-4">
                    まずは簡単な教材を作って「教えることで学ぶ」を体験
                  </p>
                  <div className="text-xs text-blue-500">
                    ⏱️ 約5-10分で完了
                  </div>
                </div>
                <FaArrowRight className="text-blue-600 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link 
              href="/explore" 
              className="group block bg-green-50 hover:bg-green-100 rounded-xl p-6 transition-colors border-2 border-transparent hover:border-green-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    2. 他の教材を見る
                  </h3>
                  <p className="text-sm text-green-600 mb-4">
                    コミュニティの教材を見て学習のヒントを得る
                  </p>
                  <div className="text-xs text-green-500">
                    ⏱️ いつでも気軽に
                  </div>
                </div>
                <FaArrowRight className="text-green-600 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>

        {/* 効果説明 */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl text-white p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">
            なぜ「教えることで学ぶ」のか？
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">📈 記憶定着率が90%向上</h3>
              <p className="text-sm opacity-90">
                ただ覚えるより、教材として整理することで長期記憶に定着します
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">🧠 理解度が深まる</h3>
              <p className="text-sm opacity-90">
                人に説明するために、自分の理解の曖昧な部分が明確になります
              </p>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="text-center">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
          >
            <FaUserGraduate className="mr-2" />
            スキップしてホームへ
          </Link>
          <p className="text-sm text-gray-500 mt-4">
            後からでも設定や確認ができます
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeClient; 