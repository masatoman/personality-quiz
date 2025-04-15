'use client';

import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeTest() {
  const { currentTheme, changeTheme } = useTheme();

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">現在のテーマ: {currentTheme}</h2>
      <div className="flex gap-4" role="group" aria-label="テーマ選択">
        <button
          onClick={() => changeTheme('tealPurpleTheme')}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
          aria-label="ティール＆パープルテーマに切り替え"
          aria-current={currentTheme === 'tealPurpleTheme'}
        >
          ティール＆パープル
        </button>
        <button
          onClick={() => changeTheme('blueAmberTheme')}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
          aria-label="ブルー＆アンバーテーマに切り替え"
          aria-current={currentTheme === 'blueAmberTheme'}
        >
          ブルー＆アンバー
        </button>
        <button
          onClick={() => changeTheme('greenMagentaTheme')}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
          aria-label="グリーン＆マゼンタテーマに切り替え"
          aria-current={currentTheme === 'greenMagentaTheme'}
        >
          グリーン＆マゼンタ
        </button>
      </div>
    </div>
  );
} 