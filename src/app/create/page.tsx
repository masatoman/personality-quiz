import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function CreateMaterialPage() {
  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex items-center mb-6">
        <Link href="/my-materials" className="mr-2 text-gray-500 hover:text-gray-700">
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">教材を作成する</h1>
      </div>
      
      <div className="mb-8">
        <p className="text-gray-600">作成したい教材のタイプを選択してください。作成後も編集可能です。</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 標準教材 */}
        <Link 
          href="/create/standard/basic-info"
          className="flex flex-col bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition duration-200 overflow-hidden h-full"
        >
          <div className="bg-blue-50 p-4 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">📚</span>
            </div>
            <h2 className="text-xl font-bold text-blue-700">標準教材</h2>
          </div>
          
          <div className="p-4 flex-grow">
            <h3 className="font-medium mb-2">テキスト、画像、動画、クイズなどを自由に組み合わせた教材を作成</h3>
            <ul className="text-gray-600 space-y-2">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>豊富なセクションタイプ</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>ドラッグ＆ドロップで並べ替え</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>詳細な公開設定と対象者設定</span>
              </li>
            </ul>
          </div>
          
          <div className="p-4 border-t border-gray-100">
            <div className="text-blue-500 font-medium">選択して始める →</div>
          </div>
        </Link>
        
        {/* クイズ教材 */}
        <Link 
          href="/create/quiz"
          className="flex flex-col bg-white rounded-lg border border-gray-200 hover:border-purple-400 hover:shadow-md transition duration-200 overflow-hidden h-full"
        >
          <div className="bg-purple-50 p-4 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">❓</span>
            </div>
            <h2 className="text-xl font-bold text-purple-700">クイズ教材</h2>
          </div>
          
          <div className="p-4 flex-grow">
            <h3 className="font-medium mb-2">シンプルな選択式クイズで素早く学習内容の定着を確認</h3>
            <ul className="text-gray-600 space-y-2">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>多肢選択問題の簡単作成</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>即時フィードバック</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>結果の自動集計と分析</span>
              </li>
            </ul>
          </div>
          
          <div className="p-4 border-t border-gray-100">
            <div className="text-purple-500 font-medium">選択して始める →</div>
          </div>
        </Link>
        
        {/* 単語帳 */}
        <Link 
          href="/create/flashcards"
          className="flex flex-col bg-white rounded-lg border border-gray-200 hover:border-green-400 hover:shadow-md transition duration-200 overflow-hidden h-full"
        >
          <div className="bg-green-50 p-4 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">🔤</span>
            </div>
            <h2 className="text-xl font-bold text-green-700">単語帳</h2>
          </div>
          
          <div className="p-4 flex-grow">
            <h3 className="font-medium mb-2">効率的な語彙学習のための単語カードセットを作成</h3>
            <ul className="text-gray-600 space-y-2">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>表裏のある単語カード</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>スペースド・リペティション学習</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>音声付きオプション</span>
              </li>
            </ul>
          </div>
          
          <div className="p-4 border-t border-gray-100">
            <div className="text-green-500 font-medium">選択して始める →</div>
          </div>
        </Link>
        
        {/* 会話練習 */}
        <Link 
          href="/create/conversation"
          className="flex flex-col bg-white rounded-lg border border-gray-200 hover:border-orange-400 hover:shadow-md transition duration-200 overflow-hidden h-full"
        >
          <div className="bg-orange-50 p-4 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">💬</span>
            </div>
            <h2 className="text-xl font-bold text-orange-700">会話練習</h2>
          </div>
          
          <div className="p-4 flex-grow">
            <h3 className="font-medium mb-2">現実的な会話シナリオを通じて実践的な言語スキルを向上</h3>
            <ul className="text-gray-600 space-y-2">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>シチュエーション別会話例</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>発音フィードバック機能</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>ロールプレイ練習</span>
              </li>
            </ul>
          </div>
          
          <div className="p-4 border-t border-gray-100">
            <div className="text-orange-500 font-medium">選択して始める →</div>
          </div>
        </Link>
      </div>
      
      <div className="mt-10 bg-blue-50 p-6 rounded-lg">
        <h2 className="font-bold text-lg mb-2">ヒント：より効果的な教材のために</h2>
        <p className="text-gray-700 mb-4">
          ユーザーのギバースコアは、教材の作成や質の高いフィードバックの提供によって向上します。
          質の高い教材を作成すると、より多くのポイントが獲得でき、プラットフォーム内での評価も高まります。
        </p>
        <Link href="/help/material-creation-guide" className="text-blue-600 hover:text-blue-800 font-medium">
          教材作成ガイドを読む →
        </Link>
      </div>
    </div>
  );
} 