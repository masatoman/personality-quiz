'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

const ThemeDemoPage: React.FC = () => {
  const { currentTheme } = useTheme();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="theme-section">
        <h1 className="mb-6">テーマデモ： {currentTheme}</h1>
        <p className="mb-8">右上のドロップダウンメニューからテーマを切り替えて、デザインの変化を確認できます。</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div>
            <h2 className="mb-4">カラーパレット</h2>
            
            <div className="space-y-4">
              <div className="flex flex-col">
                <div className="h-12 bg-primary rounded-t-md flex items-center justify-center text-white font-bold">
                  プライマリ
                </div>
                <div className="h-8 bg-primary-light flex items-center px-4 text-white">
                  primary-light
                </div>
                <div className="h-8 bg-primary-dark flex items-center px-4 text-white rounded-b-md">
                  primary-dark
                </div>
              </div>

              <div className="flex flex-col">
                <div className="h-12 bg-accent rounded-t-md flex items-center justify-center text-white font-bold">
                  アクセント
                </div>
                <div className="h-8 bg-accent-light flex items-center px-4 text-white">
                  accent-light
                </div>
                <div className="h-8 bg-accent-dark flex items-center px-4 text-white rounded-b-md">
                  accent-dark
                </div>
              </div>

              <div className="flex flex-col">
                <div className="h-12 bg-secondary rounded-t-md flex items-center justify-center text-white font-bold">
                  セカンダリ
                </div>
                <div className="h-8 bg-secondary-light flex items-center px-4 text-white">
                  secondary-light
                </div>
                <div className="h-8 bg-secondary-dark flex items-center px-4 text-white rounded-b-md">
                  secondary-dark
                </div>
              </div>

              <div className="flex flex-col">
                <div className="h-12 bg-neutral rounded-t-md flex items-center justify-center text-white font-bold">
                  ニュートラル
                </div>
                <div className="h-8 bg-neutral-light flex items-center px-4 text-white">
                  neutral-light
                </div>
                <div className="h-8 bg-neutral-dark flex items-center px-4 text-white rounded-b-md">
                  neutral-dark
                </div>
              </div>

              <div className="flex flex-col">
                <div className="h-12 bg-base rounded-t-md flex items-center justify-center text-neutral font-bold border border-base-300 border-b-0">
                  ベース
                </div>
                <div className="h-8 bg-base-100 flex items-center px-4 text-neutral border-x border-base-300">
                  base-100
                </div>
                <div className="h-8 bg-base-200 flex items-center px-4 text-neutral border-x border-base-300">
                  base-200
                </div>
                <div className="h-8 bg-base-300 flex items-center px-4 text-neutral rounded-b-md border border-base-300 border-t-0">
                  base-300
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-4">UIコンポーネント</h2>
            
            <div className="space-y-6">
              <div className="theme-card">
                <h3 className="mb-3">ボタン</h3>
                <div className="flex flex-wrap gap-3">
                  <button className="theme-button-primary">
                    プライマリボタン
                  </button>
                  <button className="theme-button-accent">
                    アクセントボタン
                  </button>
                  <button className="theme-button-outline">
                    アウトラインボタン
                  </button>
                </div>
              </div>

              <div className="theme-card">
                <h3 className="mb-3">タグ</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="theme-tag">タグ1</span>
                  <span className="theme-tag">タグ2</span>
                  <span className="theme-tag">タグ3</span>
                </div>
              </div>

              <div className="theme-card">
                <h3 className="mb-3">フォーム要素</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-neutral mb-1">名前</label>
                    <input type="text" className="theme-input" placeholder="名前を入力" />
                  </div>
                  <div>
                    <label className="block text-neutral mb-1">メール</label>
                    <input type="email" className="theme-input" placeholder="メールアドレスを入力" />
                  </div>
                </div>
              </div>

              <div className="theme-card">
                <h3 className="mb-3">テキスト要素</h3>
                <div className="space-y-3">
                  <h4 className="text-primary">見出し（プライマリカラー）</h4>
                  <h4 className="text-accent">見出し（アクセントカラー）</h4>
                  <p>通常のテキスト</p>
                  <p className="text-neutral-light">薄いテキスト</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h2 className="mb-4">ナビゲーション例</h2>
        <div className="theme-nav rounded-lg mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <a href="#" className="theme-nav-link">ホーム</a>
            <a href="#" className="theme-nav-link">シフト表</a>
            <a href="#" className="theme-nav-link">設定</a>
            <a href="#" className="bg-primary px-4 py-2 rounded-full hover:bg-primary-dark ml-auto">新規作成</a>
          </div>
        </div>

        <div className="theme-divider" />

        <h2 className="mb-4">カードレイアウト例</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((num) => (
            <div key={num} className="theme-card">
              <h3 className="text-primary mb-2">シフト #{num}</h3>
              <p className="text-sm text-neutral-light mb-4">2023年10月{num}日</p>
              <div className="mb-4">
                <div className="bg-base-200 rounded-md p-3">
                  <span className="text-neutral-light text-sm">勤務時間:</span>
                  <p className="text-neutral font-medium">9:00 - 17:00</p>
                </div>
              </div>
              <div className="flex justify-end">
                <button className="theme-button-primary text-sm">詳細</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeDemoPage; 